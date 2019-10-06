class Camera {
    update_camera(elapsed) {
        const desired_x = game.render.render_width / 2 - game.player.x;
        game.containers.level.x = Math.max(Math.min(desired_x, 0), game.render.render_width - game.config.level.width);
        game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - game.player.y, 0), game.render.render_height - game.config.level.height);
    }
}

module.exports = Camera;
