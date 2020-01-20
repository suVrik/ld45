"use strict";

class Camera {
    constructor() {
        this.offset = 0;
        this.player_x = 0;
        this.player_y = 0;
    }

    update_camera(elapsed) {
        if (!game.player.dead) {
            const target_offset = game.render.render_height / 3;
            if (game.player.crouching) {
                this.offset = Math.min(this.offset + elapsed * 3 * target_offset, target_offset);
            } else if (game.player.looking_upwards) {
                this.offset = Math.max(this.offset - elapsed * 3 * target_offset, -target_offset);
            } else {
                if (this.offset > 0) {
                    this.offset = Math.max(this.offset - elapsed * 4 * target_offset, 0);
                } else if (this.offset < 0) {
                    this.offset = Math.min(this.offset + elapsed * 4 * target_offset, 0);
                }
            }

            this.player_x = game.player.x;
            this.player_y = game.player.y;
        }

        game.containers.level.x = Math.max(Math.min(game.render.render_width / 2 - this.player_x, 0), game.render.render_width - game.config.level.width);

        game.branding.x = 15 + (game.containers.level.x + 40) * game.render.scale;
        game.branding.y = game.render.physical_height - 140;

        let top_edge = 0;
        let bottom_edge = game.render.render_height - game.config.level.height;
        top_edge += game.dialog_time;
        bottom_edge -= game.dialog_time;

        game.branding_mask.clear();
        game.branding_mask.beginFill(0xFFFFFFFF);
        game.branding_mask.drawRect(0, game.dialog_time * game.render.scale, game.render.physical_width, game.render.physical_height - game.dialog_time * 2  * game.render.scale);
        game.branding_mask.endFill();

        game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - this.player_y - this.offset, top_edge), bottom_edge);
    }
}

module.exports = Camera;
