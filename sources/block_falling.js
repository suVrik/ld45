const MovieClip = require("./movie_clip.js");
const Physics = require("./physics.js");

class BlockFalling extends MovieClip {
    constructor(x, y) {
        super({
            idle: { frames: [game.resources.sprites["block_falling"]], speed: 0.1 },
        }, "idle");

        this.x = x;
        this.y = y;
        this.destroy_timeout = null;
        this.respawn_timeout = null;
    }

    update_block_falling(elapsed) {
        if (this.destroy_timeout == null) {
            if (!game.player.dead) {
                if (Physics.aabb(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height, this.x - 1e-1, this.y - 1e-1, game.config.tile_size + 2e-1, game.config.tile_size + 2e-1)) {
                    this.destroy_timeout = game.config.block_falling.destroy_timeout;
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
                }
            } else {
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
