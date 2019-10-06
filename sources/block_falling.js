const MovieClip = require("./movie_clip.js");
const Physics = require("./physics.js");

class BlockFalling extends MovieClip {
    constructor(x, y) {
        super({
            idle: { name: "idle", frames: [game.resources.sprites["block_falling"]], speed: 0.1 },
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
                }
            } else {
                this.respawn_timeout -= elapsed;
                if (this.respawn_timeout < 0) {
                    this.destroy_timeout = null;
                    this.respawn_timeout = null;
                    this.visible = true;
                }
            }
        }

    }

}

module.exports = BlockFalling;
