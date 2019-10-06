const MovieClip = require("../movie_clip.js");
const Physics = require("../physics.js");

class Cloud extends MovieClip {
    constructor(x, y, nodes) {
        super({
            idle: {frames: game.resources.sprites["animations_32px_enemy_cloud_idle"], speed: 0.15},
            jump: {frames: game.resources.sprites["animations_32px_enemy_cloud_jump"], speed: 0.15, loop: false},
        }, "idle");

        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.play();

        this.nodes = nodes ? nodes.slice() : [];
        this.nodes.unshift({ x: x, y: y });
        this.current_node = 0;

        this.bounds = {
            width: game.config.cloud.width,
            height: game.config.cloud.height
        };

        this.onComplete = function() {
            if (this.animation === "jump") {
                this.gotoAndPlay("idle");
            }
        };
    }

    update_cloud(elapsed) {
        const next_node = (this.current_node + 1) % this.nodes.length;
        const distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        const displacement = Math.min(game.config.cloud.speed * elapsed, distance);
        const delta_x = distance > 1e-5 ? (this.nodes[next_node].x - this.x) / distance * displacement : 0;
        const delta_y = distance > 1e-5 ? (this.nodes[next_node].y - this.y) / distance * displacement : 0;

        if (Physics.aabb(this.x - game.config.cloud.width / 2, this.y - game.config.cloud.height / 2,
                         game.config.cloud.width, game.config.cloud.height,
                         game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height + 1e-1)) {
            game.player.vertical_speed = -250;
            game.player.y = this.y + delta_y - game.config.cloud.height / 2 - game.player.bounds.height;
            this.gotoAndPlay("jump");
        }

        this.x += delta_x;
        this.y += delta_y;

        const new_distance = Math.sqrt((this.x - this.nodes[next_node].x) * (this.x - this.nodes[next_node].x) + (this.y - this.nodes[next_node].y) * (this.y - this.nodes[next_node].y));
        if (new_distance < 1e-5) {
            this.current_node = next_node;
        }

        if (game.draw_hitboxes) {
            game.containers.hitboxes.drawRect(this.x - game.config.cloud.width / 2, this.y - game.config.cloud.height / 2, game.config.cloud.width, game.config.cloud.height);
        }
    }
}

module.exports = Cloud;
