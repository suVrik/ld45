"use strict";

class Exit {
    constructor(x, y, next_level) {
        this.x = x;
        this.y = y;
        this.next_level = next_level;
        this.played = false;
    }

    update_exit() {
        if (!game.player.dead) {
            if (game.player.x + game.player.bounds.width / 2 > this.x && game.player.x + game.player.bounds.width / 2 < this.x + game.config.tile_size * 2 && game.player.y + game.player.bounds.height / 2 > this.y && game.player.y + game.player.bounds.height / 2 < this.y + game.config.tile_size * 2) {
                if (!this.played) {
                    this.played = true;
                    game.resources.sounds["stair_up"].play();
                }

                return this.next_level;
            }
        }
        return null;
    }
}

module.exports = Exit;
