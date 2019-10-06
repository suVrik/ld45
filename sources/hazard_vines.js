const Physics = require("./physics");

class HazardVines extends PIXI.AnimatedSprite {
    constructor(x, y) {
        super([ game.resources.sprites["hazard_vines"] ]);

        this.x = x;
        this.y = y;
    }

    update_hazard_vines() {
        if (Physics.aabb(game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height, this.x, this.y, game.config.tile_size, game.config.tile_size)) {
            game.player.murder();
        }
    }

}

module.exports = HazardVines;
