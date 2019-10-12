"use strict";

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
            const force_next_level = game.input.is_key_down("ShiftLeft") && game.input.is_key_down("Digit9") && game.input.is_key_pressed("Digit0");
            if (force_next_level || (game.player.x + game.player.bounds.width / 2 > this.x && game.player.x + game.player.bounds.width / 2 < this.x + game.config.tile_size * 2 && game.player.y + game.player.bounds.height / 2 > this.y && game.player.y + game.player.bounds.height / 2 < this.y + game.config.tile_size * 2)) {
                if (this.timeout == null) {
                    this.item.visible = true;
                    this.timeout = 0.75;

                    for (let i = 0; i < 5; i++) {
                        const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_coin_flash"]);
                        effect.x = this.x + 8 + Math.random() * 20 - 10;
                        effect.y = this.y + 2 + Math.random() * 20 - 10;
                        effect.animationSpeed = 0.3;
                        effect.loop = false;
                        effect.play();
                        effect.onComplete = function () {
                            effect.destroy();
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
