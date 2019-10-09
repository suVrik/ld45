class Exit {
    constructor(x, y, next_level) {
        this.x = x;
        this.y = y;
        this.next_level = next_level;
    }

    update_exit() {
        if (!game.player.dead) {
            const force_next_level = game.input.is_key_down("ShiftLeft") && game.input.is_key_down("Digit9") && game.input.is_key_pressed("Digit0");
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
