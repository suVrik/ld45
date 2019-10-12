"use strict";

const aabb = function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw - 1e-8 && ax + aw - 1e-8 > bx && ay < by + bh - 1e-8 && ay + ah - 1e-8 > by;
};

const point = function(x, y, width, height, px, py) {
    return px > x && px < x + width && py > y && py < y + height;
};

const segment = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    function area(_x1, _y1, _x2, _y2, _x3, _y3) {
        return (_x2 - _x1) * (_y3 - _y1) - (_y2 - _y1) * (_x3 - _x1);
    }

    function intersect_1(a, b, c, d) {
        if (a > b) {
            const temp = a;
            a = b;
            b = temp;
        }
        if (c > d) {
            const temp = c;
            c = d;
            d = temp;
        }
        return Math.max(a, c) < Math.min(b, d);
    }

    return intersect_1(x1, x2, x3, x4) && intersect_1(y1, y2, y3, y4) && area(x1, y1, x2, y2, x3, y3) * area(x1, y1, x2, y2, x4, y4) < 1e-8 && area(x3, y3, x4, y4, x1, y1) * area(x3, y3, x4, y4, x2, y2) < 1e-8;
};

const iterate_over_all_hitboxes = function(callback) {
    const hitboxes = game.level["hitboxes"];
    for (let i = 0; i < hitboxes.length; i++) {
        const result = callback(hitboxes[i], hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height);
        if (result != null) {
            return result;
        }
    }

    {
        const result = callback(game.player, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height);
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
    for (let i = 0; i < game.block_fallings.length; i++) {
        if (game.block_fallings[i].visible) {
            const result = callback(game.block_fallings[i], game.block_fallings[i].original_x, game.block_fallings[i].original_y, game.config.tile_size, game.config.tile_size);
            if (result != null) {
                return result;
            }
        }
    }
    return null;
};

const overlap = function(entity, x, y, width, height) {
    return iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (object !== entity) {
            if (aabb(x, y, width, height, object_x, object_y, object_width, object_height)) {
                return object;
            }
        }
    });
};

const raycast = function(entity, x1, y1, x2, y2) {
    return iterate_over_all_hitboxes(function(object, object_x, object_y, object_width, object_height) {
        if (object !== entity) {
            if (point(object_x, object_y, object_width, object_height, x1, y1) ||
                point(object_x, object_y, object_width, object_height, x2, y2) ||
                segment(x1, y1, x2, y2, object_x, object_y, object_x + object_width, object_y + object_height) ||
                segment(x1, y1, x2, y2, object_x + object_width, object_y, object_x, object_y + object_height)) {
                return object;
            }
        }
    });
};

const move = function(entity, dx, dy, ox = 0, oy = 0) {
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
        if (entity !== object) {
            if (aabb(entity.x + ox - Math.max(-result.dx, 0),
                     entity.y + oy - Math.max(-result.dy, 0),
                     entity.bounds.width + Math.abs(result.dx),
                     entity.bounds.height + Math.abs(result.dy),
                     object_x, object_y, object_width, object_height)) {
                result.object = result.object || object;

                let delta_x = null;
                if (Math.abs(dx) > 1e-8) {
                    if ((entity.x + ox) < object_x) {
                        result.right = true;
                        delta_x = (object_x - ((entity.x + ox) + entity.bounds.width)) - result.dx;
                    } else {
                        result.left = true;
                        delta_x = ((object_x + object_width) - (entity.x + ox)) - result.dx;
                    }
                }

                let delta_y = null;
                if (Math.abs(dy) > 1e-8) {
                    if ((entity.y + oy) < object_y) {
                        result.bottom = true;
                        delta_y = (object_y - ((entity.y + oy) + entity.bounds.height)) - result.dy;
                    } else {
                        result.top = true;
                        delta_y = ((object_y + object_height) - (entity.y + oy)) - result.dy;
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
    });

    entity.x += result.dx;
    entity.y += result.dy;

    return result;
};

module.exports = {
    aabb: aabb,
    point: point,
    raycast: raycast,
    segment: segment,
    overlap: overlap,
    move: move,
};
