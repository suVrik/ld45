const aabb = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw - 1e-8 && ax + aw - 1e-8 > bx && ay < by + bh - 1e-8 && ay + ah - 1e-8 > by;
};

const overlap = function(x, y, width, height) {
    const hitboxes = game.level["hitboxes"];
    for (let i = 0; i < hitboxes.length; i++) {
        if (aabb(x, y, width, height, hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height)) {
            return hitboxes[i];
        }
    }
    return null;
};

const move = function(entity, dx, dy) {
    const result = {
        top: false,
        bottom: false,
        left: false,
        right: false,
        dx: dx,
        dy: dy,
        object: null,
    };

    const hitboxes = game.level["hitboxes"];
    for (let i = 0; i < hitboxes.length; i++) {
        const hitbox = hitboxes[i];
        if (aabb(entity.x - Math.max(-result.dx, 0),
                 entity.y - Math.max(-result.dy, 0),
                 entity.bounds.width + Math.abs(result.dx),
                 entity.bounds.height + Math.abs(result.dy),
                 hitbox.x, hitbox.y, hitbox.width, hitbox.height)) {
            result.object = result.object || hitbox;

            let delta_x = null;
            if (Math.abs(dx) > 1e-8) {
                if (entity.x < hitbox.x) {
                    result.right = true;
                    delta_x = (hitbox.x - (entity.x + entity.bounds.width)) - result.dx;
                } else {
                    result.left = true;
                    delta_x = ((hitbox.x + hitbox.width) - entity.x) - result.dx;
                }
            }

            let delta_y = null;
            if (Math.abs(dy) > 1e-8) {
                if (entity.y < hitbox.y) {
                    result.bottom = true;
                    delta_y = (hitbox.y - (entity.y + entity.bounds.height)) - result.dy;
                } else {
                    result.top = true;
                    delta_y = ((hitbox.y + hitbox.height) - entity.y) - result.dy;
                }
            }

            if (delta_y && (!delta_x || Math.abs(delta_y) < Math.abs(delta_x))) {
                result.left = result.right = false;
                result.dy += delta_y;
            } else if (delta_x) {
                result.top = result.bottom = false;
                result.dx += delta_x;
            }
        }
    }

    entity.x += result.dx;
    entity.y += result.dy;

    return result;
};

module.exports = {
    aabb: aabb,
    overlap: overlap,
    move: move,
};
