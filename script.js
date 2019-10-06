(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Camera {
    update_camera(elapsed) {
        const desired_x = game.render.render_width / 2 - game.player.x;
        game.containers.level.x = Math.max(Math.min(desired_x, 0), game.render.render_width - game.config.level.width);
        game.containers.level.y = Math.max(Math.min(game.render.render_height / 2 - game.player.y, 0), game.render.render_height - game.config.level.height);
    }
}

module.exports = Camera;

},{}],2:[function(require,module,exports){
module.exports = {
    tile_size: 16,
    level: {
        width: 0,
        height: 0,
    },
    player: {
        width: 16,
        height: 20,
        speed: 120,
        acceleration: 1080,
        gravity_acceleration: 1080,
        fall_gravity: 90,
        max_gravity: 666,
        jump_speed: 222,
        high_jump_gravity_factor: 0.5,
        late_jump_duration: 0.05,
        early_jump_duration: 0.07,
        sliding_factor: 0.75,
        jump_off_walls_duration: 0.12,
        jump_off_walls_speed: 150,
        post_jump_slowdown_factor: 0.9,
        post_jump_sliding_factor: 0.6,
        post_jump_slowdown_duration: 0.5,
    },
};

},{}],3:[function(require,module,exports){
const init_input = function() {
    document.body.onkeydown = event => input.keys[event.code] = true;
    document.body.onkeyup = event => input.keys[event.code] = false;
    document.body.onmousedown = event => input.mouse[event.button] = true;
    document.body.onmouseup = event => input.mouse[event.button] = false;

    delete input.init;
};

const update_input = function() {
    for (let key in input.keys) {
        if (input.keys.hasOwnProperty(key)) {
            input.previous_keys[key] = input.keys[key];
        }
    }
    for (let key in input.mouse) {
        if (input.mouse.hasOwnProperty(key)) {
            input.previous_mouse[key] = input.mouse[key];
        }
    }
};

const is_key_down = function(key) {
    return input.keys[key] === true;
};

const is_key_pressed = function(key) {
    return input.keys[key] === true && !input.previous_keys[key];
};

const is_key_released = function(key) {
    return !input.keys[key] && input.previous_keys[key] === true;
};

const is_mouse_down = function(button) {
    return input.mouse[button] === true;
};

const is_mouse_pressed = function(button) {
    return input.mouse[button] === true && !input.previous_mouse[button];
};

const is_mouse_released = function(button) {
    return !input.mouse[button] && input.previous_mouse[button] === true;
};

const input = {
    BUTTONS: {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2,
    },
    init: init_input,
    update: update_input,
    is_key_down: is_key_down,
    is_key_pressed: is_key_pressed,
    is_key_released: is_key_released,
    is_mouse_down: is_mouse_down,
    is_mouse_pressed: is_mouse_pressed,
    is_mouse_released: is_mouse_released,
    keys: {},
    previous_keys: {},
    mouse: {},
    previous_mouse: {},
};

module.exports = input;

},{}],4:[function(require,module,exports){
const Player = require("./player.js");
const Camera = require("./camera.js");

window.game = {
    render: require("./render.js"),
    resources: require("./resources/resources.js"),
    input: require("./input.js"),
    config: require("./config.js"),
    camera: null,
    player: null,
    level: null,
};

game.render.init();

game.resources.on_load = function() {
    document.getElementById("loading_bar").remove();
    initialize();
    game.render.application.ticker.add(main_loop);
};
game.resources.load();

game.input.init();

let construct_level = function(level_name) {
    const tileset = game.resources.sprites["tileset"];

    game.level = game.resources.levels[level_name];

    game.config.level.width = game.level.width;
    game.config.level.height = game.level.height;

    function draw_tiles_layer(layer_name) {
        for (let i = 0; i < game.level[layer_name].length; i++) {
            const tile_descriptor = game.level[layer_name][i];

            const tile_sprite = new PIXI.Texture(tileset, tileset.frame.clone());
            if (tileset.rotate) {
                tile_sprite.frame.x += tileset.frame.width - (tile_descriptor.ty + 1) * game.config.tile_size;
                tile_sprite.frame.y += tile_descriptor.tx * game.config.tile_size;
            } else {
                tile_sprite.frame.x += tile_descriptor.tx * game.config.tile_size;
                tile_sprite.frame.y += tile_descriptor.ty * game.config.tile_size;
            }
            tile_sprite.frame.width = tile_sprite.frame.height = game.config.tile_size;
            tile_sprite.rotate = tileset.rotate;
            tile_sprite.updateUvs();

            const tile = new PIXI.Sprite(tile_sprite);
            tile.x = tile_descriptor.x * game.config.tile_size;
            tile.y = tile_descriptor.y * game.config.tile_size;
            game.containers[layer_name].addChild(tile);
        }
    }

    if (game.containers && game.containers.level) {
        game.containers.stage.removeChild(game.containers.level);
    }

    game.containers = {
        stage: game.render.stage,
        level: new PIXI.Container(),
        tiles_very_back: new PIXI.Container(),
        tiles_back: new PIXI.Container(),
        entities: new PIXI.Container(),
        tiles_front: new PIXI.Container(),
    };

    game.containers.level.addChild(game.containers.tiles_very_back);
    game.containers.level.addChild(game.containers.tiles_back);
    game.containers.level.addChild(game.containers.entities);
    game.containers.level.addChild(game.containers.tiles_front);

    game.containers.stage.addChild(game.containers.level);

    draw_tiles_layer("tiles_very_back");
    draw_tiles_layer("tiles_back");
    draw_tiles_layer("tiles_front");

    for (let i = 0; i < game.level["entities"].length; i++) {
        const entity = game.level["entities"][i];
        if (entity.type === "player") {
            game.player = new Player(entity.x, entity.y);
            game.containers.entities.addChild(game.player);
        }
    }

    game.camera = new Camera();
};

let initialize = function() {
    construct_level("level0");
};

let main_loop = function() {
    const elapsed = game.render.application.ticker.elapsedMS / 1000;
    game.player.update_player(elapsed);
    game.camera.update_camera(elapsed);
    game.input.update();
};

},{"./camera.js":1,"./config.js":2,"./input.js":3,"./player.js":7,"./render.js":8,"./resources/resources.js":10}],5:[function(require,module,exports){
class MovieClip extends PIXI.AnimatedSprite {
    constructor(descriptors, default_animation) {
        super(descriptors[default_animation].frames);
        super.animationSpeed = descriptors[default_animation].speed || 1;
        super.loop = !(descriptors[default_animation].loop === false);

        this.descriptors = descriptors;
        this.animation = default_animation;
    }

    gotoAndPlay(frameOrAnimation) {
        if (this.descriptors && this.descriptors.hasOwnProperty(frameOrAnimation)) {
            super.textures = this.descriptors[frameOrAnimation].frames;
            super.animationSpeed = this.descriptors[frameOrAnimation].speed || 1;
            super.loop = !(this.descriptors[frameOrAnimation].loop === false);
            this.animation = frameOrAnimation;
            super.gotoAndPlay(0);
        } else {
            super.gotoAndPlay(frameOrAnimation);
        }
    }

    gotoAndStop(frameOrAnimation) {
        if (this.descriptors && this.descriptors.hasOwnProperty(frameOrAnimation)) {
            super.textures = this.descriptors[frameOrAnimation].frames;
            super.animationSpeed = this.descriptors[frameOrAnimation].speed || 1;
            super.loop = !(this.descriptors[frameOrAnimation].loop === false);
            this.animation = frameOrAnimation;
            super.gotoAndStop(0);
        } else {
            super.gotoAndStop(frameOrAnimation);
        }
    }
}

module.exports = MovieClip;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
const MovieClip = require("./movie_clip.js");
const Physics = require("./physics");

class Player extends MovieClip {
    constructor(x, y) {
        super({
            idle: { name: "idle", frames: [game.resources.sprites["player_still"]], speed: 0.1 },
            jump: { name: "jump", frames: [game.resources.sprites["player_jump"]], speed: 0.1 },
        }, "idle");

        this.anchor.set(0.25, 0.38);
        this.x = x;
        this.y = y;

        this.bounds = {
            width: game.config.player.width,
            height: game.config.player.height
        };

        this.vertical_speed = game.config.player.fall_gravity;
        this.horizontal_speed = 0;
        this.is_grounded = false;
        this.late_jump_duration = 0;
        this.is_sliding = false;
        this.jump_off_walls_duration = 0;
        this.jump_off_left_wall = false;
        this.jump_off_right_wall = false;
        this.fall_factor = 1;
        this.post_jump_slowdown_duration = 0;
        this.face = "right";
    }

    update_movement(elapsed) {
        const left_pressed = game.input.is_key_down("KeyA");
        const right_pressed = game.input.is_key_down("KeyD");
        if (left_pressed && !right_pressed) {
            this.face = "left";
            this.horizontal_speed = Math.max(this.horizontal_speed - game.config.player.acceleration * elapsed, Math.min(this.horizontal_speed, -game.config.player.speed));
        } else if (right_pressed && !left_pressed) {
            this.face = "right";
            this.horizontal_speed = Math.min(this.horizontal_speed + game.config.player.acceleration * elapsed, Math.max(this.horizontal_speed, game.config.player.speed));
        } else {
            if (this.horizontal_speed > 0) {
                this.horizontal_speed = Math.max(this.horizontal_speed - game.config.player.acceleration * elapsed, 0);
            } else {
                this.horizontal_speed = Math.min(this.horizontal_speed + game.config.player.acceleration * elapsed, 0);
            }
        }

        if (Math.abs(this.horizontal_speed * elapsed) > 1e-8) {
            const time = Math.max(this.post_jump_slowdown_duration, 0) / game.config.player.post_jump_slowdown_duration;
            const slowdown_factor = game.config.player.post_jump_slowdown_factor + (1 - game.config.player.post_jump_slowdown_factor) * (1 - time);
            Physics.move(this, this.horizontal_speed * slowdown_factor * elapsed, 0);
        }
    }

    update_sliding(elapsed) {
        this.is_sliding = false;
        if (Physics.overlap(this.x - 1e-1, this.y + this.bounds.height / 2 - 0.5, this.bounds.width, 1)) {
            this.is_sliding = true;
            this.jump_off_left_wall = true;
            this.jump_off_right_wall = false;
        }
        if (Physics.overlap(this.x + 1e-1, this.y + this.bounds.height / 2 - 0.5, this.bounds.width, 1)) {
            this.is_sliding = true;
            this.jump_off_left_wall = false;
            this.jump_off_right_wall = true;
        }

        if (this.is_sliding) {
            const time = Math.max(this.post_jump_slowdown_duration, 0) / game.config.player.post_jump_slowdown_duration;
            const sliding_factor = game.config.player.post_jump_sliding_factor * time;
            this.fall_factor = game.config.player.sliding_factor + (1 - game.config.player.sliding_factor) * sliding_factor;
            this.jump_off_walls_duration = game.config.player.jump_off_walls_duration;
        } else {
            this.fall_factor = 1;
            this.jump_off_walls_duration -= elapsed;
        }
    }

    update_jumping(elapsed) {
        const jump_pressed = game.input.is_key_pressed("Space");
        if (jump_pressed || this.early_jump_duration > 0) {
            this.early_jump_duration -= elapsed;

            if (this.late_jump_duration > 0 || this.jump_off_walls_duration > 0) {
                this.vertical_speed = -game.config.player.jump_speed;

                if (this.jump_off_walls_duration > 0) {
                    if (this.jump_off_left_wall) {
                        this.horizontal_speed = game.config.player.jump_off_walls_speed;
                    } else if (this.jump_off_right_wall) {
                        this.horizontal_speed = -game.config.player.jump_off_walls_speed;
                    }
                }

                this.early_jump_duration = 0;
            } else if (jump_pressed) {
                this.early_jump_duration = game.config.player.early_jump_duration;
            }
        } else {
            this.early_jump_duration -= elapsed;
        }
    }

    update_gravity(elapsed) {
        const hit = Math.abs(this.vertical_speed * elapsed) > 1e-8 ? Physics.move(this, 0, this.vertical_speed * elapsed) : null;
        this.is_grounded = hit && hit.bottom;
        if (this.is_grounded) {
            this.late_jump_duration = game.config.player.late_jump_duration;
            this.vertical_speed = game.config.player.fall_gravity;
        } else {
            this.late_jump_duration -= elapsed;
            if (hit && hit.top) {
                this.vertical_speed = 0;
            } else {
                if (this.vertical_speed < 0) {
                    const jump_down = game.input.is_key_down("Space");
                    if (jump_down) {
                        this.vertical_speed = Math.min(this.vertical_speed + game.config.player.gravity_acceleration * game.config.player.high_jump_gravity_factor * elapsed, game.config.player.max_gravity);
                    } else {
                        this.vertical_speed = Math.min(this.vertical_speed + game.config.player.gravity_acceleration * elapsed, game.config.player.max_gravity);
                    }
                } else {
                    this.vertical_speed = Math.min((this.vertical_speed + game.config.player.gravity_acceleration * elapsed) * this.fall_factor, game.config.player.max_gravity);
                }
            }
        }
    }

    update_sprite() {
        if (this.is_grounded) {
            this.gotoAndPlay("idle");
        } else {
            this.gotoAndPlay("jump");
        }

        if (this.face === "left") {
            this.scale.x = -1;
            this.anchor.set(0.75, 0.38);
        } else {
            this.scale.x = 1;
            this.anchor.set(0.25, 0.38);
        }
    }

    update_player(elapsed) {
        const was_grounded = this.is_grounded;
        const was_sliding = this.is_sliding;

        this.update_movement(elapsed);
        this.update_sliding(elapsed);
        this.update_jumping(elapsed);
        this.update_gravity(elapsed);
        this.update_sprite();

        if ((!was_grounded && this.is_grounded) || (!was_sliding && this.is_sliding)) {
            this.post_jump_slowdown_duration = game.config.player.post_jump_slowdown_duration;
        } else {
            this.post_jump_slowdown_duration -= elapsed;
        }
    }
}

module.exports = Player;

},{"./movie_clip.js":5,"./physics":6}],8:[function(require,module,exports){
const update_physical_size = function() {
    const horizontal_padding = 80, vertical_padding = 180;
    const width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - horizontal_padding;
    const height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - vertical_padding;

    render.scale = 1;
    render.physical_width = render.render_width;
    render.physical_height = render.render_height;

    do {
        const new_physical_width = render.render_width * (render.scale + 1);
        const new_physical_height = render.render_height * (render.scale + 1);
        if (new_physical_width < width && new_physical_height < height) {
            render.physical_width = new_physical_width;
            render.physical_height = new_physical_height;
            render.scale++;
        } else {
            break;
        }
    } while (render.scale < 10);

    const game_window = document.getElementById("game_window");
    game_window.style.width = render.physical_width + "px";
    game_window.style.height = render.physical_height + "px";
    game_window.style.marginLeft = (-render.physical_width / 2) + "px";
    game_window.style.marginTop = (-render.physical_height / 2) + "px";

    render.application.view.style.width = render.physical_width + "px";
    render.application.view.style.height = render.physical_height + "px";
};

const init_window = function() {
    PIXI.settings.ROUND_PIXELS = true;

    render.application = new PIXI.Application({ width: render.render_width, height: render.render_height, backgroundColor: 0x349EAD });
    render.stage = render.application.stage;

    const game_window = document.getElementById("game_window");
    game_window.appendChild(render.application.view);

    render.application.view.onselectstart = () => false;
    render.application.view.oncontextmenu = event => event.preventDefault();

    update_physical_size();
    window.onresize = update_physical_size;

    delete render.init;
};

const render = {
    init: init_window,
    render_width: 400,
    render_height: 240,
    physical_width: 0,
    physical_height: 0,
    scale: 1,
    application: null,
    stage: null,
};

module.exports = render;

},{}],9:[function(require,module,exports){
const load_levels = function() {
    function load_level(name) {
        levels.total_count++;

        function parse_level(text) {
            const xml = new DOMParser().parseFromString(text, "text/xml");
            const level = xml.getElementsByTagName("level")[0];
            const result = {
                width: parseInt(level.getAttribute("width")),
                height: parseInt(level.getAttribute("height"))
            };
            for (let i in level.childNodes) {
                if (level.childNodes.hasOwnProperty(i)) {
                    const container = level.childNodes[i];
                    if (container.nodeType === 1) {
                        if (container.hasAttribute("tileset")) {
                            const tiles = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const tile = container.childNodes[j];
                                    if (tile.nodeType === 1) {
                                        tiles.push({
                                            x: parseInt(tile.getAttribute("x")),
                                            y: parseInt(tile.getAttribute("y")),
                                            tx: parseInt(tile.getAttribute("tx")),
                                            ty: parseInt(tile.getAttribute("ty")),
                                        });
                                    }
                                }
                            }
                            result[container.tagName] = tiles;
                        } else if (container.hasAttribute("exportMode")) {
                            const rectangles = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const rectangle = container.childNodes[j];
                                    if (rectangle.nodeType === 1) {
                                        rectangles.push({
                                            x: parseInt(rectangle.getAttribute("x")),
                                            y: parseInt(rectangle.getAttribute("y")),
                                            width: parseInt(rectangle.getAttribute("w")),
                                            height: parseInt(rectangle.getAttribute("h")),
                                        });
                                    }
                                }
                            }
                            result[container.tagName] = rectangles;
                        } else {
                            const entities = [];
                            for (let j in container.childNodes) {
                                if (container.childNodes.hasOwnProperty(j)) {
                                    const xml_entity = container.childNodes[j];
                                    if (xml_entity.nodeType === 1) {
                                        const entity = { type: xml_entity.tagName };
                                        for (let k in xml_entity.attributes) {
                                            if (xml_entity.attributes.hasOwnProperty(k)) {
                                                let value = xml_entity.attributes[k].value;
                                                if (!isNaN(value)) {
                                                    value = +value;
                                                }
                                                entity[xml_entity.attributes[k].name] = value;
                                            }
                                        }
                                        for (let k in xml_entity.childNodes) {
                                            if (xml_entity.childNodes.hasOwnProperty(k)) {
                                                const node = xml_entity.childNodes[k];
                                                if (node.nodeType === 1 && node.tagName === "node") {
                                                    entity.nodes = entity.nodes || [];
                                                    entity.nodes.push({
                                                        x: parseInt(node.getAttribute("x")),
                                                        y: parseInt(node.getAttribute("y")),
                                                    });
                                                }
                                            }
                                        }
                                        entities.push(entity);
                                    }
                                }
                            }
                            result[container.tagName] = entities;
                        }
                    }
                }
            }
            return result;
        }

        const client = new XMLHttpRequest();
        client.open("GET", `levels/${name}.oel`);
        client.onload = function() {
            levels[name] = parse_level(client.responseText);
            if (++levels.loaded_count === levels.total_count) {
                const temp = levels.on_load;

                delete levels.load;
                delete levels.on_load;
                delete levels.total_count;
                delete levels.loaded_count;

                temp && temp();
            }
        };
        client.send();
    }

    load_level("level0");
};

const levels = {
    load: load_levels,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = levels;

},{}],10:[function(require,module,exports){
const try_on_load = function() {
    if (resources.sprites_loaded === true && resources.sounds_loaded === true && resources.levels_loaded === true && resources.on_load) {
        const temp = resources.on_load();

        delete resources.load;
        delete resources.sprites_loaded;
        delete resources.sounds_loaded;
        delete resources.levels_loaded;
        delete resources.on_load;

        temp && temp();
    }
};

const load_resources = function() {
    resources.sprites = require("./sprites.js");
    resources.sprites.on_load = function() {
        resources.sprites_loaded = true;
        try_on_load();
    };
    resources.sprites.load();

    resources.sounds = require("./sounds.js");
    resources.sounds.on_load = function() {
        resources.sounds_loaded = true;
        try_on_load();
    };
    resources.sounds.load();

    resources.levels = require("./levels.js");
    resources.levels.on_load = function() {
        resources.levels_loaded = true;
        try_on_load();
    };
    resources.levels.load();
};

const resources = {
    load: load_resources,
    sprites_loaded: false,
    sounds_loaded: false,
    levels_loaded: false,
    on_load: null,
};

module.exports = resources;

},{"./levels.js":9,"./sounds.js":11,"./sprites.js":12}],11:[function(require,module,exports){
const load_sounds = function() {
    function load_sound(name, volume = 1.0) {
        sounds.total_count++;
        sounds[name] = new Howl({
            src: [ `sounds/${name}.wav` ],
            volume: volume,
            onload: function() {
                if (++sounds.loaded_count === sounds.total_count) {
                    const temp = sounds.on_load;

                    delete sounds.load;
                    delete sounds.on_load;
                    delete sounds.total_count;
                    delete sounds.loaded_count;

                    temp && temp();
                }
            }
        });
    }

    // TODO: WHEN AT LEAST ONE SOUND IS PRESET CALL LOAD_SOUNDS AND REMOVE THIS.
    sounds.on_load();
};

const sounds = {
    load: load_sounds,
    on_load: null,
    total_count: 0,
    loaded_count: 0,
};

module.exports = sounds;

},{}],12:[function(require,module,exports){
const load_sprites = function() {
    function sprites_loaded(loader, resources) {
        const temp = sprites.on_load;

        delete sprites.on_load;
        delete sprites.load;

        for (let key in resources) {
            if (resources.hasOwnProperty(key)) {
                if (resources[key].hasOwnProperty("spritesheet")) {
                    for (let name in resources[key].spritesheet.textures) {
                        if (resources[key].spritesheet.textures.hasOwnProperty(name)) {
                            sprites[name] = resources[key].spritesheet.textures[name];
                        }
                    }
                    for (let name in resources[key].spritesheet.animations) {
                        if (resources[key].spritesheet.animations.hasOwnProperty(name)) {
                            sprites[name] = resources[key].spritesheet.animations[name];
                        }
                    }
                }
            }
        }

        temp && temp();
    }

    PIXI.Loader.shared
        .add("upheaval", "sprites/font.fnt")
        .add("sprites/atlas.json")
        .load(sprites_loaded);
};

const sprites = {
    load: load_sprites,
    on_load: null,
};

module.exports = sprites;

},{}]},{},[4]);
