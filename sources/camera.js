class Camera {
    update_camera(elapsed) {
        if (!game.player.dead) {
            game.containers.level.x = Math.max(Math.min(game.render.render_width / 2 - game.player.x, 0), game.render.render_width - game.config.level.width);
            game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - game.player.y, 0), game.render.render_height - game.config.level.height);
        }
    }
}

module.exports = Camera;
