(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
window.game = {
    render: require("./render.js"),
    resources: require("./resources/resources.js"),
    input: require("./input.js"),
};

const MovieClip = require("./movie_clip.js");

game.render.init();

game.resources.on_load = function() {
    document.getElementById("loading_bar").remove();
    initialize();
    game.render.application.ticker.add(main_loop);
};
game.resources.load();

game.input.init();

game.config = {
    tile_size: 16,
};

let construct_level = function(level_name) {
    const level = game.resources.levels[level_name];
    const tileset = game.resources.sprites["tileset"];

    function draw_tiles_layer(layer_name) {
        for (let i = 0; i < level[layer_name].length; i++) {
            const tile_descriptor = level[layer_name][i];

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
        tiles_back: new PIXI.Container(),
        entities: new PIXI.Container(),
        tiles_front: new PIXI.Container(),
        player: null,
    };

    game.containers.level.addChild(game.containers.tiles_back);
    game.containers.level.addChild(game.containers.entities);
    game.containers.level.addChild(game.containers.tiles_front);

    game.containers.stage.addChild(game.containers.level);

    draw_tiles_layer("tiles_back");
    draw_tiles_layer("tiles_front");

    for (let i = 0; i < level["entities"].length; i++) {
        const entity = level["entities"][i];
        if (entity.type === "test") {
            game.containers.player = new MovieClip([{ frames: game.resources.sprites["player_walk"], speed: 0.1 }]);
            game.containers.player.x = entity.x;
            game.containers.player.y = entity.y;
            game.containers.player.play();
            game.containers.entities.addChild(game.containers.player);
        }
    }
};

let initialize = function() {
    construct_level("level0");
};

let main_loop = function(elapsed) {
};

},{"./input.js":1,"./movie_clip.js":3,"./render.js":4,"./resources/resources.js":6}],3:[function(require,module,exports){
class MovieClip extends PIXI.AnimatedSprite {
    constructor(descriptors) {
        super(descriptors[0].frames);
        super.animationSpeed = descriptors[0].speed || 1;
        super.loop = !(descriptors[0].loop === false);

        this.descriptors = descriptors;
        this.animation = descriptors[0].name;
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

},{}],4:[function(require,module,exports){
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
    render.application = new PIXI.Application({ width: render.render_width, height: render.render_height });
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

},{}],5:[function(require,module,exports){
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
                                            ty: parseInt(tile.getAttribute("ty"))
                                        });
                                    }
                                }
                            }
                            result[container.tagName] = tiles;
                        } else if (container.hasAttribute("exportMode")) {
                            result[container.tagName] = container.textContent.trim().split("\n").map(string => string.split("").map(char => char === "1"));
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
                                                        y: parseInt(node.getAttribute("y"))
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

},{}],6:[function(require,module,exports){
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

},{"./levels.js":5,"./sounds.js":7,"./sprites.js":8}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}]},{},[2]);
