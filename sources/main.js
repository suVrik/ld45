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
