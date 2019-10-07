(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Altar extends PIXI.Container {
    constructor(x, y, next_level, item) {
        super();

        this.x = x;
        this.y = y;
        this.next_level = next_level;
        this.item_num = item;

        const altar = new PIXI.Sprite(game.resources.sprites["altar"]);
        this.addChild(altar);

        this.item = new PIXI.Sprite(game.resources.sprites["artifact_" + item]);
        this.item.visible = false;
        this.item.x = 8;
        this.addChild(this.item);

        this.timeout = null;
    }

    update_altar(elapsed) {
        if (!game.player.dead) {
            const force_next_level = game.input.is_key_down("ShiftLeft") && game.input.is_key_pressed("Digit9");
            if (force_next_level || (game.player.x + game.player.bounds.width / 2 > this.x && game.player.x + game.player.bounds.width / 2 < this.x + game.config.tile_size * 2 && game.player.y + game.player.bounds.height / 2 > this.y && game.player.y + game.player.bounds.height / 2 < this.y + game.config.tile_size * 2)) {
                if (this.timeout == null) {
                    this.item.visible = true;
                    this.timeout = 1;

                    for (let i = 0; i < 5; i++) {
                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_coin_flash"]);
                        effect.x = this.x + 8 + Math.random() * 20 - 10;
                        effect.y = this.y + 2 + Math.random() * 20 - 10;
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function () {
                            game.containers.front_effects.removeChild(effect);
                        };
                        game.containers.front_effects.addChild(effect);
                    }

                    game.resources.sounds["Pickup_Coin9"].play();
                }
            }
            if (this.timeout && this.timeout > 0) {
                this.timeout -= elapsed;
                if (this.timeout <= 0) {
                    return this.next_level;
                }
            }
        }
        return null;
    }
}

module.exports = Altar;

},{}],2:[function(require,module,exports){
const MovieClip = require("./movie_clip.js");
const Physics = require("./physics.js");

class BlockFalling extends PIXI.Sprite {
    constructor(x, y) {
        super(game.resources.sprites["block_falling"]);

        this.x = x;
        this.y = y;
        this.original_x = x;
        this.original_y = y;
        this.destroy_timeout = null;
        this.respawn_timeout = null;
    }

    update_block_falling(elapsed) {
        if (this.destroy_timeout == null) {
            if (!game.player.dead) {
                if (Physics.aabb(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height, this.x - 1e-1, this.y - 1e-1, game.config.tile_size + 2e-1, game.config.tile_size + 2e-1)) {
                    this.destroy_timeout = game.config.block_falling.destroy_timeout;

                    game.resources.sounds["block_unstable"].play();
                }
            }

            if (game.draw_hitboxes) {
                game.containers.hitboxes.drawRect(this.x, this.y, game.config.tile_size, game.config.tile_size);
            }
        } else {
            if (this.respawn_timeout == null) {
                this.destroy_timeout -= elapsed;
                if (this.destroy_timeout <= 0) {
                    this.respawn_timeout = game.config.block_falling.respawn_timeout;
                    this.visible = false;

                    const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                    effect.x = this.x + game.config.tile_size / 2;
                    effect.y = this.y + game.config.tile_size / 2;
                    effect.anchor.set(0.5, 0.5);
                    effect.animationSpeed = 0.3;
                    effect.loop = false;
                    effect.play();
                    effect.onComplete = function() {
                        game.containers.effects.removeChild(effect);
                    };
                    game.containers.effects.addChild(effect);

                    game.resources.sounds["Explosion4"].play();
                } else {
                    this.x = this.original_x + Math.round(Math.random() * 2 - 1);
                    this.y = this.original_y + Math.round(Math.random() * 2 - 1);
                }
            } else {
                this.x = this.original_x;
                this.y = this.original_y;
                this.respawn_timeout -= elapsed;
                if (this.respawn_timeout < 0) {
                    if (!Physics.aabb(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height, this.x - 1e-1, this.y - 1e-1, game.config.tile_size + 2e-1, game.config.tile_size + 2e-1)) {
                        this.destroy_timeout = null;
                        this.respawn_timeout = null;
                        this.visible = true;

                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                        effect.x = this.x + game.config.tile_size / 2;
                        effect.y = this.y + game.config.tile_size / 2;
                        effect.anchor.set(0.5, 0.5);
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function() {
                            game.containers.front_effects.removeChild(effect);
                        };
                        game.containers.front_effects.addChild(effect);
                    }
                }
            }
        }

    }

}

module.exports = BlockFalling;

},{"./movie_clip.js":18,"./physics.js":19}],3:[function(require,module,exports){
class Camera {
    constructor() {
        this.offset = 0;
    }

    update_camera(elapsed) {
        if (!game.player.dead) {
            game.containers.level.x = Math.max(Math.min(game.render.render_width / 2 - game.player.x, 0), game.render.render_width - game.config.level.width);

            const target_offset = game.render.render_height / 3;
            if (game.player.crouching) {
                this.offset = Math.min(this.offset + elapsed * 3 * target_offset, target_offset);
            } else {
                this.offset = Math.max(this.offset - elapsed * 4 * target_offset, 0);
            }

            let top_edge = 0;
            let bottom_edge = game.render.render_height - game.config.level.height;
            top_edge += game.dialog_time;
            bottom_edge -= game.dialog_time;

            game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - game.player.y - this.offset, top_edge), bottom_edge);
        }
    }
}

module.exports = Camera;

},{}],4:[function(require,module,exports){
const Physics = require("./physics.js");

class Coin extends PIXI.AnimatedSprite {
    constructor(x, y) {
        super(game.resources.sprites["animations_16px_coin"]);

        this.x = x;
        this.y = y;
        this.initial_y = y;
        this.animationSpeed = 0.2;
        this.time = x + y;
        this.play();
    }

    update_coin(elapsed) {
        this.time += elapsed * 5;
        this.y = this.initial_y + Math.sin(this.time) * 3;

        if (!game.player.dead) {
            if (Physics.aabb(this.x, this.y, game.config.coin.size, game.config.coin.size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                game.coins.splice(game.coins.indexOf(this), 1);
                this.parent.removeChild(this);

                game.stats.score++;

                const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_coin_flash"]);
                effect.x = this.x;
                effect.y = this.y;
                effect.animationSpeed = 0.3;
                effect.loop = false;
                effect.play();
                effect.onComplete = function () {
                    game.containers.effects.removeChild(effect);
                };
                game.containers.effects.addChild(effect);

                game.resources.sounds["Pickup_Coin9"].play();
            }
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x, this.y, game.config.coin.size, game.config.coin.size);
        }
    }
}

module.exports = Coin;

},{"./physics.js":19}],5:[function(require,module,exports){
module.exports = {
    tile_size: 16,
    level: {
        width: 0,
        height: 0,
    },
    player: {
        width: 16,
        height: 20,
        speed: 130,
        acceleration: 1080,
        gravity_acceleration: 1080,
        fall_gravity: 90,
        max_gravity: 666,
        jump_speed: 222,
        high_jump_gravity_factor: 0.5,
        late_jump_duration: 0.05,
        early_jump_duration: 0.07,
        sliding_factor: 0.75,
        jump_off_walls_duration: 0.12,
        jump_off_walls_speed: 150,
        post_jump_slowdown_factor: 0.9,
        post_jump_sliding_factor: 0.6,
        post_jump_slowdown_duration: 0.5,
        crouching_speed_factor: 0.5,
    },
    spiky: {
        width: 14,
        height: 13,
        speed: 60,
    },
    flying: {
        width: 16,
        height: 16,
        speed: 60,
        projectile_speed: 120,
        projectile_size: 8,
        projectile_cooldown: 0.9,
        attack_area_width: 50,
        attack_area_height: 1000,
    },
    cloud: {
        width: 30,
        height: 10,
        speed: 60,
    },
    block_falling: {
        destroy_timeout: 0.5,
        respawn_timeout: 2,
    },
    mouse: {
        width: 14,
        height: 13,
        speed: 60,
        rush_speed: 80,
        attack_speed: 80,
        predictable_max_player_jump_distance: 30,
        dangerous_max_player_jump_distance: 50,
        attack_height: 40,
        max_prediction_distance: 200,
    },
    coin: {
        size: 16,
    },
    spitting: {
        width: 14,
        height: 13,
        speed: 50,
        bezier_height: 80,
        max_shooting_distance: 250,
        projectile_speed: 250,
        projectile_size: 3,
        projectile_cooldown: 1.2,
        bezier_angle: 50 / 180 * Math.PI,
        prepare_timeout: 0.5,
        prediction_seconds: 0.1,
    },
};

},{}],6:[function(require,module,exports){
const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");

class Cloud extends MovieClip {
    constructor(x, y, nodes, script) {
        super({
            idle: {frames: game.resources.sprites["animations_32px_enemy_cloud_idle"], speed: 0.15},
            jump: {frames: game.resources.sprites["animations_32px_enemy_cloud_jump"], speed: 0.15, loop: false},
        }, "idle");

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.play();

        this.script = script;

        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;

        this.bounds = {
            width: game.config.cloud.width,
            height: game.config.cloud.height
        };

        this.onComplete = function() {
            if (this.animation === "jump") {
                this.gotoAndPlay("idle");
            }
        };
    }

    update_cloud(elapsed) {
        if (this.script.length > 0) {
            if (game.scripts.hasOwnProperty(this.script)) {
                game.scripts[this.script](this, elapsed);
            } else {
                console.error(`Invalid script "${this.script}"!`);
            }
        }

        const next_node = (this.current_node + 1) % this.nodes.length;
        const distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        const displacement = Math.min(game.config.cloud.speed * elapsed, distance);
        const delta_x = distance > 1e-5 ? (this.nodes[next_node].x - this.x) / distance * displacement : 0;
        const delta_y = distance > 1e-5 ? (this.nodes[next_node].y - this.y) / distance * displacement : 0;

        if (Physics.aabb(this.x - game.config.cloud.width / 2, this.y - game.config.cloud.height / 2,
                         game.config.cloud.width, game.config.cloud.height,
                         game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height + 1e-1)) {
            game.player.vertical_speed = -250;
            game.player.y = this.y + delta_y - game.config.cloud.height / 2 - game.player.bounds.height;
            this.gotoAndPlay("jump");
            this.gotoAndPlay(0);

            game.resources.sounds["Jump8"].play();
        }

        const hit = Physics.move(this, delta_x, delta_y, -game.config.cloud.width / 2, -game.config.cloud.height / 2);
        if (Math.abs(hit.dx) + Math.abs(hit.dy) < 1e-5) {
            this.current_node = next_node;
            return;
        }

        const new_distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        if (new_distance < 1e-5) {
            this.current_node = next_node;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.cloud.width / 2, this.y - game.config.cloud.height / 2, game.config.cloud.width, game.config.cloud.height);
        }
    }
}

module.exports = Cloud;

},{"../movie_clip.js":18,"../physics.js":19}],7:[function(require,module,exports){
const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");
const FlyingProjectile = require("./flying_projectile.js");

class Flying extends MovieClip {
    constructor(x, y, nodes, friendly, script) {
        super({
            idle: {frames: game.resources.sprites["animations_32px_enemy_flying_fly"], speed: 0.15},
        }, "idle");

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.play();

        this.friendly = friendly;
        this.script = script;

        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;
        this.attack_cooldown = 0;

        this.bounds = {
            width: game.config.flying.width,
            height: game.config.flying.height
        };
    }

    update_flying(elapsed) {
        if (this.script.length > 0) {
            if (game.scripts.hasOwnProperty(this.script)) {
                game.scripts[this.script](this, elapsed);
            } else {
                console.error(`Invalid script "${this.script}"!`);
            }
        }

        const next_node = (this.current_node + 1) % this.nodes.length;
        const distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        const displacement = Math.min(game.config.flying.speed * elapsed, distance);
        const delta_x = distance > 1e-5 ? (this.nodes[next_node].x - this.x) / distance * displacement : 0;
        const delta_y = distance > 1e-5 ? (this.nodes[next_node].y - this.y) / distance * displacement : 0;

        this.attack_cooldown -= elapsed;

        if (!game.player.dead) {
            if (Physics.aabb(this.x - game.config.flying.width / 2, this.y - game.config.flying.height / 2,
                             game.config.flying.width, game.config.flying.height,
                             game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height + 1)) {
                game.player.vertical_speed = -250;

                if (!this.friendly) {
                    game.flyings.splice(game.flyings.indexOf(this), 1);
                    this.parent.removeChild(this);

                    const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                    effect.x = this.x;
                    effect.y = this.y;
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
            }
        }

        if (Math.abs(delta_x) > 1e-5) {
            if (delta_x > 0) {
                this.scale.x = 1;
            } else {
                this.scale.x = -1;
            }
        }

        Physics.move(this, delta_x, delta_y, -game.config.flying.width / 2, -game.config.flying.height / 2);

        if (!this.friendly) {
            if (this.attack_cooldown <= 0 && !game.player.dead) {
                if (Physics.aabb(this.x - game.config.flying.attack_area_width / 2, this.y + game.config.flying.height / 2, game.config.flying.attack_area_width, game.config.flying.attack_area_height,
                    game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                    const flying_projectile = new FlyingProjectile(this.x, this.y + game.config.flying.height / 2 + game.config.flying.projectile_size / 2 + 1);
                    game.flying_projectiles.push(flying_projectile);
                    game.containers.entities.addChild(flying_projectile);
                    this.attack_cooldown = game.config.flying.projectile_cooldown;

                    game.resources.sounds["Laser_Shoot8"].play();
                }
            }
        }

        const new_distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        if (new_distance < 1e-5) {
            this.current_node = next_node;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.flying.width / 2, this.y - game.config.flying.height / 2, game.config.flying.width, game.config.flying.height);
            game.containers.hitboxes.lineStyle(1, 0xFFFF00, 1);
            game.containers.hitboxes.drawRect(this.x - game.config.flying.attack_area_width / 2, this.y + game.config.flying.height / 2, game.config.flying.attack_area_width, game.config.flying.attack_area_height);
            game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);
        }
    }
}

module.exports = Flying;

},{"../movie_clip.js":18,"../physics.js":19,"./flying_projectile.js":8}],8:[function(require,module,exports){
const Physics = require("../physics.js");

class FlyingProjectile extends PIXI.Sprite {
    constructor(x, y) {
        super(game.resources.sprites["projectile_flying"]);

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.scale.x = this.scale.y = 0.5;
    }

    update_flying_projectile(elapsed) {
        this.y += game.config.flying.projectile_speed * elapsed;

        if (this.scale.x < 1) {
            this.scale.x = Math.min(this.scale.x + elapsed * 3, 1);
            this.scale.y = this.scale.x;
        }

        if (Physics.aabb(this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }

        if (Physics.overlap(game.player, this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size)) {
            game.flying_projectiles.splice(game.flying_projectiles.indexOf(this), 1);
            this.parent.removeChild(this);

            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_effect_projectile_flying_drop"]);
            effect.x = this.x;
            effect.y = this.y;
            effect.anchor.set(0.5, 0.5);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                game.containers.front_effects.removeChild(effect);
            };
            game.containers.front_effects.addChild(effect);
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size);
        }
    }
}

module.exports = FlyingProjectile;

},{"../physics.js":19}],9:[function(require,module,exports){
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
                                if (player_x > this.x) {
                                    this.is_attacking = 1;
                                } else {
                                    this.is_attacking = -1;
                                }
                            }
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
                game.containers.effects.removeChild(effect);
            };
            game.containers.effects.addChild(effect);

            this.is_grounded_counter = 0;
        } else {
            this.is_grounded_counter++;
        }

        if (!game.player.dead) {
            if (Physics.aabb(this.x - game.config.mouse.width / 2, this.y - game.config.mouse.height, game.config.mouse.width, game.config.mouse.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                if (game.player.previous_y + game.player.bounds.height < this.y - game.config.mouse.height && game.player.y + game.player.bounds.height >= this.y - game.config.mouse.height) {
                    game.player.vertical_speed = -250;

                    if (!this.friendly) {
                        game.mice.splice(game.mice.indexOf(this), 1);
                        this.parent.removeChild(this);

                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                        effect.x = this.x;
                        effect.y = this.y - game.config.mouse.height / 2;
                        effect.anchor.set(0.5, 0.5);
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function() {
                            game.containers.effects.removeChild(effect);
                        };
                        game.containers.effects.addChild(effect);

                        game.resources.sounds["Explosion4"].play();
                    } else {
                        // TODO: Ouch!
                    }
                } else {
                    if (!this.friendly) {
                        game.player.murder();
                    }
                }
            }
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

},{"../movie_clip.js":18,"../physics.js":19}],10:[function(require,module,exports){
const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");

class Spiky extends MovieClip {
    constructor(x, y, nodes, script) {
        super({
            idle: {name: "idle", frames: game.resources.sprites["animations_32px_enemy_spiky_walk"], speed: 0.15},
        }, "idle");

        this.anchor.set(0.5, 1);
        this.x = x;
        this.y = y;
        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;
        this.play();

        this.script = script;

        this.bounds = {
            width: game.config.spiky.width,
            height: game.config.spiky.height
        };
    }

    update_spiky(elapsed) {
        if (this.script.length > 0) {
            if (game.scripts.hasOwnProperty(this.script)) {
                game.scripts[this.script](this, elapsed);
            } else {
                console.error(`Invalid script "${this.script}"!`);
            }
        }

        const next_node = (this.current_node + 1) % this.nodes.length;
        if (this.x < this.nodes[next_node].x) {
            this.x = Math.min(this.x + game.config.spiky.speed * elapsed, this.nodes[next_node].x);
            this.scale.x = 1;
        } else {
            this.x = Math.max(this.x - game.config.spiky.speed * elapsed, this.nodes[next_node].x);
            this.scale.x = -1;
        }
        if (Math.abs(this.x - this.nodes[next_node].x) < 1e-5) {
            this.current_node = next_node;
        }
        if (Physics.aabb(this.x - game.config.spiky.width / 2, this.y - game.config.spiky.height, game.config.spiky.width, game.config.spiky.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }
        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.spiky.width / 2, this.y - game.config.spiky.height, game.config.spiky.width, game.config.spiky.height);
        }
    }
}

module.exports = Spiky;

},{"../movie_clip.js":18,"../physics.js":19}],11:[function(require,module,exports){
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

            if (Physics.aabb(this.x - game.config.spitting.width / 2, this.y - game.config.spitting.height, game.config.spitting.width, game.config.spitting.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
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
                    if (!this.friendly) {
                        game.player.murder();
                    }
                }
            }
        }

        if (is_walking) {
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

},{"../movie_clip.js":18,"../physics.js":19,"./spitting_projectile.js":12}],12:[function(require,module,exports){
const Physics = require("../physics.js");

class SpittingProjectile extends PIXI.AnimatedSprite {
    constructor(sx, sy, bx, by, tx, ty, distance) {
        super(game.resources.sprites["animations_16px_projectile_spit"]);

        this.anchor.set(0.5, 0.5);
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.bx = bx;
        this.by = by;
        this.tx = tx;
        this.ty = ty;
        this.distance = distance;
        this.t = 0;
        this.scale.x = this.scale.y = 0.5;
        this.play();
    }

    update_spitting_projectile(elapsed) {
        this.t += elapsed * game.config.spitting.projectile_speed / this.distance;

        if (this.t < 1) {
            this.x = (1 - this.t) * (1 - this.t) * this.sx + 2 * this.t * (1 - this.t) * this.bx + this.t * this.t * this.tx;
            this.y = (1 - this.t) * (1 - this.t) * this.sy + 2 * this.t * (1 - this.t) * this.by + this.t * this.t * this.ty;
        } else {
            const last_x = 0.01 * this.sx + 0.18 * this.bx + 0.81 * this.tx;
            const last_y = 0.01 * this.sy + 0.18 * this.by + 0.81 * this.ty;
            const distance = Math.sqrt((last_x - this.tx) * (last_x - this.tx) + (last_y - this.ty) * (last_y - this.ty));
            if (distance > 1e-5) {
                this.x += elapsed * game.config.spitting.projectile_speed * (this.tx - last_x) / distance;
                this.y += elapsed * game.config.spitting.projectile_speed * (this.ty - last_y) / distance;
            } else {
                game.spitting_projectiles.splice(game.spitting_projectiles.indexOf(this), 1);
                this.parent.removeChild(this);
                return;
            }
        }

        if (this.scale.x < 1) {
            this.scale.x = Math.min(this.scale.x + elapsed * 3, 1);
            this.scale.y = this.scale.x;
        }

        if (Physics.aabb(this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }

        if (Physics.overlap(game.player, this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size)) {
            game.spitting_projectiles.splice(game.spitting_projectiles.indexOf(this), 1);
            this.parent.removeChild(this);

            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_effect_projectile_spit"]);
            effect.x = this.x;
            effect.y = this.y;
            effect.anchor.set(0.5, 0.5);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                game.containers.front_effects.removeChild(effect);
            };
            game.containers.front_effects.addChild(effect);
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size);
        }
    }
}

module.exports = SpittingProjectile;

},{"../physics.js":19}],13:[function(require,module,exports){
class Exit {
    constructor(x, y, next_level) {
        this.x = x;
        this.y = y;
        this.next_level = next_level;
    }

    update_exit() {
        if (!game.player.dead) {
            const force_next_level = game.input.is_key_down("ShiftLeft") && game.input.is_key_pressed("Digit9");
            if (force_next_level) {
                return this.next_level;
            }
            if (game.player.x + game.player.bounds.width / 2 > this.x && game.player.x + game.player.bounds.width / 2 < this.x + game.config.tile_size * 2 && game.player.y + game.player.bounds.height / 2 > this.y && game.player.y + game.player.bounds.height / 2 < this.y + game.config.tile_size * 2) {
                return this.next_level;
            }
        }
        return null;
    }
}

module.exports = Exit;

},{}],14:[function(require,module,exports){
class Hat extends PIXI.AnimatedSprite {
    constructor(x, y, velocity_x, velocity_y) {
        super(game.resources.sprites["animations_32px_player_death_hat"]);

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.velocity_x = velocity_x;
        this.velocity_y = velocity_y;
        this.play();

        if (velocity_x > 0) {
            this.rotation = Math.PI / 6;
        } else {
            this.rotation = -Math.PI / 6;
        }
    }

    update_hat(elapsed) {
        this.x += this.velocity_x * elapsed;
        this.y += this.velocity_y * elapsed;
        this.velocity_y += game.config.player.gravity_acceleration * elapsed;

        if (this.rotation < 0) {
            this.rotation -= elapsed;
        } else {
            this.rotation += elapsed;
        }
    }
}

module.exports = Hat;

},{}],15:[function(require,module,exports){
const Physics = require("./physics.js");

class HazardVines {
    constructor(x, y, width, height) {
        this.x = x + 7;
        this.y = y + 7;
        this.width = width - 14;
        this.height = height - 14;
    }

    update_hazard_vines() {
        if (Physics.aabb(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height, this.x, this.y, this.width, this.height)) {
            game.player.murder();
        }
        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x, this.y, this.width, this.height);
        }
    }

}

module.exports = HazardVines;

},{"./physics.js":19}],16:[function(require,module,exports){
const init_input = function() {
    document.body.onkeydown = event => input.keys[event.code] = true;
    document.body.onkeyup = event => input.keys[event.code] = false;
    document.body.onmousedown = event => input.mouse[event.button] = true;
    document.body.onmouseup = event => input.mouse[event.button] = false;

    delete input.init;
};

const update_input = function() {
    for (let key in input.keys) {
        if (input.keys.hasOwnProperty(key)) {
            input.previous_keys[key] = input.keys[key];
        }
    }
    for (let key in input.mouse) {
        if (input.mouse.hasOwnProperty(key)) {
            input.previous_mouse[key] = input.mouse[key];
        }
    }
};

const is_key_down = function(key) {
    return input.keys[key] === true;
};

const is_key_pressed = function(key) {
    return input.keys[key] === true && !input.previous_keys[key];
};

const is_key_released = function(key) {
    return !input.keys[key] && input.previous_keys[key] === true;
};

const is_mouse_down = function(button) {
    return input.mouse[button] === true;
};

const is_mouse_pressed = function(button) {
    return input.mouse[button] === true && !input.previous_mouse[button];
};

const is_mouse_released = function(button) {
    return !input.mouse[button] && input.previous_mouse[button] === true;
};

const input = {
    BUTTONS: {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2,
    },
    init: init_input,
    update: update_input,
    is_key_down: is_key_down,
    is_key_pressed: is_key_pressed,
    is_key_released: is_key_released,
    is_mouse_down: is_mouse_down,
    is_mouse_pressed: is_mouse_pressed,
    is_mouse_released: is_mouse_released,
    keys: {},
    previous_keys: {},
    mouse: {},
    previous_mouse: {},
};

module.exports = input;

},{}],17:[function(require,module,exports){
const Player = require("./player.js");
const HazardVines = require("./hazard_vines.js");
const Spiky = require("./enemies/spiky.js");
const Flying = require("./enemies/flying.js");
const Cloud = require("./enemies/cloud.js");
const BlockFalling = require("./block_falling.js");
const Mouse = require("./enemies/mouse.js");
const Coin = require("./coin.js");
const Spitting = require("./enemies/spitting.js");
const Camera = require("./camera.js");
const Exit = require("./exit.js");
const Altar = require("./altar.js");
const Tutorial = require("./tutorial.js");
const Physics = require("./physics.js");

window.game = {
    render: require("./render.js"),
    resources: require("./resources/resources.js"),
    input: require("./input.js"),
    config: require("./config.js"),
    camera: null,
    player: null,
    level: null,
    hazard_vines: [],
    spikes: [],
    flyings: [],
    flying_projectiles: [],
    clouds: [],
    block_fallings: [],
    mice: [],
    coins: [],
    spittings: [],
    spitting_projectiles: [],
    draw_hitboxes: false,
    spawn_effect_radius: 1,
    current_level: "main_menu_0",
    next_level: null,
    exit: null,
    altar: null,
    start_button: null,
    ui_logo: null,
    num_clicks: 0,
    dialog: false,
    dialog_time: 0,
    dialog_text: "",
    dialog_text_duration: 0,
    dialog_text_timeout: 0,
    dialog_callback: null,
    stats: {
        score: 0,
        level_start: null,
        total_score: 0,
        total_time: 0,
        item1: true,
        item2: true,
        item3: true,
        item4: true,
    },
    scripts: {
        sc_game_menu_0: function(entity, elapsed) {
            if (!entity.activated && (game.num_clicks >= 1 || game.player.x > 300)) {
                entity.activated = true;
                entity.state = 1;
            }
            if (entity.activated) {
                if (entity.state === 1) {
                    entity.scale.x = -1;
                    if (entity.x > 350) {
                        entity.x -= elapsed * game.config.spitting.speed;
                    } else {
                        entity.state = 2;
                    }
                } else if (entity.state === 2) {
                    game.dialog = true;
                    game.dialog_time = 0;

                    game.dialog_text = "Not again!";
                    game.dialog_text_duration = 2;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "Looks like Start button is broken";
                        game.dialog_text_duration = 3;
                        game.dialog_text_timeout = 0;
                        game.dialog_callback = function() {
                            game.dialog_text = "Follow me, I gotta check something . . .";
                            game.dialog_text_duration = 3;
                            game.dialog_text_timeout = 0;
                            game.dialog_callback = function() {
                                game.dialog = false;
                                entity.state = 4;
                            };
                        };
                    };

                    entity.state = 3;
                } else if (entity.state === 3) {
                    if (entity.x > game.player.x + game.player.bounds.width / 2) {
                        entity.scale.x = -1;
                    } else {
                        entity.scale.x = 1;
                    }
                } else if (entity.state === 4) {
                    entity.scale.x = 1;
                    if (entity.x < 510) {
                        entity.x += elapsed * game.config.spitting.speed;
                    } else {
                        entity.state = 5;
                    }
                } else if (entity.state === 5) {
                    entity.parent.removeChild(entity);
                    entity.state = 6;
                }
                return true;
            }
            return false;
        },
        sc_backstage_1: function(entity, elapsed) {
            if (!entity.state) {
                entity.state = 1;
            }
            if (entity.state === 1) {
                entity.scale.x = 1;
                if (entity.x < 180) {
                    entity.x += elapsed * game.config.spitting.speed;
                } else {
                    entity.state = 2;
                }
            } else if (entity.state === 2) {
                game.dialog = true;
                game.dialog_time = 0;

                game.dialog_text = "Alright . . . Okay . . .  I see . . .";
                game.dialog_text_duration = 2.5;
                game.dialog_text_timeout = 0;
                game.dialog_callback = function() {
                    game.dialog_text = "You have 4 items you were supposed to collect during the game";
                    game.dialog_text_duration = 4.5;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "For some reason you have these items before the start";
                        game.dialog_text_duration = 4;
                        game.dialog_text_timeout = 0;
                        game.dialog_callback = function() {
                            game.dialog_text = "You must place these items back where they belong";
                            game.dialog_text_duration = 3.5;
                            game.dialog_text_timeout = 0;
                            game.dialog_callback = function() {
                                game.dialog_text = "Then you can start the game normally";
                                game.dialog_text_duration = 3;
                                game.dialog_text_timeout = 0;
                                game.dialog_callback = function() {
                                    game.dialog_text = "Now go! The first level is upstairs.\nYou need to climb the wall to get there.";
                                    game.dialog_text_duration = 6;
                                    game.dialog_text_timeout = 0;
                                    game.dialog_callback = function() {
                                        game.dialog = false;
                                        entity.state = 4;
                                    };
                                };
                            };
                        };
                    };
                };

                entity.state = 3;
            } else if (entity.state === 3) {
                if (entity.x > game.player.x + game.player.bounds.width / 2) {
                    entity.scale.x = -1;
                } else {
                    entity.scale.x = 1;
                }
            }
            return true;
        },
    }
};

game.render.init();

game.resources.on_load = function() {
    document.getElementById("loading_bar").remove();
    initialize();
    game.render.application.ticker.add(main_loop);
};
game.resources.load();

game.input.init();

let construct_level = function(level_name) {
    const tileset = game.resources.sprites["tileset"];

    game.level = game.resources.levels[level_name];

    game.config.level.width = game.level.width;
    game.config.level.height = game.level.height;

    game.stats.time = 0;
    game.stats.score = 0;

    game.stats.level_start = new Date();

    function draw_tiles_layer(layer_name) {
        for (let i = 0; i < game.level[layer_name].length; i++) {
            const tile_descriptor = game.level[layer_name][i];

            const tile_sprite = new PIXI.Texture(tileset, tileset.frame.clone());
            if (tileset.rotate) {
                tile_sprite.frame.x += tileset.frame.width - (tile_descriptor.ty + 1) * game.config.tile_size;
                tile_sprite.frame.y += tile_descriptor.tx * game.config.tile_size;
            } else {
                tile_sprite.frame.x += tile_descriptor.tx * game.config.tile_size;
                tile_sprite.frame.y += tile_descriptor.ty * game.config.tile_size;
            }
            tile_sprite.frame.width = tile_sprite.frame.height = game.config.tile_size;
            tile_sprite.rotate = tileset.rotate;
            tile_sprite.updateUvs();

            const tile = new PIXI.Sprite(tile_sprite);
            tile.x = tile_descriptor.x * game.config.tile_size;
            tile.y = tile_descriptor.y * game.config.tile_size;
            game.containers[layer_name].addChild(tile);
        }
    }

    if (game.containers && game.containers.level) {
        game.containers.stage.removeChild(game.containers.level);
    }

    game.containers = {
        stage: game.render.stage,
        level: new PIXI.Container(),
        tiles_very_back: new PIXI.Container(),
        effects: new PIXI.Container(),
        tiles_back: new PIXI.Container(),
        entities: new PIXI.Container(),
        front_effects: new PIXI.Container(),
        tiles_front: new PIXI.Container(),
        hitboxes: new PIXI.Graphics(),
        ui: new PIXI.Container(),
        coin: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        coin_shadow: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        timer: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        timer_shadow: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        score: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        score_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        time: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        time_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        items: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        dialog_background: new PIXI.Graphics(),
        dialog_text: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        spawn_transition: new PIXI.Graphics(),
        item1: new PIXI.Sprite(game.resources.sprites["artifact_1"]),
        item2: new PIXI.Sprite(game.resources.sprites["artifact_2"]),
        item3: new PIXI.Sprite(game.resources.sprites["artifact_3"]),
        item4: new PIXI.Sprite(game.resources.sprites["artifact_4"]),
        background_1: null,
        background_2: null,
        clouds: [],
        clouds_container: null,
    };

    game.containers.level.addChild(game.containers.tiles_very_back);
    game.containers.level.addChild(game.containers.effects);
    game.containers.level.addChild(game.containers.tiles_back);
    game.containers.level.addChild(game.containers.entities);
    game.containers.level.addChild(game.containers.front_effects);
    game.containers.level.addChild(game.containers.tiles_front);

    if (game.draw_hitboxes) {
        game.containers.level.addChild(game.containers.hitboxes);
    }

    game.containers.background_1 = new PIXI.Sprite(game.resources.sprites["background_1"]);
    game.containers.background_1.y = game.render.render_height - game.containers.background_1.height;
    game.containers.background_2 = new PIXI.Sprite(game.resources.sprites["background_2"]);
    game.containers.background_2.y = game.render.render_height - game.containers.background_2.height;
    game.containers.clouds_container = new PIXI.Container();

    for (let i = 0; i < 10; i++) {
        const cloud = new PIXI.Sprite(game.resources.sprites["cloud_" + Math.round(Math.random() * 2)]);
        cloud.y = game.containers.background_2.y - 100 + Math.random() * 50;
        cloud.x = Math.random() * game.render.render_width;
        cloud.speed = 0.1 + Math.random() / 5;
        cloud.anchor.set(0, 0.5);
        game.containers.clouds.push(cloud);
        game.containers.clouds_container.addChild(cloud);
    }

    game.containers.stage.addChild(new PIXI.Sprite(game.resources.sprites["background_0"]));
    game.containers.stage.addChild(game.containers.background_1);
    game.containers.stage.addChild(game.containers.clouds_container);
    game.containers.stage.addChild(game.containers.background_2);
    game.containers.stage.addChild(game.containers.level);
    game.containers.stage.addChild(game.containers.ui);
    game.containers.stage.addChild(game.containers.dialog_background);
    game.containers.stage.addChild(game.containers.dialog_text);
    game.containers.stage.addChild(game.containers.spawn_transition);

    draw_tiles_layer("tiles_very_back");
    draw_tiles_layer("tiles_back");
    draw_tiles_layer("tiles_front");

    game.player = null;
    game.hazard_vines = [];
    game.spikes = [];
    game.flyings = [];
    game.flying_projectiles = [];
    game.clouds = [];
    game.block_fallings = [];
    game.mice = [];
    game.coins = [];
    game.spittings = [];
    game.spitting_projectiles = [];
    game.exit = null;
    game.altar = null;
    game.next_level = null;

    for (let i = 0; i < game.level["entities"].length; i++) {
        const entity = game.level["entities"][i];
        if (entity.type === "player") {
            game.player = new Player(entity.x, entity.y);
            game.containers.entities.addChild(game.player);
        } else if (entity.type === "hazard_vines") {
            game.hazard_vines.push(new HazardVines(entity.x, entity.y, entity.width, entity.height));
        } else if (entity.type === "enemy_spiky") {
            const spiky = new Spiky(entity.x, entity.y, entity.nodes, entity.script);
            game.spikes.push(spiky);
            game.containers.entities.addChild(spiky);
        } else if (entity.type === "enemy_flying") {
            const flying = new Flying(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.flyings.push(flying);
            game.containers.entities.addChild(flying);
        } else if (entity.type === "enemy_cloud") {
            const cloud = new Cloud(entity.x, entity.y, entity.nodes, entity.script);
            game.clouds.push(cloud);
            game.containers.entities.addChild(cloud);
        } else if (entity.type === "block_falling") {
            const width = entity.width / game.config.tile_size;
            const height = entity.height / game.config.tile_size;
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const block_falling = new BlockFalling(entity.x + i * game.config.tile_size, entity.y + j * game.config.tile_size, entity.nodes);
                    game.block_fallings.push(block_falling);
                    game.containers.entities.addChild(block_falling);
                }
            }
        } else if (entity.type === "enemy_mouse") {
            const mouse = new Mouse(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.mice.push(mouse);
            game.containers.entities.addChild(mouse);
        } else if (entity.type === "coin") {
            const coin = new Coin(entity.x, entity.y);
            game.coins.push(coin);
            game.containers.entities.addChild(coin);
        } else if (entity.type === "enemy_spitting") {
            const spitting = new Spitting(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.spittings.push(spitting);
            game.containers.entities.addChild(spitting);
        } else if (entity.type === "exit") {
            game.exit = new Exit(entity.x, entity.y, entity.next_level);
        } else if (entity.type === "altar") {
            game.altar = new Altar(entity.x, entity.y, entity.next_level, entity.item2);
            game.containers.entities.addChild(game.altar);
        } else if (entity.type === "tutorial") {
            const tutorial = new Tutorial(entity.x, entity.y, entity.a, entity.b);
            game.containers.entities.addChild(tutorial);
        }
    }

    game.camera = new Camera();
    game.camera.update_camera(1 / 60);

    const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
    const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
    const max_x = Math.max(player_x, game.render.render_width - player_x);
    const max_y = Math.max(player_y, game.render.render_height - player_y);
    game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);

    game.containers.spawn_transition.clear();
    game.containers.spawn_transition.beginFill(0x000000);
    game.containers.spawn_transition.drawRect(0, 0, game.render.render_width, game.render.render_height);
    game.containers.spawn_transition.endFill();

    game.dialog = false;
    game.dialog_time = 0;

    game.start_button = null;
    if (level_name === "main_menu_0" || level_name === "main_menu_1") {
        game.ui_logo = new PIXI.Sprite(game.resources.sprites["ui_logo"]);
        game.ui_logo.anchor.set(0.5);
        const initial_x = -game.containers.level.x;
        const initial_y = -game.containers.level.y;
        game.ui_logo.x = initial_x + game.render.render_width / 2;
        game.ui_logo.y = initial_y + game.render.render_height / 2 - 55;
        game.containers.level.addChild(game.ui_logo);

        game.start_button = new PIXI.Sprite(game.resources.sprites["button_start"]);
        game.start_button.anchor.set(0.5);
        game.start_button.x = initial_x + game.render.render_width / 2;
        game.start_button.y = initial_y + game.render.render_height / 2 + 20;
        game.start_button.interactive = true;
        game.start_button.buttonMode = true;
        game.containers.level.addChild(game.start_button);
        game.start_button.on("pointerover", function() {
            game.start_button.texture = game.resources.sprites["button_start_hover"];
        });
        game.start_button.on("pointerout", function() {
            game.start_button.texture = game.resources.sprites["button_start"];
        });
        game.start_button.on("pointerdown", function(evt) {
            if (level_name === "main_menu_0") {
                const world_x = -game.containers.level.x + evt.data.global.x;
                const world_y = -game.containers.level.y + evt.data.global.y;
                do {
                    game.start_button.x = initial_x + game.start_button.width / 2 + Math.random() * (game.render.render_width - game.start_button.width);
                    game.start_button.y = initial_y + game.start_button.height / 2 + Math.random() * (game.render.render_height - game.start_button.height - 150);
                } while (Physics.point(game.start_button.x - game.start_button.width / 2, game.start_button.y - game.start_button.height / 2, game.start_button.width, game.start_button.height, world_x, world_y));
                game.num_clicks++;
            } else {
                game.ui_logo.visible = game.start_button.visible = false;

                const credits = new PIXI.Sprite(game.resources.sprites["ui_credits"]);
                credits.anchor.set(0.5);
                credits.x = initial_x + game.render.render_width / 2;
                credits.y = initial_y + game.render.render_height / 2;
                game.containers.level.addChild(credits);
            }
            game.resources.sounds["Laser_Shoot8"].play();
        });
    } else {
        game.num_clicks++;
    }

    game.containers.score.text = "0";
    game.containers.score.x = 24;
    game.containers.score.y = 7;

    game.containers.score_shadow.text = game.containers.score.text;
    game.containers.score_shadow.x = game.containers.score.x;
    game.containers.score_shadow.y = game.containers.score.y + 1;

    game.containers.time.text = "00 : 00";
    game.containers.time.x = 24;
    game.containers.time.y = 15 + game.containers.score.height;

    game.containers.coin.x = 7;
    game.containers.coin.y = 7;

    game.containers.coin_shadow.x = game.containers.coin.x;
    game.containers.coin_shadow.y = game.containers.coin.y + 1;
    game.containers.coin_shadow.tint = 0x000000;

    game.containers.timer.x = 7;
    game.containers.timer.y = 13 + game.containers.score.height;

    game.containers.timer_shadow.x = game.containers.timer.x;
    game.containers.timer_shadow.y = game.containers.timer.y + 1;
    game.containers.timer_shadow.tint = 0x000000;

    game.containers.time_shadow.text = game.containers.time.text;
    game.containers.time_shadow.x = game.containers.time.x;
    game.containers.time_shadow.y = game.containers.time.y + 1;

    game.containers.item1.x = game.render.render_width - 23;
    game.containers.item1.y = 7;
    game.containers.item1.visible = game.stats.item1;

    game.containers.item2.x = game.render.render_width - 23 - 20;
    game.containers.item2.y = 7;
    game.containers.item2.visible = game.stats.item2;

    game.containers.item3.x = game.render.render_width - 23 - 20 * 2;
    game.containers.item3.y = 7;
    game.containers.item3.visible = game.stats.item3;

    game.containers.item4.x = game.render.render_width - 23 - 20 * 3;
    game.containers.item4.y = 7;
    game.containers.item4.visible = game.stats.item4;

    game.containers.ui.addChild(game.containers.coin_shadow);
    game.containers.ui.addChild(game.containers.coin);
    game.containers.ui.addChild(game.containers.timer_shadow);
    game.containers.ui.addChild(game.containers.timer);
    game.containers.ui.addChild(game.containers.score_shadow);
    game.containers.ui.addChild(game.containers.score);
    game.containers.ui.addChild(game.containers.time_shadow);
    game.containers.ui.addChild(game.containers.time);
    game.containers.ui.addChild(game.containers.items);
    game.containers.ui.addChild(game.containers.item1);
    game.containers.ui.addChild(game.containers.item2);
    game.containers.ui.addChild(game.containers.item3);
    game.containers.ui.addChild(game.containers.item4);
};

let initialize = function() {
    construct_level(game.current_level);
};

let main_loop = function() {
    const elapsed = game.render.application.ticker.elapsedMS / 1000;

    const current_time = new Date();
    const total_elapsed = (current_time.getTime() - game.stats.level_start.getTime()) / 1000;

    if (game.draw_hitboxes) {
        game.containers.hitboxes.clear();
        game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);

        const hitboxes = game.level["hitboxes"];
        for (let i = 0; i < hitboxes.length; i++) {
            game.containers.hitboxes.drawRect(hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height);
        }
    }

    game.player.update_player(elapsed);
    for (let i = 0; i < game.hazard_vines.length; i++) {
        game.hazard_vines[i].update_hazard_vines();
    }
    for (let i = 0; i < game.spikes.length; i++) {
        game.spikes[i].update_spiky(elapsed);
    }
    for (let i = 0; i < game.flyings.length; ) {
        const flying = game.flyings[i];
        game.flyings[i].update_flying(elapsed);
        if (i < game.flyings.length && game.flyings[i] === flying) {
            i++;
        }
    }
    for (let i = 0; i < game.flying_projectiles.length; ) {
        const projectile = game.flying_projectiles[i];
        projectile.update_flying_projectile(elapsed);
        if (i < game.flying_projectiles.length && game.flying_projectiles[i] === projectile) {
            i++;
        }
    }
    for (let i = 0; i < game.clouds.length; i++) {
        game.clouds[i].update_cloud(elapsed);
    }
    for (let i = 0; i < game.block_fallings.length; i++) {
        game.block_fallings[i].update_block_falling(elapsed);
    }
    for (let i = 0; i < game.mice.length; ) {
        const mouse = game.mice[i];
        mouse.update_mouse(elapsed);
        if (i < game.mice.length && game.mice[i] === mouse) {
            i++;
        }
    }
    for (let i = 0; i < game.coins.length; ) {
        const coin = game.coins[i];
        coin.update_coin(elapsed);
        if (i < game.coins.length && game.coins[i] === coin) {
            i++;
        }
    }
    for (let i = 0; i < game.spittings.length; ) {
        const spitting = game.spittings[i];
        spitting.update_spitting(elapsed);
        if (i < game.spittings.length && game.spittings[i] === spitting) {
            i++;
        }
    }
    for (let i = 0; i < game.spitting_projectiles.length; ) {
        const projectile = game.spitting_projectiles[i];
        projectile.update_spitting_projectile(elapsed);
        if (i < game.spitting_projectiles.length && game.spitting_projectiles[i] === projectile) {
            i++;
        }
    }
    for (let i = 0; i < game.containers.clouds.length; i++) {
        game.containers.clouds[i].x += game.containers.clouds[i].speed;
        if (game.containers.clouds[i].x > game.render.render_width) {
            game.containers.clouds[i].x -= game.render.render_width + game.containers.clouds[i].width;
        }
    }
    if (game.next_level == null && game.exit) {
        const next_level = game.exit.update_exit();
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);
            game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
        }
    } else if (game.next_level == null && game.altar) {
        const next_level = game.altar.update_altar(elapsed);
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);
            game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
        }
    }
    game.camera.update_camera(elapsed);
    game.input.update();

    const max_radius = Math.sqrt(game.render.render_width * game.render.render_width + game.render.render_height * game.render.render_height);
    const max_side = Math.max(game.render.render_width, game.render.render_height) + max_radius * 2 + 10;

    game.containers.spawn_transition.clear();

    if (game.player.dead || game.next_level) {
        game.containers.spawn_transition.beginFill(0x000000);
        game.containers.spawn_transition.drawRect((game.render.render_width - max_side) / 2, (game.render.render_height - max_side) / 2, max_side, max_side);
        game.containers.spawn_transition.endFill();

        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            game.containers.spawn_transition.beginHole();
            game.containers.spawn_transition.drawCircle(game.player.x + game.containers.level.x + game.player.bounds.width / 2, game.player.y + game.containers.level.y + game.player.bounds.height / 2, game.spawn_effect_radius);
            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * max_radius, 0);
            game.containers.spawn_transition.endHole();

            if (Math.abs(game.spawn_effect_radius) < 1e-5) {
                if (game.next_level) {
                    if (game.altar) {
                        game.stats["item" + game.altar.item_num] = false;
                    }

                    game.stats.total_score += game.stats.score;
                    game.stats.total_time += total_elapsed;
                    game.current_level = game.next_level;
                }
                construct_level(game.current_level);
            }
        }
    } else {
        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            game.containers.spawn_transition.beginFill(0x000000);
            game.containers.spawn_transition.drawCircle(game.player.x + game.player.bounds.width / 2 + game.containers.level.x, game.player.y + game.player.bounds.height / 2 + game.containers.level.y, game.spawn_effect_radius);
            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * 1.5 * max_radius, 0);
            game.containers.spawn_transition.endFill();
        }
    }
    if (game.dialog) {
        game.dialog_time = Math.min(game.dialog_time + elapsed * 125, 40);
    } else {
        game.dialog_time = Math.max(game.dialog_time - elapsed * 125, 0);
    }
    if (Math.abs(game.dialog_time) > 1e-5) {
        game.containers.dialog_background.clear();
        game.containers.dialog_background.beginFill(0x000000);
        game.containers.dialog_background.drawRect(0, 0, game.render.render_width, game.dialog_time);
        game.containers.dialog_background.drawRect(0, game.render.render_height - game.dialog_time, game.render.render_width, game.dialog_time);
        game.containers.dialog_background.endFill();

        game.containers.dialog_text.text = game.dialog_text;
        game.containers.dialog_text.x = game.render.render_width / 2 - game.containers.dialog_text.textWidth / 2;
        game.containers.dialog_text.y = game.render.render_height - game.dialog_time + 40 / 2 - game.containers.dialog_text.textHeight / 2;

        if (game.dialog) {
            game.dialog_text_timeout += elapsed;
            if (game.dialog_text_timeout > game.dialog_text_duration) {
                game.dialog_callback();
            }
        }
    }

    if (game.current_level === "main_menu_1") {
        game.containers.score.text = game.stats.total_score + " total";
        game.containers.score_shadow.text = game.containers.score.text;
        const minutes = Math.floor(game.stats.total_time / 60);
        const seconds = Math.floor(game.stats.total_time % 60);
        game.containers.time.text = (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds) + " total";
        game.containers.time_shadow.text = game.containers.time.text;
    } else {
        game.containers.score.text = String(game.stats.score);
        game.containers.score_shadow.text = game.containers.score.text;
        const minutes = Math.floor(total_elapsed / 60);
        const seconds = Math.floor(total_elapsed % 60);
        game.containers.time.text = (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds);
        game.containers.time_shadow.text = game.containers.time.text;
    }

    game.containers.background_1.x = (500 - game.render.render_width) * (game.containers.level.x / game.config.level.width);
    game.containers.background_2.x = (580 - game.render.render_width) * (game.containers.level.x / game.config.level.width);
};

window.onfocus = function() {
    Howler.volume(1);
};

window.onblur = function() {
    Howler.volume(0);
};

},{"./altar.js":1,"./block_falling.js":2,"./camera.js":3,"./coin.js":4,"./config.js":5,"./enemies/cloud.js":6,"./enemies/flying.js":7,"./enemies/mouse.js":9,"./enemies/spiky.js":10,"./enemies/spitting.js":11,"./exit.js":13,"./hazard_vines.js":15,"./input.js":16,"./physics.js":19,"./player.js":20,"./render.js":21,"./resources/resources.js":23,"./tutorial.js":26}],18:[function(require,module,exports){
class MovieClip extends PIXI.AnimatedSprite {
    constructor(descriptors, default_animation) {
        super(descriptors[default_animation].frames);
        super.animationSpeed = descriptors[default_animation].speed || 1;
        super.loop = !(descriptors[default_animation].loop === false);

        this.descriptors = descriptors;
        this.animation = default_animation;
    }

    gotoAndPlay(frameOrAnimation) {
        if (this.animation !== frameOrAnimation) {
            if (this.descriptors && this.descriptors.hasOwnProperty(frameOrAnimation)) {
                super.textures = this.descriptors[frameOrAnimation].frames;
                super.animationSpeed = this.descriptors[frameOrAnimation].speed || 1;
                super.loop = !(this.descriptors[frameOrAnimation].loop === false);
                this.animation = frameOrAnimation;
                super.gotoAndPlay(0);
            } else {
                super.gotoAndPlay(frameOrAnimation);
            }
        }
    }

    gotoAndStop(frameOrAnimation) {
        if (this.animation !== frameOrAnimation) {
            if (this.descriptors && this.descriptors.hasOwnProperty(frameOrAnimation)) {
                super.textures = this.descriptors[frameOrAnimation].frames;
                super.animationSpeed = this.descriptors[frameOrAnimation].speed || 1;
                super.loop = !(this.descriptors[frameOrAnimation].loop === false);
                this.animation = frameOrAnimation;
                super.gotoAndStop(0);
            } else {
                super.gotoAndStop(frameOrAnimation);
            }
        }
    }
}

module.exports = MovieClip;

},{}],19:[function(require,module,exports){
const aabb = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw - 1e-8 && ax + aw - 1e-8 > bx && ay < by + bh - 1e-8 && ay + ah - 1e-8 > by;
};

const point = function(x, y, width, height, px, py) {
    return px > x && px < x + width && py > y && py < y + height;
};

const segment = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    function area(_x1, _y1, _x2, _y2, _x3, _y3) {
        return (_x2 - _x1) * (_y3 - _y1) - (_y2 - _y1) * (_x3 - _x1);
    }

    function intersect_1(a, b, c, d) {
        if (a > b) {
            const temp = a;
            a = b;
            b = temp;
        }
        if (c > d) {
            const temp = c;
            c = d;
            d = temp;
        }
        return Math.max(a, c) < Math.min(b, d);
    }

    return intersect_1(x1, x2, x3, x4) && intersect_1(y1, y2, y3, y4) && area(x1, y1, x2, y2, x3, y3) * area(x1, y1, x2, y2, x4, y4) < 1e-8 && area(x3, y3, x4, y4, x1, y1) * area(x3, y3, x4, y4, x2, y2) < 1e-8;
};

const iterate_over_all_hitboxes = function(callback) {
    const hitboxes = game.level["hitboxes"];
    for (let i = 0; i < hitboxes.length; i++) {
        const result = callback(hitboxes[i], hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height);
        if (result != null) {
            return result;
        }
    }

    {
        const result = callback(game.player, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height);
        if (result != null) {
            return result;
        }
    }

    for (let i = 0; i < game.flyings.length; i++) {
        const result = callback(game.flyings[i],
                                game.flyings[i].x - game.config.flying.width / 2,
                                game.flyings[i].y - game.config.flying.height / 2,
                                game.config.flying.width,
                                game.config.flying.height);
        if (result != null) {
            return result;
        }
    }
    for (let i = 0; i < game.clouds.length; i++) {
        const result = callback(game.clouds[i],
                                game.clouds[i].x - game.config.cloud.width / 2,
                                game.clouds[i].y - game.config.cloud.height / 2,
                                game.config.cloud.width,
                                game.config.cloud.height);
        if (result != null) {
            return result;
        }
    }
    for (let i = 0; i < game.block_fallings.length; i++) {
        if (game.block_fallings[i].visible) {
            const result = callback(game.block_fallings[i], game.block_fallings[i].original_x, game.block_fallings[i].original_y, game.config.tile_size, game.config.tile_size);
            if (result != null) {
                return result;
            }
        }
    }
    return null;
};

const overlap = function(entity, x, y, width, height) {
    return iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (object !== entity) {
            if (aabb(x, y, width, height, object_x, object_y, object_width, object_height)) {
                return object;
            }
        }
    });
};

const raycast = function(entity, x1, y1, x2, y2) {
    return iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (object !== entity) {
            if (point(object_x, object_y, object_width, object_height, x1, y1) ||
                point(object_x, object_y, object_width, object_height, x2, y2) ||
                segment(x1, y1, x2, y2, object_x, object_y, object_x + object_width, object_y + object_height) ||
                segment(x1, y1, x2, y2, object_x + object_width, object_y, object_x, object_y + object_height)) {
                return object;
            }
        }
    });
};

const move = function(entity, dx, dy, ox = 0, oy = 0) {
    const result = {
        top: false,
        bottom: false,
        left: false,
        right: false,
        dx: dx,
        dy: dy,
        object: null,
    };

    iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (entity !== object) {
            if (aabb(entity.x + ox - Math.max(-result.dx, 0),
                     entity.y + oy - Math.max(-result.dy, 0),
                     entity.bounds.width + Math.abs(result.dx),
                     entity.bounds.height + Math.abs(result.dy),
                     object_x, object_y, object_width, object_height)) {
                result.object = result.object || object;

                let delta_x = null;
                if (Math.abs(dx) > 1e-8) {
                    if ((entity.x + ox) < object_x) {
                        result.right = true;
                        delta_x = (object_x - ((entity.x + ox) + entity.bounds.width)) - result.dx;
                    } else {
                        result.left = true;
                        delta_x = ((object_x + object_width) - (entity.x + ox)) - result.dx;
                    }
                }

                let delta_y = null;
                if (Math.abs(dy) > 1e-8) {
                    if ((entity.y + oy) < object_y) {
                        result.bottom = true;
                        delta_y = (object_y - ((entity.y + oy) + entity.bounds.height)) - result.dy;
                    } else {
                        result.top = true;
                        delta_y = ((object_y + object_height) - (entity.y + oy)) - result.dy;
                    }
                }

                if (delta_y && (!delta_x || Math.abs(delta_y) < Math.abs(delta_x))) {
                    result.left = result.right = false;
                    result.dy += delta_y;
                } else if (delta_x) {
                    result.top = result.bottom = false;
                    result.dx += delta_x;
                }
            }
        }
    });

    entity.x += result.dx;
    entity.y += result.dy;

    return result;
};

module.exports = {
    aabb: aabb,
    point: point,
    raycast: raycast,
    segment: segment,
    overlap: overlap,
    move: move,
};

},{}],20:[function(require,module,exports){
const MovieClip = require("./movie_clip.js");
const Physics = require("./physics.js");
const Hat = require("./hat.js");

class Player extends MovieClip {
    constructor(x, y) {
        super({
            idle: { frames: game.resources.sprites["animations_32px_player_idle"], speed: 0.15 },
            crouching_idle: { frames: [game.resources.sprites["animations_32px_player_crouch_walk_0"]], speed: 0.15 },
            run: { frames: game.resources.sprites["animations_32px_player_run"], speed: 0.2 },
            crouching_run: { frames: game.resources.sprites["animations_32px_player_crouch_walk"], speed: 0.15 },
            jump: { frames: game.resources.sprites["animations_32px_player_jump"], speed: 0.15 },
            death: { frames: [game.resources.sprites["animations_32px_player_death_0"]], speed: 0.15 },
            climb: { frames: [game.resources.sprites["animations_32px_player_climb_0"]], speed: 0.15 },
        }, "idle");

        this.anchor.set(0.25, 0.38);
        this.x = this.previous_x = x;
        this.y = this.previous_y = y;
        this.play();

        this.bounds = {
            width: game.config.player.width,
            height: game.config.player.height
        };

        this.vertical_speed = game.config.player.fall_gravity;
        this.horizontal_speed = 0;
        this.is_grounded = false;
        this.crouching = false;
        this.late_jump_duration = 0;
        this.is_sliding = false;
        this.jump_off_walls_duration = 0;
        this.jump_off_left_wall = false;
        this.jump_off_right_wall = false;
        this.fall_factor = 1;
        this.post_jump_slowdown_duration = 0;
        this.face = "right";
        this.dead = false;
        this.hat = null;
        this.is_grounded_counter = 0;
        this.is_sliding_counter = 0;
    }

    update_movement(elapsed) {
        if (!this.dead) {
            const left_pressed = game.input.is_key_down("KeyA") | game.input.is_key_down("ArrowLeft");
            const right_pressed = game.input.is_key_down("KeyD") | game.input.is_key_down("ArrowRight");
            if (left_pressed && !right_pressed) {
                this.face = "left";
                this.horizontal_speed = Math.max(this.horizontal_speed - game.config.player.acceleration * elapsed, Math.min(this.horizontal_speed, -game.config.player.speed));
            } else if (right_pressed && !left_pressed) {
                this.face = "right";
                this.horizontal_speed = Math.min(this.horizontal_speed + game.config.player.acceleration * elapsed, Math.max(this.horizontal_speed, game.config.player.speed));
            } else {
                if (this.horizontal_speed > 0) {
                    this.horizontal_speed = Math.max(this.horizontal_speed - game.config.player.acceleration * elapsed, 0);
                } else {
                    this.horizontal_speed = Math.min(this.horizontal_speed + game.config.player.acceleration * elapsed, 0);
                }
            }

            if (Math.abs(this.horizontal_speed * elapsed) > 1e-8) {
                const time = Math.max(this.post_jump_slowdown_duration, 0) / game.config.player.post_jump_slowdown_duration;
                let slowdown_factor = game.config.player.post_jump_slowdown_factor + (1 - game.config.player.post_jump_slowdown_factor) * (1 - time);
                if (this.crouching) {
                    slowdown_factor *= game.config.player.crouching_speed_factor;
                }
                Physics.move(this, this.horizontal_speed * slowdown_factor * elapsed, 0);
            }
        } else {
            this.x += this.horizontal_speed * elapsed;
        }
    }

    update_sliding(elapsed) {
        this.is_sliding = false;
        if (Physics.overlap(this, this.x - 1e-2, this.y + this.bounds.height / 2 - 0.5, this.bounds.width, 1)) {
            this.is_sliding = true;
            this.jump_off_left_wall = true;
            this.jump_off_right_wall = false;
        }
        if (Physics.overlap(this, this.x + 1e-2, this.y + this.bounds.height / 2 - 0.5, this.bounds.width, 1)) {
            this.is_sliding = true;
            this.jump_off_left_wall = false;
            this.jump_off_right_wall = true;
        }

        if (this.is_sliding) {
            const time = Math.max(this.post_jump_slowdown_duration, 0) / game.config.player.post_jump_slowdown_duration;
            const sliding_factor = game.config.player.post_jump_sliding_factor * time;
            this.fall_factor = game.config.player.sliding_factor + (1 - game.config.player.sliding_factor) * sliding_factor;
            this.jump_off_walls_duration = game.config.player.jump_off_walls_duration;
        } else {
            this.fall_factor = 1;
            this.jump_off_walls_duration -= elapsed;
        }
    }

    update_jumping(elapsed) {
        const jump_pressed = !this.dead && game.input.is_key_pressed("Space");
        if (jump_pressed || this.early_jump_duration > 0) {
            this.early_jump_duration -= elapsed;

            if (this.late_jump_duration > 0 || this.jump_off_walls_duration > 0) {
                this.vertical_speed = -game.config.player.jump_speed;

                game.resources.sounds["Jump8"].play();

                if (this.jump_off_walls_duration > 0) {
                    if (this.jump_off_left_wall) {
                        this.horizontal_speed = game.config.player.jump_off_walls_speed;
                    } else if (this.jump_off_right_wall) {
                        this.horizontal_speed = -game.config.player.jump_off_walls_speed;
                    }
                }

                this.early_jump_duration = 0;
            } else if (jump_pressed) {
                this.early_jump_duration = game.config.player.early_jump_duration;
            }
        } else {
            this.early_jump_duration -= elapsed;
        }
    }

    update_gravity(elapsed) {
        if (!this.dead) {
            const hit = Math.abs(this.vertical_speed * elapsed) > 1e-8 ? Physics.move(this, 0, this.vertical_speed * elapsed) : null;
            this.is_grounded = hit && hit.bottom;
            if (this.is_grounded) {
                this.late_jump_duration = game.config.player.late_jump_duration;
                this.vertical_speed = game.config.player.fall_gravity;
            } else {
                this.late_jump_duration -= elapsed;
                if (hit && hit.top) {
                    this.vertical_speed = 0;
                } else {
                    if (this.vertical_speed < 0) {
                        const jump_down = !this.dead && game.input.is_key_down("Space");
                        if (jump_down) {
                            this.vertical_speed = Math.min(this.vertical_speed + game.config.player.gravity_acceleration * game.config.player.high_jump_gravity_factor * elapsed, game.config.player.max_gravity);
                        } else {
                            this.vertical_speed = Math.min(this.vertical_speed + game.config.player.gravity_acceleration * elapsed, game.config.player.max_gravity);
                        }
                    } else {
                        this.vertical_speed = Math.min((this.vertical_speed + game.config.player.gravity_acceleration * elapsed) * this.fall_factor, game.config.player.max_gravity);
                    }
                }
            }
            if (hit && hit.object) {
                if (hit.object.constructor.name === "Cloud" || hit.object.constructor.name === "Flying") {
                    this.is_grounded = false;
                }
            }
        } else {
            this.y += this.vertical_speed * elapsed;
            this.vertical_speed = Math.min(this.vertical_speed + game.config.player.gravity_acceleration * elapsed, game.config.player.max_gravity);
        }
    }

    update_sprite() {
        if (this.dead) {
            this.gotoAndPlay("death");
        } else {
            if (!this.dead && this.is_grounded) {
                if (Math.abs(this.horizontal_speed) < 1e-5) {
                    if (this.crouching) {
                        this.gotoAndPlay("crouching_idle");
                    } else {
                        this.gotoAndPlay("idle");
                    }
                } else {
                    if (this.crouching) {
                        this.gotoAndPlay("crouching_run");
                    } else {
                        this.gotoAndPlay("run");
                    }
                }
            } else {
                if (this.is_sliding) {
                    this.gotoAndPlay("climb");
                } else {
                    this.gotoAndPlay("jump");
                }
            }

            if (this.face === "left") {
                this.scale.x = -1;
                this.anchor.set(0.75, 0.38);
            } else {
                this.scale.x = 1;
                this.anchor.set(0.25, 0.38);
            }
        }
    }

    update_player(elapsed) {
        const was_grounded = this.is_grounded;
        const was_sliding = this.is_sliding;

        this.previous_x = this.x;
        this.previous_y = this.y;

        if (game.num_clicks >= 1) {
            this.update_movement(elapsed);
            this.update_sliding(elapsed);
            this.update_jumping(elapsed);
        }

        this.update_gravity(elapsed);
        this.update_sprite();

        if ((!was_grounded && this.is_grounded) || (!was_sliding && this.is_sliding)) {
            this.post_jump_slowdown_duration = game.config.player.post_jump_slowdown_duration;
        } else {
            this.post_jump_slowdown_duration -= elapsed;
        }

        if (was_grounded !== this.is_grounded) {
            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_dust_ground"]);
            effect.x = this.x + this.bounds.width / 2;

            if (!was_grounded && this.is_grounded) {
                effect.y = this.y + this.bounds.height - 32;
                game.resources.sounds["step"].play();
            } else {
                effect.y = this.previous_y + this.bounds.height - 32;
            }

            effect.anchor.set(0.5, 0);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                game.containers.effects.removeChild(effect);
            };
            game.containers.effects.addChild(effect);

        } else {
            if (this.is_grounded) {
                if (this.is_grounded_counter > 13) {
                    const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_dust_ground"]);
                    effect.x = this.x + this.bounds.width / 2;
                    effect.y = this.y + this.bounds.height - 32;
                    effect.anchor.set(0.5, 0);
                    effect.animationSpeed = 0.3;
                    effect.loop = false;
                    effect.play();
                    effect.onComplete = function () {
                        game.containers.effects.removeChild(effect);
                    };
                    game.containers.effects.addChild(effect);

                    game.resources.sounds["step"].play();

                    this.is_grounded_counter = 0;
                } else {
                    const left_pressed = game.input.is_key_down("KeyA") | game.input.is_key_down("ArrowLeft");
                    const right_pressed = game.input.is_key_down("KeyD") | game.input.is_key_down("ArrowRight");
                    if (left_pressed || right_pressed) {
                        this.is_grounded_counter++;
                    } else {
                        this.is_grounded_counter = 0;
                    }
                }
            } else {
                if (this.is_sliding) {
                    this.is_sliding_counter++;
                    if (this.is_sliding_counter === 5) {
                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_effect_dust_wall"]);
                        effect.x = this.x + this.bounds.width / 2 + Math.random() * 8 - 4;
                        if (this.jump_off_left_wall) {
                            effect.x -= 8;
                        } else {
                            effect.x += 8;
                        }
                        effect.y = this.y + this.bounds.height / 2 + Math.random() * 8 - 4;
                        effect.anchor.set(0.5, 0.5);
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function () {
                            game.containers.front_effects.removeChild(effect);
                        };
                        game.containers.front_effects.addChild(effect);

                        game.resources.sounds["wall_grab"].play();

                        this.is_sliding_counter = 0;
                    }
                } else {
                    this.is_sliding_counter = 0;
                }
            }
        }

        if (this.hat) {
            this.hat.update_hat(elapsed);
        }

        const down_pressed = game.input.is_key_down("KeyS") || game.input.is_key_down("ArrowDown");
        this.crouching = !!(this.is_grounded && down_pressed);

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height);
        }
    }

    murder() {
        if (!this.dead) {
            this.dead = true;

            if (this.face === "left") {
                this.horizontal_speed = 100;
                this.vertical_speed = -300;
            } else {
                this.horizontal_speed = -100;
                this.vertical_speed = -300;
            }

            game.containers.level.addChild(this);

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);
            game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);

            this.hat = new Hat(this.x + this.bounds.width / 2, this.y + this.bounds.height / 6, this.horizontal_speed * 1.5, this.vertical_speed * 1.15);
            game.containers.level.addChild(this.hat);

            game.resources.sounds["death"].play();
        }
    }
}

module.exports = Player;

},{"./hat.js":14,"./movie_clip.js":18,"./physics.js":19}],21:[function(require,module,exports){
const update_physical_size = function() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    render.scale = 1;
    render.physical_width = render.render_width;
    render.physical_height = render.render_height;

    do {
        const new_physical_width = render.render_width * (render.scale + 1);
        const new_physical_height = render.render_height * (render.scale + 1);
        if (new_physical_width < width && new_physical_height < height) {
            render.physical_width = new_physical_width;
            render.physical_height = new_physical_height;
            render.scale++;
        } else {
            break;
        }
    } while (render.scale < 10);

    const game_window = document.getElementById("game_window");
    game_window.style.width = render.physical_width + "px";
    game_window.style.height = render.physical_height + "px";
    game_window.style.marginLeft = (-render.physical_width / 2) + "px";
    game_window.style.marginTop = (-render.physical_height / 2) + "px";

    render.application.view.style.width = render.physical_width + "px";
    render.application.view.style.height = render.physical_height + "px";
};

const init_window = function() {
    PIXI.settings.ROUND_PIXELS = true;

    render.application = new PIXI.Application({ width: render.render_width, height: render.render_height });
    render.stage = render.application.stage;

    const game_window = document.getElementById("game_window");
    game_window.appendChild(render.application.view);

    render.application.view.onselectstart = () => false;
    render.application.view.oncontextmenu = event => event.preventDefault();

    update_physical_size();
    window.onresize = update_physical_size;

    delete render.init;
};

const render = {
    init: init_window,
    render_width: 400,
    render_height: 240,
    physical_width: 0,
    physical_height: 0,
    scale: 1,
    application: null,
    stage: null,
};

module.exports = render;

},{}],22:[function(require,module,exports){
const load_levels = function() {
    function load_level(name) {
        levels.total_count++;

        function parse_level(text) {
            const xml = new DOMParser().parseFromString(text, "text/xml");
            const level = xml.getElementsByTagName("level")[0];
            const result = {
                width: parseInt(level.getAttribute("width")),
                height: parseInt(level.getAttribute("height"))
            };
            for (let i in level.childNodes) {
                if (level.childNodes.hasOwnProperty(i)) {
                    const container = level.childNodes[i];
                    if (container.nodeType === 1) {
                        if (container.hasAttribute("tileset")) {
                            const tiles = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const tile = container.childNodes[j];
                                    if (tile.nodeType === 1) {
                                        tiles.push({
                                            x: parseInt(tile.getAttribute("x")),
                                            y: parseInt(tile.getAttribute("y")),
                                            tx: parseInt(tile.getAttribute("tx")),
                                            ty: parseInt(tile.getAttribute("ty")),
                                        });
                                    }
                                }
                            }
                            result[container.tagName] = tiles;
                        } else if (container.hasAttribute("exportMode")) {
                            const rectangles = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const rectangle = container.childNodes[j];
                                    if (rectangle.nodeType === 1) {
                                        rectangles.push({
                                            x: parseInt(rectangle.getAttribute("x")),
                                            y: parseInt(rectangle.getAttribute("y")),
                                            width: parseInt(rectangle.getAttribute("w")),
                                            height: parseInt(rectangle.getAttribute("h")),
                                        });
                                    }
                                }
                            }
                            result[container.tagName] = rectangles;
                        } else {
                            const entities = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const xml_entity = container.childNodes[j];
                                    if (xml_entity.nodeType === 1) {
                                        const entity = { type: xml_entity.tagName };
                                        for (let k in xml_entity.attributes) {
                                            if (xml_entity.attributes.hasOwnProperty(k)) {
                                                let value = xml_entity.attributes[k].value;
                                                if (!isNaN(value)) {
                                                    value = +value;
                                                }
                                                if (value === "True") {
                                                    value = true;
                                                } else if (value === "False") {
                                                    value = false;
                                                }
                                                entity[xml_entity.attributes[k].name] = value;
                                            }
                                        }
                                        for (let k in xml_entity.childNodes) {
                                            if (xml_entity.childNodes.hasOwnProperty(k)) {
                                                const node = xml_entity.childNodes[k];
                                                if (node.nodeType === 1 && node.tagName === "node") {
                                                    entity.nodes = entity.nodes || [];
                                                    entity.nodes.push({
                                                        x: parseInt(node.getAttribute("x")),
                                                        y: parseInt(node.getAttribute("y")),
                                                    });
                                                }
                                            }
                                        }
                                        entities.push(entity);
                                    }
                                }
                            }
                            result[container.tagName] = entities;
                        }
                    }
                }
            }
            return result;
        }

        const client = new XMLHttpRequest();
        client.open("GET", `levels/${name}.oel`);
        client.onload = function() {
            levels[name] = parse_level(client.responseText);
            if (++levels.loaded_count === levels.total_count) {
                const temp = levels.on_load;

                delete levels.load;
                delete levels.on_load;
                delete levels.total_count;
                delete levels.loaded_count;

                temp && temp();
            }
        };
        client.send();
    }

    load_level("main_menu_0");
    load_level("backstage_1");
    load_level("stage_1");
    load_level("backstage_2");
    load_level("stage_2");
    load_level("backstage_3");
    load_level("level0");
    load_level("main_menu_1");
};

const levels = {
    load: load_levels,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = levels;

},{}],23:[function(require,module,exports){
const try_on_load = function() {
    if (resources.sprites_loaded === true && resources.sounds_loaded === true && resources.levels_loaded === true && resources.on_load) {
        const temp = resources.on_load();

        delete resources.load;
        delete resources.sprites_loaded;
        delete resources.sounds_loaded;
        delete resources.levels_loaded;
        delete resources.on_load;

        temp && temp();
    }
};

const load_resources = function() {
    resources.sprites = require("./sprites.js");
    resources.sprites.on_load = function() {
        resources.sprites_loaded = true;
        try_on_load();
    };
    resources.sprites.load();

    resources.sounds = require("./sounds.js");
    resources.sounds.on_load = function() {
        resources.sounds_loaded = true;
        try_on_load();
    };
    resources.sounds.load();

    resources.levels = require("./levels.js");
    resources.levels.on_load = function() {
        resources.levels_loaded = true;
        try_on_load();
    };
    resources.levels.load();
};

const resources = {
    load: load_resources,
    sprites_loaded: false,
    sounds_loaded: false,
    levels_loaded: false,
    on_load: null,
};

module.exports = resources;

},{"./levels.js":22,"./sounds.js":24,"./sprites.js":25}],24:[function(require,module,exports){
const load_sounds = function() {
    function load_sound(name, volume = 1.0, extension = "wav", loop = false) {
        sounds.total_count++;
        sounds[name] = new Howl({
            src: [ `sounds/${name}.${extension}` ],
            autoplay: loop,
            loop: loop,
            volume: volume,
            onload: function() {
                if (++sounds.loaded_count === sounds.total_count) {
                    const temp = sounds.on_load;

                    delete sounds.load;
                    delete sounds.on_load;
                    delete sounds.total_count;
                    delete sounds.loaded_count;

                    temp && temp();
                }
            }
        });
    }

    load_sound("music", 1, "mp3", true);
    load_sound("block_unstable", 20);
    load_sound("death", 1);
    load_sound("Explosion4", 1);
    load_sound("Jump8", 1);
    load_sound("Laser_Shoot8", 1);
    load_sound("Pickup_Coin9", 1);
    load_sound("step", 8);
    load_sound("wall_grab", 3);
};

const sounds = {
    load: load_sounds,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = sounds;

},{}],25:[function(require,module,exports){
const load_sprites = function() {
    function sprites_loaded(loader, resources) {
        const temp = sprites.on_load;

        delete sprites.on_load;
        delete sprites.load;

        for (let key in resources) {
            if (resources.hasOwnProperty(key)) {
                if (resources[key].hasOwnProperty("spritesheet")) {
                    for (let name in resources[key].spritesheet.textures) {
                        if (resources[key].spritesheet.textures.hasOwnProperty(name)) {
                            sprites[name] = resources[key].spritesheet.textures[name];
                        }
                    }
                    for (let name in resources[key].spritesheet.animations) {
                        if (resources[key].spritesheet.animations.hasOwnProperty(name)) {
                            sprites[name] = resources[key].spritesheet.animations[name];
                        }
                    }
                }
            }
        }

        temp && temp();
    }

    PIXI.Loader.shared
        .add("upheaval", "sprites/font.fnt")
        .add("sprites/atlas.json")
        .load(sprites_loaded);
};

const sprites = {
    load: load_sprites,
    on_load: null,
};

module.exports = sprites;

},{}],26:[function(require,module,exports){
class Tutorial extends PIXI.AnimatedSprite {
    constructor(x, y, frame_a, frame_b) {
        super([ game.resources.sprites[frame_a], game.resources.sprites[frame_b] ]);
        this.animationSpeed = 0.025;
        this.x = x;
        this.y = y;
        this.anchor.set(0.5, 0.5);
        this.alpha = 0.5;
        this.play();
        this.visible = game.num_clicks >= 1;
        this.onFrameChange = function() {
            this.visible = game.num_clicks >= 1;
        };
    }
}

module.exports = Tutorial;

},{}]},{},[17]);
