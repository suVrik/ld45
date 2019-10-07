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
        if (Physics.aabb(this.x, this.y, game.config.coin.size, game.config.coin.size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.coins.splice(game.coins.indexOf(this), 1);
            this.parent.removeChild(this);
        }
        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x, this.y, game.config.coin.size, game.config.coin.size);
        }
    }
}

module.exports = Coin;
