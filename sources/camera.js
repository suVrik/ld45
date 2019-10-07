class Camera {
    constructor() {
        this.offset = 0;
    }

    update_camera(elapsed) {
        if (!game.player.dead) {
            game.containers.level.x = Math.max(Math.min(game.render.render_width / 2 - game.player.x, 0), game.render.render_width - game.config.level.width);

            const target_offset = game.render.render_height / 3;
            if (game.player.crouching) {
                this.offset = Math.min(this.offset + elapsed * 3 * target_offset, target_offset);
            } else {
                this.offset = Math.max(this.offset - elapsed * 4 * target_offset, 0);
            }

            let top_edge = 0;
            let bottom_edge = game.render.render_height - game.config.level.height;
            top_edge += game.dialog_time;
            bottom_edge -= game.dialog_time;

            game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - game.player.y - this.offset, top_edge), bottom_edge);
        }
    }
}

module.exports = Camera;
