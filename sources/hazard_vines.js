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
