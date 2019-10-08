const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");
const SpittingProjectile = require("./spitting_projectile.js");

class Spitting extends MovieClip {
    constructor(x, y, nodes, friendly, script) {
        super({
            idle: { frames: game.resources.sprites["animations_32px_enemy_spitting_run"], speed: 0.15 },
            charge: { frames: game.resources.sprites["animations_32px_enemy_spitting_charging"], speed: 0.15 },
            attack: { frames: [game.resources.sprites["animations_32px_enemy_spitting_attack_0"]], speed: 0.15, loop: false },
        }, "idle");

        this.anchor.set(0.5, 1);
        this.x = x;
        this.y = y;
        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({x: x, y: y});
        this.current_node = 0;
        this.play();
        this.attack_cooldown = 0;
        this.prepare_timeout = 0;

        this.friendly = friendly;
        this.script = script;

        this.bounds = {
            width: game.config.spitting.width,
            height: game.config.spitting.height,
        };
    }

    update_spitting(elapsed) {
        let is_walking = this.attack_cooldown <= 0;
        let force_calm = false;

        if (this.script.length > 0) {
            if (game.scripts.hasOwnProperty(this.script)) {
                if (game.scripts[this.script](this, elapsed)) {
                    is_walking = false;
                }
            } else {
                console.error(`Invalid script "${this.script}"!`);
            }
        }

        this.attack_cooldown -= elapsed;
        if (!game.player.dead) {
            if (!this.friendly && this.attack_cooldown <= 0) {
                const this_x = this.x;
                const this_y = this.y - game.config.spitting.height / 2;
                const player_x = game.player.x + game.player.bounds.width / 2 + game.player.horizontal_speed * game.config.spitting.prediction_seconds;
                const player_y = game.player.y + game.player.bounds.height / 2 + (game.player.previous_y - game.player.y) * game.config.spitting.prediction_seconds;
                const distance = Math.sqrt((this_x - player_x) * (this_x - player_x) + (this_y - player_y) * (this_y - player_y));
                if (distance > 1e-5 && distance < game.config.spitting.max_shooting_distance) {
                    let success = true;
                    let middle_x, middle_y;
                    let total_distance = 0;

                    const angle = Math.atan2(player_y - this_y, player_x - this_x);
                    const straigh_shoot = Physics.raycast(game.player, this_x, this_y, player_x, player_y);
                    if (straigh_shoot && (Math.abs(angle) < game.config.spitting.bezier_angle || Math.abs(angle) > Math.PI - game.config.spitting.bezier_angle)) {
                        const center_x = (this_x + player_x) / 2;
                        const center_y = (this_y + player_y) / 2;
                        const vector_x = (this_x - player_x) / distance;
                        const vector_y = (this_y - player_y) / distance;
                        if (vector_x < 0) {
                            middle_x = center_x - vector_y * game.config.spitting.bezier_height;
                            middle_y = center_y + vector_x * game.config.spitting.bezier_height;
                        } else {
                            middle_x = center_x + vector_y * game.config.spitting.bezier_height;
                            middle_y = center_y - vector_x * game.config.spitting.bezier_height;
                        }

                        let previous_bezier_x = this_x;
                        let previous_bezier_y = this_y;
                        for (let t = 0.25; t <= 1; t += 0.25) {
                            const bezier_x = (1 - t) * (1 - t) * this_x + 2 * t * (1 - t) * middle_x + t * t * player_x;
                            const bezier_y = (1 - t) * (1 - t) * this_y + 2 * t * (1 - t) * middle_y + t * t * player_y;
                            if (Physics.raycast(game.player, previous_bezier_x, previous_bezier_y, bezier_x, bezier_y)) {
                                success = false;
                                break;
                            }
                            total_distance += Math.sqrt((bezier_x - previous_bezier_x) * (bezier_x - previous_bezier_x) + (bezier_y - previous_bezier_y) * (bezier_y - previous_bezier_y));
                            previous_bezier_x = bezier_x;
                            previous_bezier_y = bezier_y;
                        }
                    } else {
                        if (angle < 0 && !(Math.abs(angle) < game.config.spitting.bezier_angle || Math.abs(angle) > Math.PI - game.config.spitting.bezier_angle)) {
                            success = false;
                            is_walking = false;
                            force_calm = true;
                        } else {
                            middle_x = (this_x + player_x) / 2;
                            middle_y = (this_y + player_y) / 2;
                            total_distance = Math.sqrt((this_x - player_x) * (this_x - player_x) + (this_y - player_y) * (this_y - player_y));
                            success = !straigh_shoot;
                        }
                    }

                    if (success) {
                        is_walking = false;

                        if (player_x < this_x) {
                            this.scale.x = -1;
                        } else {
                            this.scale.x = 1;
                        }

                        if (this.prepare_timeout >= game.config.spitting.prepare_timeout) {
                            const spitting_projectile = new SpittingProjectile(this_x, this_y, middle_x, middle_y, player_x, player_y, total_distance);
                            game.spitting_projectiles.push(spitting_projectile);
                            game.containers.entities.addChild(spitting_projectile);

                            this.attack_cooldown = game.config.spitting.projectile_cooldown;
                            this.prepare_timeout = 0;

                            game.resources.sounds["Laser_Shoot8"].play();
                        } else {
                            this.prepare_timeout += elapsed;
                        }
                    }
                }
            }

            if (Physics.aabb(this.x - game.config.spitting.width / 2 - 6, this.y - game.config.spitting.height, game.config.spitting.width + 12, game.config.spitting.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                if (game.player.previous_y + game.player.bounds.height < this.y - game.config.spitting.height && game.player.y + game.player.bounds.height >= this.y - game.config.spitting.height) {
                    game.player.vertical_speed = -250;

                    if (!this.friendly) {
                        game.spittings.splice(game.spittings.indexOf(this), 1);
                        this.parent.removeChild(this);

                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                        effect.x = this.x;
                        effect.y = this.y - game.config.spitting.height / 2;
                        effect.anchor.set(0.5, 0.5);
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function () {
                            game.containers.effects.removeChild(effect);
                        };
                        game.containers.effects.addChild(effect);

                        game.resources.sounds["Explosion4"].play();
                    } else {
                        // TODO: Ouch!
                    }
                } else {
                    if (Physics.aabb(this.x - game.config.spitting.width / 2, this.y - game.config.spitting.height, game.config.spitting.width, game.config.spitting.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                        if (!this.friendly) {
                            game.player.murder();
                        }
                    }
                }
            }
        }

        if (is_walking || force_calm) {
            this.gotoAndPlay("idle");

            const next_node = (this.current_node + 1) % this.nodes.length;
            if (this.x < this.nodes[next_node].x) {
                this.x = Math.min(this.x + game.config.spitting.speed * elapsed, this.nodes[next_node].x);
                this.scale.x = 1;
            } else {
                this.x = Math.max(this.x - game.config.spitting.speed * elapsed, this.nodes[next_node].x);
                this.scale.x = -1;
            }
            if (Math.abs(this.x - this.nodes[next_node].x) < 1e-5) {
                this.current_node = next_node;
            }
            this.prepare_timeout = 0;
        } else {
            if (this.attack_cooldown <= 0 && this.prepare_timeout < game.config.spitting.prepare_timeout) {
                if (this.animation !== "charge") {
                    this.gotoAndPlay("charge");
                }
            } else {
                if (this.attack_cooldown < game.config.spitting.projectile_cooldown - 0.2) {
                    this.gotoAndPlay("idle");
                } else {
                    this.gotoAndPlay("attack");
                }
            }
        }

        if (!this.friendly && game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.spitting.width / 2, this.y - game.config.spitting.height, game.config.spitting.width, game.config.spitting.height);

            const this_x = this.x;
            const this_y = this.y - game.config.spitting.height / 2;
            const player_x = game.player.x + game.player.bounds.width / 2 + game.player.horizontal_speed * game.config.spitting.prediction_seconds;
            const player_y = game.player.y + game.player.bounds.height / 2 + (game.player.previous_y - game.player.y) * game.config.spitting.prediction_seconds;
            const distance = Math.sqrt((this_x - player_x) * (this_x - player_x) + (this_y - player_y) * (this_y - player_y));
            if (distance > 1e-5 && distance < game.config.spitting.max_shooting_distance) {
                const angle = Math.atan2(player_y - this_y, player_x - this_x);
                const straigh_shoot = Physics.raycast(game.player, this_x, this_y, player_x, player_y);
                if (straigh_shoot && (Math.abs(angle) < game.config.spitting.bezier_angle || Math.abs(angle) > Math.PI - game.config.spitting.bezier_angle)) {
                    game.containers.hitboxes.lineStyle(1, 0xCCCCCC, 1);
                    game.containers.hitboxes.moveTo(this_x, this_y);
                    game.containers.hitboxes.lineTo(player_x, player_y);

                    const center_x = (this_x + player_x) / 2;
                    const center_y = (this_y + player_y) / 2;
                    const vector_x = (this_x - player_x) / distance;
                    const vector_y = (this_y - player_y) / distance;
                    game.containers.hitboxes.moveTo(center_x, center_y);

                    let middle_x, middle_y;
                    if (vector_x < 0) {
                        middle_x = center_x - vector_y * game.config.spitting.bezier_height;
                        middle_y = center_y + vector_x * game.config.spitting.bezier_height;
                    } else {
                        middle_x = center_x + vector_y * game.config.spitting.bezier_height;
                        middle_y = center_y - vector_x * game.config.spitting.bezier_height;
                    }
                    game.containers.hitboxes.lineTo(middle_x, middle_y);

                    game.containers.hitboxes.moveTo(this_x, this_y);
                    game.containers.hitboxes.lineTo(middle_x, middle_y);
                    game.containers.hitboxes.lineTo(player_x, player_y);

                    game.containers.hitboxes.moveTo(this_x, this_y);

                    let previous_bezier_x = this_x;
                    let previous_bezier_y = this_y;
                    for (let t = 0.25; t <= 1; t += 0.25) {
                        const bezier_x = (1 - t) * (1 - t) * this_x + 2 * t * (1 - t) * middle_x + t * t * player_x;
                        const bezier_y = (1 - t) * (1 - t) * this_y + 2 * t * (1 - t) * middle_y + t * t * player_y;

                        if (Physics.raycast(game.player, previous_bezier_x, previous_bezier_y, bezier_x, bezier_y)) {
                            game.containers.hitboxes.lineStyle(1, 0xFF00FF, 1);
                        } else {
                            game.containers.hitboxes.lineStyle(1, 0xFFFF00, 1);
                        }

                        game.containers.hitboxes.lineTo(bezier_x, bezier_y);

                        previous_bezier_x = bezier_x;
                        previous_bezier_y = bezier_y;
                    }
                } else {
                    if (straigh_shoot) {
                        game.containers.hitboxes.lineStyle(1, 0xFF00FF, 1);
                    } else {
                        game.containers.hitboxes.lineStyle(1, 0xFFFF00, 1);
                    }

                    game.containers.hitboxes.moveTo(this_x, this_y);
                    game.containers.hitboxes.lineTo(player_x, player_y);
                }
            }

            game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);
        }
    }
}

module.exports = Spitting;
