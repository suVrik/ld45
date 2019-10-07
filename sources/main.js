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
const Exit = require("./exit.js");
const Altar = require("./altar.js");
const Tutorial = require("./tutorial.js");
const Physics = require("./physics.js");

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
    current_level: "main_menu_0",
    next_level: null,
    exit: null,
    altar: null,
    start_button: null,
    num_clicks: 0,
    dialog: false,
    dialog_time: 0,
    dialog_text: "",
    dialog_text_duration: 0,
    dialog_text_timeout: 0,
    dialog_callback: null,
    stats: {
        score: 0,
        level_start: null,
        total_score: 0,
        total_time: 0,
        item1: true,
        item2: true,
        item3: true,
        item4: true,
    },
    scripts: {
        sc_game_menu_0: function(entity, elapsed) {
            if (!entity.activated && (game.num_clicks > 1 || game.player.x > 300)) {
                entity.activated = true;
                entity.state = 1;
            }
            if (entity.activated) {
                if (entity.state === 1) {
                    entity.scale.x = -1;
                    if (entity.x > 350) {
                        entity.x -= elapsed * game.config.spitting.speed;
                    } else {
                        entity.state = 2;
                    }
                } else if (entity.state === 2) {
                    game.dialog = true;
                    game.dialog_time = 0;

                    game.dialog_text = "Not again!";
                    game.dialog_text_duration = 2;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "Looks like Start button is broken";
                        game.dialog_text_duration = 3;
                        game.dialog_text_timeout = 0;
                        game.dialog_callback = function() {
                            game.dialog_text = "Follow me, I gotta check something . . .";
                            game.dialog_text_duration = 3;
                            game.dialog_text_timeout = 0;
                            game.dialog_callback = function() {
                                game.dialog = false;
                                entity.state = 4;
                            };
                        };
                    };

                    entity.state = 3;
                } else if (entity.state === 3) {
                    if (entity.x > game.player.x + game.player.bounds.width / 2) {
                        entity.scale.x = -1;
                    } else {
                        entity.scale.x = 1;
                    }
                } else if (entity.state === 4) {
                    entity.scale.x = 1;
                    if (entity.x < 510) {
                        entity.x += elapsed * game.config.spitting.speed;
                    } else {
                        entity.state = 5;
                    }
                } else if (entity.state === 5) {
                    entity.parent.removeChild(entity);
                    entity.state = 6;
                }
                return true;
            }
            return false;
        },
        sc_backstage_1: function(entity, elapsed) {
            if (!entity.state) {
                entity.state = 1;
            }
            if (entity.state === 1) {
                entity.scale.x = 1;
                if (entity.x < 180) {
                    entity.x += elapsed * game.config.spitting.speed;
                } else {
                    entity.state = 2;
                }
            } else if (entity.state === 2) {
                game.dialog = true;
                game.dialog_time = 0;

                game.dialog_text = "Alright . . . Okay . . .  I see . . .";
                game.dialog_text_duration = 2.5;
                game.dialog_text_timeout = 0;
                game.dialog_callback = function() {
                    game.dialog_text = "You have 4 items you were supposed to collect during the game";
                    game.dialog_text_duration = 4.5;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "For some reason you have these items before the start";
                        game.dialog_text_duration = 4;
                        game.dialog_text_timeout = 0;
                        game.dialog_callback = function() {
                            game.dialog_text = "You must place these items back where they belong";
                            game.dialog_text_duration = 3.5;
                            game.dialog_text_timeout = 0;
                            game.dialog_callback = function() {
                                game.dialog_text = "Then you can start the game normally";
                                game.dialog_text_duration = 3;
                                game.dialog_text_timeout = 0;
                                game.dialog_callback = function() {
                                    game.dialog_text = "Now go! The first level is upstairs.\nYou need to climb the wall to get there.";
                                    game.dialog_text_duration = 6;
                                    game.dialog_text_timeout = 0;
                                    game.dialog_callback = function() {
                                        game.dialog = false;
                                        entity.state = 4;
                                    };
                                };
                            };
                        };
                    };
                };

                entity.state = 3;
            } else if (entity.state === 3) {
                if (entity.x > game.player.x + game.player.bounds.width / 2) {
                    entity.scale.x = -1;
                } else {
                    entity.scale.x = 1;
                }
            }
            return true;
        },
    }
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

    game.stats.time = 0;
    game.stats.score = 0;

    game.stats.level_start = new Date();

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
        ui: new PIXI.Container(),
        coin: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        coin_shadow: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        timer: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        timer_shadow: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        score: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        score_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        time: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        time_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        items: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        dialog_background: new PIXI.Graphics(),
        dialog_text: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        spawn_transition: new PIXI.Graphics(),
        item1: new PIXI.Sprite(game.resources.sprites["artifact_1"]),
        item2: new PIXI.Sprite(game.resources.sprites["artifact_2"]),
        item3: new PIXI.Sprite(game.resources.sprites["artifact_3"]),
        item4: new PIXI.Sprite(game.resources.sprites["artifact_4"]),
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

    game.containers.stage.addChild(new PIXI.Sprite(game.resources.sprites["background_0"]));
    game.containers.stage.addChild(game.containers.level);
    game.containers.stage.addChild(game.containers.ui);
    game.containers.stage.addChild(game.containers.dialog_background);
    game.containers.stage.addChild(game.containers.dialog_text);
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
    game.exit = null;
    game.altar = null;
    game.next_level = null;

    for (let i = 0; i < game.level["entities"].length; i++) {
        const entity = game.level["entities"][i];
        if (entity.type === "player") {
            game.player = new Player(entity.x, entity.y);
            game.containers.entities.addChild(game.player);
        } else if (entity.type === "hazard_vines") {
            game.hazard_vines.push(new HazardVines(entity.x, entity.y, entity.width, entity.height));
        } else if (entity.type === "enemy_spiky") {
            const spiky = new Spiky(entity.x, entity.y, entity.nodes, entity.script);
            game.spikes.push(spiky);
            game.containers.entities.addChild(spiky);
        } else if (entity.type === "enemy_flying") {
            const flying = new Flying(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.flyings.push(flying);
            game.containers.entities.addChild(flying);
        } else if (entity.type === "enemy_cloud") {
            const cloud = new Cloud(entity.x, entity.y, entity.nodes, entity.script);
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
            const mouse = new Mouse(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.mice.push(mouse);
            game.containers.entities.addChild(mouse);
        } else if (entity.type === "coin") {
            const coin = new Coin(entity.x, entity.y);
            game.coins.push(coin);
            game.containers.entities.addChild(coin);
        } else if (entity.type === "enemy_spitting") {
            const spitting = new Spitting(entity.x, entity.y, entity.nodes, entity.friendly, entity.script);
            game.spittings.push(spitting);
            game.containers.entities.addChild(spitting);
        } else if (entity.type === "exit") {
            game.exit = new Exit(entity.x, entity.y, entity.next_level);
        } else if (entity.type === "altar") {
            game.altar = new Altar(entity.x, entity.y, entity.next_level, entity.item2);
            game.containers.entities.addChild(game.altar);
        } else if (entity.type === "tutorial") {
            const tutorial = new Tutorial(entity.x, entity.y, entity.a, entity.b);
            game.containers.entities.addChild(tutorial);
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

    game.dialog = false;
    game.dialog_time = 0;

    game.start_button = null;
    game.num_clicks = 0;
    if (level_name === "main_menu_0" || level_name === "main_menu_1") {
        game.start_button = new PIXI.Sprite(game.resources.sprites["button_start"]);
        game.start_button.anchor.set(0.5);
        const initial_x = -game.containers.level.x;
        const initial_y = -game.containers.level.y;
        game.start_button.x = initial_x + game.render.render_width / 2;
        game.start_button.y = initial_y + game.render.render_height / 2;
        game.start_button.interactive = true;
        game.start_button.buttonMode = true;
        game.containers.level.addChild(game.start_button);
        game.start_button.on("pointerover", function() {
            game.start_button.texture = game.resources.sprites["button_start_hover"];
        });
        game.start_button.on("pointerout", function() {
            game.start_button.texture = game.resources.sprites["button_start"];
        });
        game.start_button.on("pointerdown", function(evt) {
            if (level_name === "main_menu_0") {
                const world_x = -game.containers.level.x + evt.data.global.x;
                const world_y = -game.containers.level.y + evt.data.global.y;
                do {
                    game.start_button.x = initial_x + game.start_button.width / 2 + Math.random() * (game.render.render_width - game.start_button.width);
                    game.start_button.y = initial_y + game.start_button.height / 2 + Math.random() * (game.render.render_height - game.start_button.height - 150);
                } while (Physics.point(game.start_button.x - game.start_button.width / 2, game.start_button.y - game.start_button.height / 2, game.start_button.width, game.start_button.height, world_x, world_y));
                game.num_clicks++;
            } else {
                // TODO
            }
            game.resources.sounds["Laser_Shoot8"].play();
        });
    }

    game.containers.score.text = "0";
    game.containers.score.x = 24;
    game.containers.score.y = 7;

    game.containers.score_shadow.text = game.containers.score.text;
    game.containers.score_shadow.x = game.containers.score.x;
    game.containers.score_shadow.y = game.containers.score.y + 1;

    game.containers.time.text = "00 : 00";
    game.containers.time.x = 24;
    game.containers.time.y = 15 + game.containers.score.height;

    game.containers.coin.x = 7;
    game.containers.coin.y = 7;

    game.containers.coin_shadow.x = game.containers.coin.x;
    game.containers.coin_shadow.y = game.containers.coin.y + 1;
    game.containers.coin_shadow.tint = 0x000000;

    game.containers.timer.x = 7;
    game.containers.timer.y = 13 + game.containers.score.height;

    game.containers.timer_shadow.x = game.containers.timer.x;
    game.containers.timer_shadow.y = game.containers.timer.y + 1;
    game.containers.timer_shadow.tint = 0x000000;

    game.containers.time_shadow.text = game.containers.time.text;
    game.containers.time_shadow.x = game.containers.time.x;
    game.containers.time_shadow.y = game.containers.time.y + 1;

    game.containers.item1.x = game.render.render_width - 23;
    game.containers.item1.y = 7;
    game.containers.item1.visible = game.stats.item1;

    game.containers.item2.x = game.render.render_width - 23 - 20;
    game.containers.item2.y = 7;
    game.containers.item2.visible = game.stats.item2;

    game.containers.item3.x = game.render.render_width - 23 - 20 * 2;
    game.containers.item3.y = 7;
    game.containers.item3.visible = game.stats.item3;

    game.containers.item4.x = game.render.render_width - 23 - 20 * 3;
    game.containers.item4.y = 7;
    game.containers.item4.visible = game.stats.item4;

    game.containers.ui.addChild(game.containers.coin_shadow);
    game.containers.ui.addChild(game.containers.coin);
    game.containers.ui.addChild(game.containers.timer_shadow);
    game.containers.ui.addChild(game.containers.timer);
    game.containers.ui.addChild(game.containers.score_shadow);
    game.containers.ui.addChild(game.containers.score);
    game.containers.ui.addChild(game.containers.time_shadow);
    game.containers.ui.addChild(game.containers.time);
    game.containers.ui.addChild(game.containers.items);
    game.containers.ui.addChild(game.containers.item1);
    game.containers.ui.addChild(game.containers.item2);
    game.containers.ui.addChild(game.containers.item3);
    game.containers.ui.addChild(game.containers.item4);
};

let initialize = function() {
    construct_level(game.current_level);
};

let main_loop = function() {
    const elapsed = game.render.application.ticker.elapsedMS / 1000;

    const current_time = new Date();
    const total_elapsed = (current_time.getTime() - game.stats.level_start.getTime()) / 1000;

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
    if (game.next_level == null && game.exit) {
        const next_level = game.exit.update_exit();
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);
            game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
        }
    } else if (game.next_level == null && game.altar) {
        const next_level = game.altar.update_altar(elapsed);
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);
            game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
        }
    }
    game.camera.update_camera(elapsed);
    game.input.update();

    const max_radius = Math.sqrt(game.render.render_width * game.render.render_width + game.render.render_height * game.render.render_height);
    const max_side = Math.max(game.render.render_width, game.render.render_height) + max_radius * 2 + 10;

    game.containers.spawn_transition.clear();

    if (game.player.dead || game.next_level) {
        game.containers.spawn_transition.beginFill(0x000000);
        game.containers.spawn_transition.drawRect((game.render.render_width - max_side) / 2, (game.render.render_height - max_side) / 2, max_side, max_side);
        game.containers.spawn_transition.endFill();

        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            game.containers.spawn_transition.beginHole();
            game.containers.spawn_transition.drawCircle(game.player.x + game.containers.level.x + game.player.bounds.width / 2, game.player.y + game.containers.level.y + game.player.bounds.height / 2, game.spawn_effect_radius);
            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * max_radius, 0);
            game.containers.spawn_transition.endHole();

            if (Math.abs(game.spawn_effect_radius) < 1e-5) {
                if (game.next_level) {
                    if (game.altar) {
                        game.stats["item" + game.altar.item_num] = false;
                    }

                    game.stats.total_score += game.stats.score;
                    game.stats.total_time += total_elapsed;
                    game.current_level = game.next_level;
                }
                construct_level(game.current_level);
            }
        }
    } else {
        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            game.containers.spawn_transition.beginFill(0x000000);
            game.containers.spawn_transition.drawCircle(game.player.x + game.player.bounds.width / 2 + game.containers.level.x, game.player.y + game.player.bounds.height / 2 + game.containers.level.y, game.spawn_effect_radius);
            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * 1.5 * max_radius, 0);
            game.containers.spawn_transition.endFill();
        }
    }
    if (game.dialog) {
        game.dialog_time = Math.min(game.dialog_time + elapsed * 125, 40);
    } else {
        game.dialog_time = Math.max(game.dialog_time - elapsed * 125, 0);
    }
    if (Math.abs(game.dialog_time) > 1e-5) {
        game.containers.dialog_background.clear();
        game.containers.dialog_background.beginFill(0x000000);
        game.containers.dialog_background.drawRect(0, 0, game.render.render_width, game.dialog_time);
        game.containers.dialog_background.drawRect(0, game.render.render_height - game.dialog_time, game.render.render_width, game.dialog_time);
        game.containers.dialog_background.endFill();

        game.containers.dialog_text.text = game.dialog_text;
        game.containers.dialog_text.x = game.render.render_width / 2 - game.containers.dialog_text.textWidth / 2;
        game.containers.dialog_text.y = game.render.render_height - game.dialog_time + 40 / 2 - game.containers.dialog_text.textHeight / 2;

        if (game.dialog) {
            game.dialog_text_timeout += elapsed;
            if (game.dialog_text_timeout > game.dialog_text_duration) {
                game.dialog_callback();
            }
        }
    }

    game.containers.score.text = String(game.stats.score);
    game.containers.score_shadow.text = game.containers.score.text;
    const minutes = Math.floor(total_elapsed / 60);
    const seconds = Math.floor(total_elapsed % 60);
    game.containers.time.text = (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds);
    game.containers.time_shadow.text = game.containers.time.text;
};

window.onfocus = function() {
    Howler.volume(1);
};

window.onblur = function() {
    Howler.volume(0);
};
