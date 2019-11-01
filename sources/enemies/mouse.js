"use strict";

const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");

class Mouse extends MovieClip {
    constructor(x, y, nodes, friendly, script) {
        super({
            run: { frames: game.resources.sprites["animations_32px_enemy_mouse_run"], speed: 0.15},
            rush: { frames: game.resources.sprites["animations_32px_enemy_mouse_run"], speed: 0.4},
        }, "run");

        this.anchor.set(0.5, 1);
        this.x = x;
        this.y = y;
        this.nodes = nodes ? nodes.slice() : [];
        while (this.nodes.length < 2) {
            this.nodes.unshift({x: x, y: y});
        }
        this.current_node = 0;
        this.play();

        this.friendly = friendly;
        this.script = script;

        this.from = Math.min(this.nodes[0].x, this.nodes[1].x);
        this.to = Math.max(this.nodes[0].x, this.nodes[1].x);
        this.is_attacking = 0;
        this.state_color = 0xFFFFFF;
        this.is_grounded_counter = 0;
        this.attack_charge = 0;

        this.bounds = {
            width: game.config.mouse.width,
            height: game.config.mouse.height,
        };
    }

    update_mouse(elapsed) {
        if (this.script.length > 0) {
            if (game.scripts.hasOwnProperty(this.script)) {
                game.scripts[this.script](this, elapsed);
            } else {
                console.error(`Invalid script "${this.script}"!`);
            }
        }

        let calm_walk = true;

        this.state_color = 0xFFFFFF;

        const old_attack_charge = this.attack_charge;
        this.attack_charge = 0;

        if (!this.friendly && !game.player.dead) {
            const player_y = game.player.y + game.player.bounds.height / 2;
            if (player_y < this.y - game.config.mouse.height / 2) {
                const this_y = this.y - game.config.mouse.height / 2;
                const player_x = game.player.x + game.player.bounds.width / 2;
                const distance = Math.sqrt((this.x - player_x) * (this.x - player_x) + (this_y - player_y) * (this_y - player_y));
                if (distance < game.config.mouse.max_prediction_distance) {
                    if (!Physics.raycast(game.player, this.x, this.y - game.config.mouse.height / 2, player_x, player_y)) {
                        if (!game.player.is_grounded) {
                            let player_x_from = player_x - game.config.mouse.predictable_max_player_jump_distance;
                            let player_x_to = player_x + game.config.mouse.predictable_max_player_jump_distance;
                            if (this.x >= player_x_from && this.x <= player_x_to) {
                                if (Math.abs(this.x - player_x_from) < Math.abs(this.x - player_x_to) && this.from < player_x_from - game.config.mouse.width) {
                                    this.x = Math.max(this.x - game.config.mouse.rush_speed * elapsed, this.from);
                                    this.scale.x = -1;
                                    calm_walk = false;

                                    if (this.nodes[0].x < this.nodes[1].x) {
                                        this.current_node = 1;
                                    } else {
                                        this.current_node = 0;
                                    }
                                } else {
                                    this.x = Math.min(this.x + game.config.mouse.rush_speed * elapsed, this.to);
                                    this.scale.x = 1;
                                    calm_walk = false;

                                    if (this.nodes[0].x < this.nodes[1].x) {
                                        this.current_node = 0;
                                    } else {
                                        this.current_node = 1;
                                    }
                                }

                                this.state_color = 0xFF0000;
                            } else {
                                player_x_from = player_x - game.config.mouse.dangerous_max_player_jump_distance;
                                player_x_to = player_x + game.config.mouse.dangerous_max_player_jump_distance;
                                if (this.x >= player_x_from && this.x <= player_x_to) {
                                    if (player_x > this.x) {
                                        if (this.nodes[0].x < this.nodes[1].x) {
                                            this.current_node = 1;
                                        } else {
                                            this.current_node = 0;
                                        }

                                        this.state_color = 0xFFFF00;
                                    } else {
                                        if (this.nodes[0].x < this.nodes[1].x) {
                                            this.current_node = 0;
                                        } else {
                                            this.current_node = 1;
                                        }

                                        this.state_color = 0xFF00FF;
                                    }
                                }
                            }
                        } else {
                            if (this.is_attacking === 0 && player_x >= this.from - game.config.tile_size && player_x <= this.to + game.config.tile_size && player_y > this.y - game.config.mouse.attack_height) {
                                this.attack_charge = old_attack_charge;
                                if (this.attack_charge >= 0.6) {
                                    if (player_x > this.x) {
                                        this.is_attacking = 1;
                                    } else {
                                        this.is_attacking = -1;
                                    }
                                    this.attack_charge = 0;
                                } else {
                                    this.attack_charge += elapsed;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!game.player.dead) {
            if (Physics.aabb(this.x - game.config.mouse.width / 2 - 6, this.y - game.config.mouse.height, game.config.mouse.width + 12, game.config.mouse.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                if (game.player.previous_y + game.player.bounds.height < this.y - game.config.mouse.height && game.player.y + game.player.bounds.height >= this.y - game.config.mouse.height) {
                    game.player.vertical_speed = -250;

                    if (!this.friendly) {
                        game.mice.splice(game.mice.indexOf(this), 1);

                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                        effect.x = this.x;
                        effect.y = this.y - game.config.mouse.height / 2;
                        effect.anchor.set(0.5, 0.5);
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function() {
                            effect.destroy();
                        };
                        game.containers.effects.addChild(effect);

                        game.resources.sounds["Explosion4"].play();

                        game.stats.kills++;

                        this.destroy();
                        return;
                    } else {
                        // TODO: Ouch!
                    }
                } else {
                    if (Physics.aabb(this.x - game.config.mouse.width / 2, this.y - game.config.mouse.height, game.config.mouse.width, game.config.mouse.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                        if (!this.friendly) {
                            game.player.murder();
                        }
                    }
                }
            }
        }

        if (calm_walk) {
            if (this.is_attacking === 1) {
                this.gotoAndPlay("rush");

                this.state_color = 0x0000FF;
                this.x = Math.min(this.x + game.config.mouse.attack_speed * elapsed, this.to);
                this.scale.x = 1;
                calm_walk = false;

                if (Math.abs(this.x - this.to) < 1e-5) {
                    this.is_attacking = 0;
                }
            } else if (this.is_attacking === -1) {
                this.gotoAndPlay("rush");

                this.state_color = 0x0000FF;
                this.x = Math.max(this.x - game.config.mouse.attack_speed * elapsed, this.from);
                this.scale.x = -1;
                calm_walk = false;

                if (Math.abs(this.x - this.from) < 1e-5) {
                    this.is_attacking = 0;
                }
            } else {
                this.gotoAndPlay("run");

                const next_node = (this.current_node + 1) % this.nodes.length;
                if (this.x < this.nodes[next_node].x) {
                    this.x = Math.min(this.x + game.config.mouse.speed * elapsed, this.nodes[next_node].x);
                    this.scale.x = 1;
                } else {
                    this.x = Math.max(this.x - game.config.mouse.speed * elapsed, this.nodes[next_node].x);
                    this.scale.x = -1;
                }
                if (Math.abs(this.x - this.nodes[next_node].x) < 1e-5) {
                    this.current_node = next_node;
                }
            }
        } else {
            this.gotoAndPlay("rush");
        }

        if (this.is_grounded_counter > 13) {
            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_dust_ground"]);
            effect.x = this.x;
            effect.y = this.y - 16;
            effect.anchor.set(0.5, 0.5);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                effect.destroy();
            };
            game.containers.effects.addChild(effect);

            this.is_grounded_counter = 0;
        } else {
            this.is_grounded_counter++;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.lineStyle(1, this.state_color, 1);
            game.containers.hitboxes.drawRect(this.x - game.config.mouse.width / 2, this.y - game.config.mouse.height, game.config.mouse.width, game.config.mouse.height);

            if (!this.friendly && !game.player.dead) {
                const player_x = game.player.x + game.player.bounds.width / 2;
                const player_y = game.player.y + game.player.bounds.height / 2;
                const this_y = this.y - game.config.mouse.height / 2;
                const distance = Math.sqrt((this.x - player_x) * (this.x - player_x) + (this_y - player_y) * (this_y - player_y));

                if (distance < game.config.mouse.max_prediction_distance) {
                    if (Physics.raycast(game.player, this.x, this_y, player_x, player_y)) {
                        game.containers.hitboxes.lineStyle(1, 0xFF00FF, 1);
                    } else {
                        game.containers.hitboxes.lineStyle(1, 0xFFFF00, 1);
                    }

                    game.containers.hitboxes.moveTo(this.x, this.y - game.config.mouse.height / 2);
                    game.containers.hitboxes.lineTo(game.player.x + game.player.bounds.width / 2, game.player.y + game.player.bounds.height / 2);
                    game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);
                }
            }
        }
    }
}

module.exports = Mouse;
