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
    }

    update_movement(elapsed) {
        if (!this.dead) {
            const left_pressed = game.input.is_key_down("KeyA");
            const right_pressed = game.input.is_key_down("KeyD");
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

        this.update_movement(elapsed);
        this.update_sliding(elapsed);
        this.update_jumping(elapsed);
        this.update_gravity(elapsed);
        this.update_sprite();

        if ((!was_grounded && this.is_grounded) || (!was_sliding && this.is_sliding)) {
            this.post_jump_slowdown_duration = game.config.player.post_jump_slowdown_duration;
        } else {
            this.post_jump_slowdown_duration -= elapsed;
        }

        if (this.hat) {
            this.hat.update_hat(elapsed);
        }

        const down_pressed = game.input.is_key_down("KeyS") || game.input.is_key_down("Down");
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
