const Physics = require("../physics.js");

class FlyingProjectile extends PIXI.Sprite {
    constructor(x, y) {
        super(game.resources.sprites["projectile_flying"]);

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.scale.x = this.scale.y = 0.5;
    }

    update_flying_projectile(elapsed) {
        this.y += game.config.flying.projectile_speed * elapsed;

        if (this.scale.x < 1) {
            this.scale.x = Math.min(this.scale.x + elapsed * 3, 1);
            this.scale.y = this.scale.x;
        }

        if (Physics.aabb(this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }

        if (Physics.overlap(game.player, this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size)) {
            game.flying_projectiles.splice(game.flying_projectiles.indexOf(this), 1);
            this.parent.removeChild(this);
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.flying.projectile_size / 2, this.y - game.config.flying.projectile_size / 2, game.config.flying.projectile_size, game.config.flying.projectile_size);
        }
    }
}

module.exports = FlyingProjectile;
