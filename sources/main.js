const Player = require("./player.js");
const HazardVines = require("./hazard_vines.js");
const Spiky = require("./enemies/spiky.js");
const Flying = require("./enemies/flying.js");
const Cloud = require("./enemies/cloud.js");
const BlockFalling = require("./block_falling.js");
const Mouse = require("./enemies/mouse.js");
const Coin = require("./coin.js");
const Spitting = require("./enemies/spitting.js");
const Camera = require("./camera.js");

window.game = {
    render: require("./render.js"),
    resources: require("./resources/resources.js"),
    input: require("./input.js"),
    config: require("./config.js"),
    camera: null,
    player: null,
    level: null,
    hazard_vines: [],
    spikes: [],
    flyings: [],
    flying_projectiles: [],
    clouds: [],
    block_fallings: [],
    mice: [],
    coins: [],
    spittings: [],
    spitting_projectiles: [],
    draw_hitboxes: false,
    spawn_effect_radius: 1,
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
        effects: new PIXI.Container(),
        tiles_back: new PIXI.Container(),
        entities: new PIXI.Container(),
        front_effects: new PIXI.Container(),
        tiles_front: new PIXI.Container(),
        hitboxes: new PIXI.Graphics(),
        spawn_transition: new PIXI.Graphics(),
    };

    game.containers.level.addChild(game.containers.tiles_very_back);
    game.containers.level.addChild(game.containers.effects);
    game.containers.level.addChild(game.containers.tiles_back);
    game.containers.level.addChild(game.containers.entities);
    game.containers.level.addChild(game.containers.front_effects);
    game.containers.level.addChild(game.containers.tiles_front);

    if (game.draw_hitboxes) {
        game.containers.level.addChild(game.containers.hitboxes);
    }

    game.containers.stage.addChild(new PIXI.Sprite(game.resources.sprites["background"]));
    game.containers.stage.addChild(game.containers.level);
    game.containers.stage.addChild(game.containers.spawn_transition);

    draw_tiles_layer("tiles_very_back");
    draw_tiles_layer("tiles_back");
    draw_tiles_layer("tiles_front");

    game.player = null;
    game.hazard_vines = [];
    game.spikes = [];
    game.flyings = [];
    game.flying_projectiles = [];
    game.clouds = [];
    game.block_fallings = [];
    game.mice = [];
    game.coins = [];
    game.spittings = [];
    game.spitting_projectiles = [];

    for (let i = 0; i < game.level["entities"].length; i++) {
        const entity = game.level["entities"][i];
        if (entity.type === "player") {
            game.player = new Player(entity.x, entity.y);
            game.containers.entities.addChild(game.player);
        } else if (entity.type === "hazard_vines") {
            game.hazard_vines.push(new HazardVines(entity.x, entity.y, entity.width, entity.height));
        } else if (entity.type === "enemy_spiky") {
            const spiky = new Spiky(entity.x, entity.y, entity.nodes);
            game.spikes.push(spiky);
            game.containers.entities.addChild(spiky);
        } else if (entity.type === "enemy_flying") {
            const flying = new Flying(entity.x, entity.y, entity.nodes);
            game.flyings.push(flying);
            game.containers.entities.addChild(flying);
        } else if (entity.type === "enemy_cloud") {
            const cloud = new Cloud(entity.x, entity.y, entity.nodes);
            game.clouds.push(cloud);
            game.containers.entities.addChild(cloud);
        } else if (entity.type === "block_falling") {
            const width = entity.width / game.config.tile_size;
            const height = entity.height / game.config.tile_size;
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const block_falling = new BlockFalling(entity.x + i * game.config.tile_size, entity.y + j * game.config.tile_size, entity.nodes);
                    game.block_fallings.push(block_falling);
                    game.containers.entities.addChild(block_falling);
                }
            }
        } else if (entity.type === "enemy_mouse") {
            const mouse = new Mouse(entity.x, entity.y, entity.nodes);
            game.mice.push(mouse);
            game.containers.entities.addChild(mouse);
        } else if (entity.type === "coin") {
            const coin = new Coin(entity.x, entity.y);
            game.coins.push(coin);
            game.containers.entities.addChild(coin);
        } else if (entity.type === "enemy_spitting") {
            const spitting = new Spitting(entity.x, entity.y, entity.nodes);
            game.spittings.push(spitting);
            game.containers.entities.addChild(spitting);
        }
    }

    game.camera = new Camera();
    game.camera.update_camera(1 / 60);

    const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
    const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
    const max_x = Math.max(player_x, game.render.render_width - player_x);
    const max_y = Math.max(player_y, game.render.render_height - player_y);
    game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);

    game.containers.spawn_transition.clear();
    game.containers.spawn_transition.beginFill(0x000000);
    game.containers.spawn_transition.drawRect(0, 0, game.render.render_width, game.render.render_height);
    game.containers.spawn_transition.endFill();
};

let initialize = function() {
    construct_level("level0");
};

let main_loop = function() {
    const elapsed = game.render.application.ticker.elapsedMS / 1000;

    if (game.draw_hitboxes) {
        game.containers.hitboxes.clear();
        game.containers.hitboxes.lineStyle(1, 0xFF0000, 1);

        const hitboxes = game.level["hitboxes"];
        for (let i = 0; i < hitboxes.length; i++) {
            game.containers.hitboxes.drawRect(hitboxes[i].x, hitboxes[i].y, hitboxes[i].width, hitboxes[i].height);
        }
    }

    game.player.update_player(elapsed);
    for (let i = 0; i < game.hazard_vines.length; i++) {
        game.hazard_vines[i].update_hazard_vines();
    }
    for (let i = 0; i < game.spikes.length; i++) {
        game.spikes[i].update_spiky(elapsed);
    }
    for (let i = 0; i < game.flyings.length; ) {
        const flying = game.flyings[i];
        game.flyings[i].update_flying(elapsed);
        if (i < game.flyings.length && game.flyings[i] === flying) {
            i++;
        }
    }
    for (let i = 0; i < game.flying_projectiles.length; ) {
        const projectile = game.flying_projectiles[i];
        projectile.update_flying_projectile(elapsed);
        if (i < game.flying_projectiles.length && game.flying_projectiles[i] === projectile) {
            i++;
        }
    }
    for (let i = 0; i < game.clouds.length; i++) {
        game.clouds[i].update_cloud(elapsed);
    }
    for (let i = 0; i < game.block_fallings.length; i++) {
        game.block_fallings[i].update_block_falling(elapsed);
    }
    for (let i = 0; i < game.mice.length; ) {
        const mouse = game.mice[i];
        mouse.update_mouse(elapsed);
        if (i < game.mice.length && game.mice[i] === mouse) {
            i++;
        }
    }
    for (let i = 0; i < game.coins.length; ) {
        const coin = game.coins[i];
        coin.update_coin(elapsed);
        if (i < game.coins.length && game.coins[i] === coin) {
            i++;
        }
    }
    for (let i = 0; i < game.spittings.length; ) {
        const spitting = game.spittings[i];
        spitting.update_spitting(elapsed);
        if (i < game.spittings.length && game.spittings[i] === spitting) {
            i++;
        }
    }
    for (let i = 0; i < game.spitting_projectiles.length; ) {
        const projectile = game.spitting_projectiles[i];
        projectile.update_spitting_projectile(elapsed);
        if (i < game.spitting_projectiles.length && game.spitting_projectiles[i] === projectile) {
            i++;
        }
    }
    game.camera.update_camera(elapsed);
    game.input.update();

    const max_radius = Math.sqrt(game.render.render_width * game.render.render_width + game.render.render_height * game.render.render_height);
    const max_side = Math.max(game.render.render_width, game.render.render_height) + max_radius * 2 + 10;

    if (game.player.dead) {
        game.containers.spawn_transition.clear();
        game.containers.spawn_transition.beginFill(0x000000);
        game.containers.spawn_transition.drawRect((game.render.render_width - max_side) / 2, (game.render.render_height - max_side) / 2, max_side, max_side);
        game.containers.spawn_transition.endFill();

        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            game.containers.spawn_transition.beginHole();
            game.containers.spawn_transition.drawCircle(game.player.x + game.containers.level.x + game.player.bounds.width / 2, game.player.y + game.containers.level.y + game.player.bounds.height / 2, game.spawn_effect_radius);
            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * max_radius, 0);
            game.containers.spawn_transition.endHole();

            if (Math.abs(game.spawn_effect_radius) < 1e-5) {
                construct_level("level0");
            }
        }
    } else {
        game.containers.spawn_transition.clear();
        game.containers.spawn_transition.beginFill(0x000000);
        game.containers.spawn_transition.drawCircle(game.player.x + game.player.bounds.width / 2 + game.containers.level.x, game.player.y + game.player.bounds.height / 2 + game.containers.level.y, game.spawn_effect_radius);
        game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * 1.5 * max_radius, 0);
        game.containers.spawn_transition.endFill();
    }
};
