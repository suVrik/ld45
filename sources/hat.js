"use strict";

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
