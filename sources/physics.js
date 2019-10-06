const aabb = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw - 1e-8 && ax + aw - 1e-8 > bx && ay < by + bh - 1e-8 && ay + ah - 1e-8 > by;
};

const iterate_over_all_hitboxes = function(callback) {
    const hitboxes = game.level["hitboxes"];
    for (let i = 0; i < hitboxes.length; i++) {
        const result = callback(hitboxes[i], hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height);
        if (result != null) {
            return result;
        }
    }
    for (let i = 0; i < game.flyings.length; i++) {
        const result = callback(game.flyings[i],
                                game.flyings[i].x - game.config.flying.width / 2,
                                game.flyings[i].y - game.config.flying.height / 2,
                                game.config.flying.width,
                                game.config.flying.height);
        if (result != null) {
            return result;
        }
    }
    for (let i = 0; i < game.clouds.length; i++) {
        const result = callback(game.clouds[i],
                                game.clouds[i].x - game.config.cloud.width / 2,
                                game.clouds[i].y - game.config.cloud.height / 2,
                                game.config.cloud.width,
                                game.config.cloud.height);
        if (result != null) {
            return result;
        }
    }
    return null;
};

const overlap = function(x, y, width, height) {
    return iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (aabb(x, y, width, height, object_x, object_y, object_width, object_height)) {
            return object;
        }
    });
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

    iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (aabb(entity.x - Math.max(-result.dx, 0),
                 entity.y - Math.max(-result.dy, 0),
                 entity.bounds.width + Math.abs(result.dx),
                 entity.bounds.height + Math.abs(result.dy),
                 object_x, object_y, object_width, object_height)) {
            result.object = result.object || object;

            let delta_x = null;
            if (Math.abs(dx) > 1e-8) {
                if (entity.x < object_x) {
                    result.right = true;
                    delta_x = (object_x - (entity.x + entity.bounds.width)) - result.dx;
                } else {
                    result.left = true;
                    delta_x = ((object_x + object_width) - entity.x) - result.dx;
                }
            }

            let delta_y = null;
            if (Math.abs(dy) > 1e-8) {
                if (entity.y < object_y) {
                    result.bottom = true;
                    delta_y = (object_y - (entity.y + entity.bounds.height)) - result.dy;
                } else {
                    result.top = true;
                    delta_y = ((object_y + object_height) - entity.y) - result.dy;
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
    });

    entity.x += result.dx;
    entity.y += result.dy;

    return result;
};

module.exports = {
    aabb: aabb,
    overlap: overlap,
    move: move,
};
