const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");

class Spiky extends MovieClip {
    constructor(x, y, nodes) {
        super({
            idle: {name: "idle", frames: game.resources.sprites["animations_32px_enemy_spiky_walk"], speed: 0.15},
        }, "idle");

        this.anchor.set(0.5, 1);
        this.x = x;
        this.y = y;
        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;
        this.play();

        this.bounds = {
            width: game.config.spiky.width,
            height: game.config.spiky.height
        };
    }

    update_spiky(elapsed) {
        const next_node = (this.current_node + 1) % this.nodes.length;
        if (this.x < this.nodes[next_node].x) {
            this.x = Math.min(this.x + game.config.spiky.speed * elapsed, this.nodes[next_node].x);
            this.scale.x = 1;
        } else {
            this.x = Math.max(this.x - game.config.spiky.speed * elapsed, this.nodes[next_node].x);
            this.scale.x = -1;
        }
        if (Math.abs(this.x - this.nodes[next_node].x) < 1e-5) {
            this.current_node = next_node;
        }
        if (Physics.aabb(this.x - game.config.spiky.width / 2, this.y - game.config.spiky.height, game.config.spiky.width, game.config.spiky.height, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
            game.player.murder();
        }
        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.spiky.width / 2, this.y - game.config.spiky.height, game.config.spiky.width, game.config.spiky.height);
        }
    }
}

module.exports = Spiky;
