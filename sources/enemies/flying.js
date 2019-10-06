const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");
const FlyingProjectile = require("./flying_projectile.js");

class Flying extends MovieClip {
    constructor(x, y, nodes) {
        super({
            idle: {frames: game.resources.sprites["animations_32px_enemy_flying_fly"], speed: 0.15},
        }, "idle");

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.play();

        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;
        this.attack_cooldown = 0;

        this.bounds = {
            width: game.config.flying.width,
            height: game.config.flying.height
        };
    }

    update_flying(elapsed) {
        const next_node = (this.current_node + 1) % this.nodes.length;
        const distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        const displacement = Math.min(game.config.flying.speed * elapsed, distance);
        const delta_x = distance > 1e-5 ? (this.nodes[next_node].x - this.x) / distance * displacement : 0;
        const delta_y = distance > 1e-5 ? (this.nodes[next_node].y - this.y) / distance * displacement : 0;

        this.attack_cooldown -= elapsed;

        if (!game.player.dead) {
            if (Physics.aabb(this.x - game.config.flying.width / 2, this.y - game.config.flying.height / 2,
                             game.config.flying.width, game.config.flying.height,
                             game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height + 1e-1)) {
                game.player.vertical_speed = -250;
                game.player.y = this.y + delta_y - game.config.flying.height / 2 - game.player.bounds.height;

                game.flyings.splice(game.flyings.indexOf(this), 1);
                this.parent.removeChild(this);
            }
        }

        if (Math.abs(delta_x) > 1e-5) {
            if (delta_x > 0) {
                this.scale.x = 1;
            } else {
                this.scale.x = -1;
            }
        }

        this.x += delta_x;
        this.y += delta_y;

        if (this.attack_cooldown <= 0 && !game.player.dead) {
            if (Physics.aabb(this.x - game.config.flying.attack_area_width / 2, this.y + game.config.flying.height / 2, game.config.flying.attack_area_width, game.config.flying.attack_area_height,
                game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height + 1e-1)) {
                const flying_projectile = new FlyingProjectile(this.x, this.y + game.config.flying.height / 2 + game.config.flying.projectile_size / 2 + 1);
                game.flying_projectiles.push(flying_projectile);
                game.containers.entities.addChild(flying_projectile);
                this.attack_cooldown = game.config.flying.projectile_cooldown;
            }
        }

        const new_distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        if (new_distance < 1e-5) {
            this.current_node = next_node;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.flying.width / 2, this.y - game.config.flying.height / 2, game.config.flying.width, game.config.flying.height);
            game.containers.hitboxes.lineStyle(1, 0xFFFF00, 1);
            game.containers.hitboxes.drawRect(this.x - game.config.flying.attack_area_width / 2, this.y + game.config.flying.height / 2, game.config.flying.attack_area_width, game.config.flying.attack_area_height);
            game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);
        }
    }
}

module.exports = Flying;
