"use strict";

const Physics = require("../physics.js");

class SpittingProjectile extends PIXI.AnimatedSprite {
    constructor(sx, sy, bx, by, tx, ty, distance) {
        super(game.resources.sprites["animations_16px_projectile_spit"]);

        this.anchor.set(0.5, 0.5);
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.bx = bx;
        this.by = by;
        this.tx = tx;
        this.ty = ty;
        this.distance = distance;
        this.t = 0;
        this.scale.x = this.scale.y = 0.5;
        this.play();
    }

    update_spitting_projectile(elapsed) {
        this.t += elapsed * game.config.spitting.projectile_speed / this.distance;

        if (this.t < 1) {
            this.x = (1 - this.t) * (1 - this.t) * this.sx + 2 * this.t * (1 - this.t) * this.bx + this.t * this.t * this.tx;
            this.y = (1 - this.t) * (1 - this.t) * this.sy + 2 * this.t * (1 - this.t) * this.by + this.t * this.t * this.ty;
        } else {
            const last_x = 0.01 * this.sx + 0.18 * this.bx + 0.81 * this.tx;
            const last_y = 0.01 * this.sy + 0.18 * this.by + 0.81 * this.ty;
            const distance = Math.sqrt((last_x - this.tx) * (last_x - this.tx) + (last_y - this.ty) * (last_y - this.ty));
            if (distance > 1e-5) {
                this.x += elapsed * game.config.spitting.projectile_speed * (this.tx - last_x) / distance;
                this.y += elapsed * game.config.spitting.projectile_speed * (this.ty - last_y) / distance;
            } else {
                game.spitting_projectiles.splice(game.spitting_projectiles.indexOf(this), 1);
                this.destroy();
                return;
            }
        }

        if (this.scale.x < 1) {
            this.scale.x = Math.min(this.scale.x + elapsed * 3, 1);
            this.scale.y = this.scale.x;
        }

        if (Physics.aabb(this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }

        if (Physics.overlap(game.player, this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size)) {
            game.spitting_projectiles.splice(game.spitting_projectiles.indexOf(this), 1);

            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_16px_effect_projectile_spit"]);
            effect.x = this.x;
            effect.y = this.y;
            effect.anchor.set(0.5, 0.5);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                effect.destroy();
            };
            game.containers.front_effects.addChild(effect);

            this.destroy();
            return;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.spitting.projectile_size / 2, this.y - game.config.spitting.projectile_size / 2, game.config.spitting.projectile_size, game.config.spitting.projectile_size);
        }
    }
}

module.exports = SpittingProjectile;
