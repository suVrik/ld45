"use strict";

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
    ui_logo: null,
    num_clicks: 0,
    dialog: false,
    dialog_time: 0,
    dialog_text: "",
    dialog_text_duration: 0,
    dialog_text_timeout: 0,
    dialog_callback: null,
    firework_timeout: 0,
    joystick_zone: null,
    joystick_manager: null,
    joystick: null,
    jump_button: null,
    stats: {
        score: 0,
        kills: 0,
        game_start: new Date(),
        level_start: null,
        total_score: 0,
        total_kills: 0,
        total_deaths: 0,
        item1: true,
        item2: true,
        item3: true,
        item4: true,
    },
    order: {
        Player: 91,
        Flying: 90,
        FlyingProjectile: 91,
        Mouse: 90,
        Spiky: 90,
        Spitting: 90,
        SplittingProjectile: 92,
        Altar: 80,
        BlockFalling: 80,
        Coin: 85,
        Tutorial: 50,
        Hat: 91,
    },
    scripts: {
        sc_game_menu_0: function(entity, elapsed) {
            if (!entity.activated && (game.num_clicks >= 1 || game.player.x > 300)) {
                entity.force_animation = "idle";
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
                    entity.force_animation = "charge";
                    game.dialog = true;
                    game.dialog_time = 0;

                    game.dialog_text = "Not again!";
                    game.dialog_text_duration = 2;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "Looks like Start button exploded!!!";
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
                    entity.force_animation = "idle";

                    entity.scale.x = 1;
                    if (entity.x < 510) {
                        entity.x += elapsed * game.config.spitting.speed;
                    } else {
                        entity.state = 5;
                    }
                } else if (entity.state === 5) {
                    entity.state = 6;
                    entity.visible = false;
                }
                return true;
            }
            return false;
        },
        sc_backstage_1: function(entity, elapsed) {
            if (!entity.state) {
                entity.force_animation = "idle";
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
                entity.force_animation = "charge";
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
                                        entity.force_animation = "idle";
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
        sc_backstage_2: function(entity, elapsed) {
            if (!entity.initialized) {
                if (Physics.aabb(entity.x - 50, entity.y - 50, 100, 100, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                    entity.initialized = true;

                    game.dialog = true;
                    game.dialog_time = 0;

                    game.dialog_text = "*crying*";
                    game.dialog_text_duration = 2;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog_text = "He killed himself jumping on me!!!";
                        game.dialog_text_duration = 2;
                        game.dialog_text_timeout = 0;
                        game.dialog_callback = function() {
                            game.dialog_text = "WHY?????";
                            game.dialog_text_duration = 2;
                            game.dialog_text_timeout = 0;
                            game.dialog_callback = function() {
                                game.dialog = false;
                            };
                        };
                    };
                }
            }
        },
        scc_backstage_3: function(entity, elapsed) {
            if (entity.just_hit) {
                if (!game.dialog) {
                    game.dialog = true;
                    game.dialog_time = 0;
                }

                const speaches = [ "Auch!", "Oi!", "Please!", "Stop!", "No!", "Why?" ];
                if (entity.last_speech === undefined) {
                    entity.last_speech = speaches.length - 1;
                }
                entity.last_speech = (entity.last_speech + 1) % speaches.length;
                game.dialog_text = speaches[entity.last_speech];
                game.dialog_text_duration = 0.7;
                game.dialog_text_timeout = 0;
                game.dialog_callback = function () {
                    game.dialog = false;
                };
            }
        },
        sc_backstage_4: function(entity, elapsed) {
            if (!entity.initialized) {
                if (Physics.aabb(entity.x - 50, entity.y - 50, 100, 100, game.player.x, game.player.y, game.player.bounds.width, game.player.bounds.height)) {
                    entity.initialized = true;

                    game.dialog = true;
                    game.dialog_time = 0;

                    game.dialog_text = "Ah, here we go again.";
                    game.dialog_text_duration = 2;
                    game.dialog_text_timeout = 0;
                    game.dialog_callback = function() {
                        game.dialog = false;
                    };
                }
            }
        },
    },
    newgrounds: {
        io: null,
        medals: null,
        scoreboards: null,
    },
    broken: false,
    start_button_velocity: {
        x: 0,
        y: 0,
        bounces: 0,
    },
    initial_y: 0,
    construct_level: null,
    extra_timeout: 0,
    muted: false,
    fake_stage: null,
    render_target: null,
    render_target_sprite: null,
    toggle_fullscreen: null,
    dead_zones: [],
    emit_event: null,
    performance: "webgl",
};

let init_newgrounds_session = function() {
    try {
        game.newgrounds.io = new Newgrounds.io.core("49731:Jh4dHyWR", "A9Tuytth3X5txdmmIixKeQ==");

        console.log("Requesting authorization...");

        game.newgrounds.io.getValidSession(function() {
            if (game.newgrounds.io.user) {
                console.log("User \"" + game.newgrounds.io.user + "\" is signed in.");
            } else {
                console.log("User is not signed in.");
            }

            game.newgrounds.io.callComponent("Medal.getList", {}, function(result) {
                if (result.success && result.medals) {
                    game.newgrounds.medals = result.medals;
                }
            });

            game.newgrounds.io.callComponent("ScoreBoard.getBoards", {}, function(result) {
                if (result.success && result.scoreboards) {
                    game.newgrounds.scoreboards = result.scoreboards;
                }
            });
        });
    }
    catch (e) {
        console.log("Failed to initialize newgrounds API. Medals, scores and analytics are disabled!");
    }
};

let unlock_medal = function(medal_name) {
    if (game.newgrounds.io && game.newgrounds.medals) {
        for (let i = 0; i < game.newgrounds.medals.length; i++) {
            const medal = game.newgrounds.medals[i];
            if (medal.name === medal_name) {
                function unlock_medal() {
                    game.extra_timeout = Math.max(game.extra_timeout, 0) + 25;
                    setTimeout(function() {
                        const medal_width = 160;
                        const medal_height = 25;

                        const medal_item = {
                            timeout: 3,
                            container: new PIXI.Container(),
                            background: new PIXI.Graphics(),
                            text: new PIXI.BitmapText(medal_name + " unlocked!", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0xE6E3E3 }),
                            icon: new PIXI.Sprite(game.resources.sprites["medal_" + medal_name]),
                        };

                        medal_item.background.beginFill(0x0F0B0C);
                        medal_item.background.drawRect(0, 0, medal_width, medal_height);
                        medal_item.background.endFill();
                        medal_item.container.addChild(medal_item.background);

                        medal_item.container.addChild(medal_item.icon);

                        medal_item.text.y = 8;
                        medal_item.text.x = 30;
                        medal_item.container.addChild(medal_item.text);

                        medal_item.container.x = game.render.render_width;
                        medal_item.container.y = game.render.render_height - (game.containers.medals_items.length + 1) * medal_height;
                        game.containers.medals.addChild(medal_item.container);

                        game.containers.medals_items.push(medal_item);

                        game.resources.sounds["medal_unlock"].play();
                    }, 100 + Math.max(game.extra_timeout, 0));
                }

                if (game.newgrounds.io.user) {
                    if (!medal.unlocked) {
                        console.log("Unlocking medal \"" + medal_name + "\"...");
                        game.newgrounds.io.callComponent('Medal.unlock', {id: medal.id}, function(result) {
                            if (result.success) {
                                console.log("Medal \"" + medal_name + "\" unlocked.");
                                unlock_medal();
                            } else {
                                console.log("Failed to unlock medal \"" + medal_name + "\". Details: \"" + result.error.message + "\".");
                            }
                        });
                    } else {
                        console.log("Medal \"" + medal_name + "\" is already unlocked.");
                    }
                } else {
                    console.log("Failed to unlock medal \"" + medal_name + "\" because user is not logged in.");
                    unlock_medal();
                }
            }
        }
    } else {
        console.log("Failed to unlock medal \"" + medal_name + "\" because medals are not available.");
    }
};

let post_score = function(board_name, score_value) {
    if (game.newgrounds.io && game.newgrounds.io.user && game.newgrounds.scoreboards) {
        for (let i = 0; i < game.newgrounds.scoreboards.length; i++) {
            const scoreboard = game.newgrounds.scoreboards[i];
            if (scoreboard.name === board_name) {
                console.log("Posting score \"" + score_value + "\" to \"" + board_name + "\"...");
                game.newgrounds.io.callComponent('ScoreBoard.postScore', {id: scoreboard.id, value: score_value}, function(result) {
                    if (result.success) {
                        console.log("Successfully posed score \"" + score_value + "\" to  \"" + board_name + "\".");
                    } else {
                        console.log("Failed to post score \"" + score_value + "\" to  \"" + board_name + "\". Details: \"" + result.error.message + "\".");
                    }
                });
            }
        }
    } else {
        console.log("Failed to post score \"" + score_value + "\" to  \"" + board_name + "\" because user is not logged in.");
    }
};

game.emit_event = function(event_name) {
    console.log("Emitting event \"" + event_name + "\"...");
    if (game.newgrounds.io) {
        game.newgrounds.io.callComponent('Event.logEvent', {event_name: event_name, host: window.location.hostname}, function(result) {
            if (result.success) {
                console.log("Successfully emitted event \"" + event_name + "\".");
            } else {
                console.log("Failed to emit event \"" + event_name + "\". Details: \"" + result.error.message + "\".");
            }
        });
    } else {
        console.log("Failed to emit event \"" + event_name + "\".");
    }
};

game.update_touchscreen_controls = function() {
    if (game.render.touchscreen) {
        const game_window = document.getElementById("game_window");

        const size = Math.min(game.render.physical_width, game.render.physical_height) / 4;
        const padding = Math.round(size) * 0.75;

        if (game.joystick_zone) {
            game.joystick_zone.remove();
        }
        game.joystick_zone = document.createElement("div");
        game.joystick_zone.style.position = "absolute";
        game.joystick_zone.style.width = "70%";
        game.joystick_zone.style.height = "100%";
        game.joystick_zone.style.top = "0%";
        game.joystick_zone.style.left = "0%";
        game_window.appendChild(game.joystick_zone);

        if (!game.jump_button) {
            game.jump_button = document.createElement("div");
            game_window.appendChild(game.jump_button);
        }
        game.jump_button.is_pressed = false;
        game.jump_button.style.position = "absolute";
        game.jump_button.style.background = "white";
        game.jump_button.style.opacity = "0.25";
        game.jump_button.style.width = size + "px";
        game.jump_button.style.height = size + "px";
        game.jump_button.style.bottom = padding + "px";
        game.jump_button.style.right = padding + "px";
        game.jump_button.style.borderRadius = "50%";
        game.jump_button.style.marginBottom = -Math.round(size / 2) + "px";
        game.jump_button.style.marginRight = -Math.round(size / 2) + "px";
        game.jump_button.style.transition = "opacity 250ms ease 0s";
        game.jump_button.style.touchAction = "none";
        game.jump_button.onmousedown = game.jump_button.ontouchstart = function() {
            game.jump_button.is_pressed = true;
            game.jump_button.style.opacity = "0.5";
            return false;
        };
        game.jump_button.onmouseup = game.jump_button.onmouseout = game.jump_button.ontouchend = function() {
            game.jump_button.is_pressed = false;
            game.jump_button.style.opacity = "0.25";
            return false;
        };

        game.joystick = {
            left: false,
            right: false,
            up: false,
            down: false,
        };

        game.joystick_manager = nipplejs.create({
            zone: game.joystick_zone,
            size: Math.min(game.render.physical_width, game.render.physical_height) / 5,
            mode: "static",
            position: { bottom: padding + "px", left: padding + "px" },
        });
        game.joystick_manager.on("move", function(event, nipple) {
            if (nipple.force < 0.7) {
                game.joystick.left = game.joystick.right = false;
                game.joystick.up = game.joystick.down = false;
            } else {
                if (Math.abs(nipple.angle.radian - Math.PI / 2) < Math.PI / 18 || Math.abs(nipple.angle.radian - Math.PI * 3 / 2) < Math.PI / 18) {
                    game.joystick.left = game.joystick.right = false;
                } else {
                    game.joystick.left = nipple.angle.radian > Math.PI / 2 && nipple.angle.radian <= Math.PI * 3 / 2;
                    game.joystick.right = !game.joystick.left;
                }
                if (Math.abs(nipple.angle.radian - Math.PI / 2) < Math.PI / 4) {
                    game.joystick.up = true;
                    game.joystick.down = false;
                } else if (Math.abs(nipple.angle.radian - Math.PI * 3 / 2) < Math.PI / 4) {
                    game.joystick.up = false;
                    game.joystick.down = true;
                } else {
                    game.joystick.up = game.joystick.down = false;
                }
            }
        });
        game.joystick_manager.on("end", function() {
            game.joystick.right = game.joystick.left = game.joystick.up = game.joystick.down = false;
        });

        if (!game.broken) {
            game.joystick_zone.style.display = "none";
            game.jump_button.style.display = "none";
        }
    }
};

game.render.init();

game.resources.on_load = function() {
    document.getElementById("loading_bar").remove();

    game.update_touchscreen_controls();
    initialize();
    game.render.application.ticker.add(main_loop);
};
game.resources.load();

game.input.init();

const is_fullscreen = function() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
};

game.toggle_fullscreen = function() {
    if (!is_fullscreen()) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
};

game.construct_level = function(level_name) {
    const tileset = game.resources.sprites["tileset"];

    game.current_level = level_name;

    game.level = game.resources.levels[level_name];

    game.config.level.width = game.level.width;
    game.config.level.height = game.level.height;

    game.stats.time = 0;
    game.stats.score = 0;
    game.stats.kills = 0;

    game.stats.level_start = new Date();

    const destroy_recursive = function(object) {
        if (object instanceof PIXI.Container) {
            while (object.children.length > 0) {
                destroy_recursive(object.children[0]);
            }
        }
        object.destroy();
    };

    while (game.fake_stage.children.length > 0) {
        destroy_recursive(game.fake_stage.children[0]);
    }

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

    game.containers = {
        stage: game.fake_stage,
        level: new PIXI.Container(),
        tiles_very_back: new PIXI.Container(),
        effects: new PIXI.Container(),
        tiles_back: new PIXI.Container(),
        entities: new PIXI.Container(),
        front_effects: new PIXI.Container(),
        tiles_front: new PIXI.Container(),
        hitboxes: new PIXI.Graphics(),
        ui: new PIXI.Container(),
        ui2: new PIXI.Container(),
        medals: new PIXI.Container(),
        medals_items: [],
        coin: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        coin_shadow: new PIXI.Sprite(game.resources.sprites["ui_coins"]),
        timer: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        timer_shadow: new PIXI.Sprite(game.resources.sprites["ui_timer"]),
        skull: new PIXI.Sprite(game.resources.sprites["ui_deaths"]),
        skull_shadow: new PIXI.Sprite(game.resources.sprites["ui_deaths"]),
        spitting: new PIXI.Sprite(game.resources.sprites["ui_kills"]),
        spitting_shadow: new PIXI.Sprite(game.resources.sprites["ui_kills"]),
        score: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        score_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        time: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        time_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        deaths: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        deaths_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        kills: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        kills_shadow: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center', tint: 0x000000 }),
        items: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        dialog_background: new PIXI.Graphics(),
        dialog_text: new PIXI.BitmapText("", { font: '10px Upheaval TT (BRK)', align: 'center' }),
        spawn_transition: new PIXI.Graphics(),
        item1: new PIXI.Sprite(game.resources.sprites["artifact_1"]),
        item2: new PIXI.Sprite(game.resources.sprites["artifact_2"]),
        item3: new PIXI.Sprite(game.resources.sprites["artifact_3"]),
        item4: new PIXI.Sprite(game.resources.sprites["artifact_4"]),
        background_1: null,
        background_2: null,
        clouds: [],
        clouds_container: null,
        firework_effects: new PIXI.Container(),
        fireworks: new PIXI.Graphics(),
        fireworks_items: [],
        mute: new PIXI.Sprite(game.resources.sprites["ui_sound_on"]),
        fullscreen: new PIXI.Sprite(game.resources.sprites["ui_fullscreen_off"]),
    };

    game.containers.level.addChild(game.containers.tiles_very_back);
    game.containers.level.addChild(game.containers.tiles_back);
    game.containers.level.addChild(game.containers.effects);
    game.containers.level.addChild(game.containers.entities);

    game.containers.background_1 = new PIXI.Sprite(game.resources.sprites["background_1"]);
    game.containers.background_1.y = game.render.render_height - game.containers.background_1.height;
    game.containers.background_2 = new PIXI.Sprite(game.resources.sprites["background_2"]);
    game.containers.background_2.y = game.render.render_height - game.containers.background_2.height;
    game.containers.clouds_container = new PIXI.Container();

    for (let i = 0; i < 10; i++) {
        const cloud = new PIXI.Sprite(game.resources.sprites["cloud_" + Math.round(Math.random() * 2)]);
        cloud.y = game.containers.background_2.y - 100 + Math.random() * 50;
        cloud.x = Math.random() * game.render.render_width;
        cloud.speed = 0.1 + Math.random() / 5;
        cloud.anchor.set(0, 0.5);
        game.containers.clouds.push(cloud);
        game.containers.clouds_container.addChild(cloud);
    }

    game.containers.stage.addChild(new PIXI.Sprite(game.resources.sprites["background_0"]));
    game.containers.stage.addChild(game.containers.background_1);
    game.containers.stage.addChild(game.containers.clouds_container);
    game.containers.stage.addChild(game.containers.background_2);
    game.containers.stage.addChild(game.containers.firework_effects);
    game.containers.stage.addChild(game.containers.fireworks);
    game.containers.stage.addChild(game.containers.level);
    game.containers.stage.addChild(game.containers.ui);
    game.containers.stage.addChild(game.containers.ui2);
    game.containers.stage.addChild(game.containers.medals);
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
    game.dead_zones = [];

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
        } else if (entity.type === "animation") {
            const animation = new PIXI.AnimatedSprite(game.resources.sprites[entity["animation_name"]]);
            animation.x = entity.x;
            animation.y = entity.y;
            animation.animationSpeed = entity["animation_speed"];
            animation.play();
            game.containers.entities.addChild(animation);
        } else if (entity.type === "dead_zone") {
            game.dead_zones.push({ x: entity.x, y: entity.y, width: entity.width, height: entity.height, name: entity["name"] });
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
    if (level_name === "main_menu_0" || level_name === "main_menu_1") {
        if (level_name === "main_menu_0") {
            game.containers.ui.visible = false;
        } else {
            game.broken = false;

            const playtime = game.stats.level_start.getTime() - game.stats.game_start.getTime();
            const minutes = playtime / 60000;
            if (minutes < 3) {
                unlock_medal("Speedrun");
            }

            if (minutes < 2) {
                game.emit_event("total_time_under_2");
            } else if (minutes < 2.5) {
                game.emit_event("total_time_under_2_30");
            } else if (minutes < 3) {
                game.emit_event("total_time_under_3");
            } else if (minutes < 3.5) {
                game.emit_event("total_time_under_3_30");
            } else if (minutes < 4) {
                game.emit_event("total_time_under_4");
            } else if (minutes < 5) {
                game.emit_event("total_time_under_5");
            } else if (minutes < 7) {
                game.emit_event("total_time_under_7");
            } else if (minutes < 10) {
                game.emit_event("total_time_under_10");
            } else if (minutes < 15) {
                game.emit_event("total_time_under_15");
            } else if (minutes < 20) {
                game.emit_event("total_time_under_20");
            } else if (minutes < 30) {
                game.emit_event("total_time_under_30");
            } else if (minutes < 60) {
                game.emit_event("total_time_under_60");
            } else if (minutes < 80) {
                game.emit_event("total_time_under_80");
            } else if (minutes < 120) {
                game.emit_event("total_time_under_120");
            } else {
                game.emit_event("total_time_over_120");
            }

            const deaths = game.stats.total_deaths;
            if (deaths < 1) {
                game.emit_event("total_deaths_0");
            } else if (deaths < 5) {
                game.emit_event("total_deaths_under_5");
            } else  if (deaths < 10) {
                game.emit_event("total_deaths_under_10");
            } else  if (deaths < 15) {
                game.emit_event("total_deaths_under_15");
            } else  if (deaths < 20) {
                game.emit_event("total_deaths_under_20");
            } else  if (deaths < 30) {
                game.emit_event("total_deaths_under_30");
            } else  if (deaths < 50) {
                game.emit_event("total_deaths_under_50");
            } else  if (deaths < 100) {
                game.emit_event("total_deaths_under_100");
            } else  if (deaths < 150) {
                game.emit_event("total_deaths_under_150");
            } else {
                game.emit_event("total_deaths_over_150");
            }

            if (game.stats.total_score === 134) {
                unlock_medal("Full Score");
                post_score("100%", Math.floor(playtime));
            }

            if (game.stats.total_kills === 0) {
                unlock_medal("Pacifist");
            }

            post_score("Any%", Math.floor(playtime));

            try {
                if (Storage && localStorage) {
                    let plays = parseInt(localStorage.getItem("plays"));
                    if (plays && !isNaN(plays)) {
                        ++plays;
                        localStorage.setItem("plays", plays.toString());
                        if (plays > 5) {
                            game.emit_event("finish_over_5");
                        } else {
                            game.emit_event("finish_" + plays.toString());
                        }
                    } else {
                        localStorage.setItem("plays", "1");
                        game.emit_event("finish_1");
                    }
                }
            } catch(e) {
                game.emit_event("finish_1");
            }
        }

        if (game.joystick_zone) {
            game.joystick_zone.style.display = "none";
            game.jump_button.style.display = "none";
        }

        game.ui_logo = new PIXI.Sprite(game.resources.sprites["ui_logo"]);
        game.ui_logo.anchor.set(0.5);
        const initial_x = -game.containers.level.x;
        const initial_y = game.initial_y = -game.containers.level.y;
        game.ui_logo.x = initial_x + game.render.render_width / 2;
        game.ui_logo.y = initial_y + game.render.render_height / 2 - 55;
        game.containers.level.addChild(game.ui_logo);

        game.start_button = new PIXI.Sprite(game.resources.sprites["button_start"]);
        game.start_button.anchor.set(0.5);
        game.start_button.x = initial_x + game.render.render_width / 2;
        game.start_button.y = initial_y + game.render.render_height / 2 + 20;
        game.start_button.interactive = true;
        game.start_button.buttonMode = true;
        game.containers.level.addChild(game.start_button);
    } else {
        game.num_clicks++;
        if (game.joystick_zone) {
            game.joystick_zone.style.display = "block";
            game.jump_button.style.display = "block";
        }
    }

    game.containers.level.addChild(game.containers.front_effects);
    game.containers.level.addChild(game.containers.tiles_front);

    if (game.draw_hitboxes) {
        game.containers.level.addChild(game.containers.hitboxes);
    }

    const TEXT_DISTANCE = 13;
    const ICON_DISTANCE = 12;

    game.containers.score.text = "0";
    game.containers.score.x = 24;
    game.containers.score.y = 7;

    game.containers.score_shadow.text = game.containers.score.text;
    game.containers.score_shadow.x = game.containers.score.x;
    game.containers.score_shadow.y = game.containers.score.y + 1;

    game.containers.time.text = "00 : 00";
    game.containers.time.x = 24;
    game.containers.time.y = game.containers.score.y + TEXT_DISTANCE;

    game.containers.coin.x = 7;
    game.containers.coin.y = 7;

    game.containers.coin_shadow.x = game.containers.coin.x;
    game.containers.coin_shadow.y = game.containers.coin.y + 1;
    game.containers.coin_shadow.tint = 0x000000;

    game.containers.timer.x = 7;
    game.containers.timer.y = game.containers.coin.y + ICON_DISTANCE;

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

    game.containers.mute.anchor.set(0.5, 0.5);
    game.containers.mute.x = game.render.render_width - 38;
    game.containers.mute.y = game.render.render_height - 16;
    game.containers.mute.interactive = true;
    game.containers.mute.buttonMode = true;
    game.containers.ui2.addChild(game.containers.mute);

    if (game.performance === "webgl") {
        game.containers.fullscreen.anchor.set(0.5, 0.5);
        game.containers.fullscreen.x = game.render.render_width - 16;
        game.containers.fullscreen.y = game.render.render_height - 16;
        game.containers.fullscreen.interactive = true;
        game.containers.fullscreen.buttonMode = true;
        game.containers.ui2.addChild(game.containers.fullscreen);
    } else {
        game.containers.mute.x = game.render.render_width - 16;
    }

    if (level_name === "main_menu_1") {
        game.containers.deaths.text = game.stats.total_deaths + " TOTAL";
        game.containers.deaths.x = 24;
        game.containers.deaths.y = game.containers.time.y + TEXT_DISTANCE;

        game.containers.deaths_shadow.text = game.containers.deaths.text;
        game.containers.deaths_shadow.x = game.containers.deaths.x;
        game.containers.deaths_shadow.y = game.containers.deaths.y + 1;

        game.containers.kills.text = game.stats.total_kills + " TOTAL";
        game.containers.kills.x = 24;
        game.containers.kills.y = game.containers.deaths.y + TEXT_DISTANCE;

        game.containers.kills_shadow.text = game.containers.kills.text;
        game.containers.kills_shadow.x = game.containers.kills.x;
        game.containers.kills_shadow.y = game.containers.kills.y + 1;

        game.containers.skull.x = 7;
        game.containers.skull.y = game.containers.timer.y + ICON_DISTANCE + 3;

        game.containers.skull_shadow.x = game.containers.skull.x;
        game.containers.skull_shadow.y = game.containers.skull.y + 1;
        game.containers.skull_shadow.tint = 0x000000;

        game.containers.spitting.x = 7;
        game.containers.spitting.y = game.containers.skull.y + ICON_DISTANCE;

        game.containers.spitting_shadow.x = game.containers.spitting.x;
        game.containers.spitting_shadow.y = game.containers.spitting.y + 1;
        game.containers.spitting_shadow.tint = 0x000000;

        game.containers.ui.addChild(game.containers.skull_shadow);
        game.containers.ui.addChild(game.containers.skull);
        game.containers.ui.addChild(game.containers.spitting_shadow);
        game.containers.ui.addChild(game.containers.spitting);
        game.containers.ui.addChild(game.containers.deaths_shadow);
        game.containers.ui.addChild(game.containers.deaths);
        game.containers.ui.addChild(game.containers.kills_shadow);
        game.containers.ui.addChild(game.containers.kills);
    }

    for (let i = 0; i < game.containers.entities.children.length; i++) {
        if (game.containers.entities.children[i].constructor) {
            if (game.order.hasOwnProperty(game.containers.entities.children[i].constructor.name)) {
                game.containers.entities.children[i].zIndex = game.order[game.containers.entities.children[i].constructor.name];
            } else {
                game.containers.entities.children[i].zIndex = 0;
            }
        } else {
            game.containers.entities.children[i].zIndex = 0;
        }
    }
    game.containers.entities.sortChildren();
};

let initialize = function() {
    function check_webgl(fail_if_major_performance_caveat) {
        try {
            if (!window.WebGLRenderingContext) {
                return false;
            }

            const context_options = {
                stencil: true,
                failIfMajorPerformanceCaveat: fail_if_major_performance_caveat,
            };

            const canvas = document.createElement('canvas');
            let gl = canvas.getContext('webgl', context_options) || canvas.getContext('experimental-webgl', context_options);

            const success = !!(gl && gl.getContextAttributes().stencil);

            if (gl) {
                const loseContext = gl.getExtension('WEBGL_lose_context');
                if (loseContext) {
                    loseContext.loseContext();
                }
            }

            gl = null;

            return success;
        }
        catch (e) {
            return false;
        }
    }

    if (check_webgl(true)) {
        game.performance = "webgl";
    } else if (check_webgl(false)) {
        game.performance = "webgl_performance_caveat";
    } else {
        game.performance = "canvas";
    }

    init_newgrounds_session();
    game.emit_event("start_" + game.current_level);
    game.construct_level(game.current_level);
};

let main_loop = function() {
    const elapsed = Math.min(Math.max(game.render.application.ticker.elapsedMS / 1000, 1 / 240), 1 / 10);

    const current_time = new Date();
    const total_elapsed = (current_time.getTime() - game.stats.level_start.getTime()) / 1000;

    const world_x = -game.containers.level.x + game.input.x;
    const world_y = -game.containers.level.y + game.input.y;

    let pointer = game.performance === "webgl" && Physics.point(game.containers.fullscreen.x - game.containers.fullscreen.width / 2, game.containers.fullscreen.y - game.containers.fullscreen.height / 2, game.containers.fullscreen.width, game.containers.fullscreen.height, game.input.x, game.input.y);

    const mute_hover = Physics.point(game.containers.mute.x - game.containers.mute.width / 2, game.containers.mute.y - game.containers.mute.height / 2, game.containers.mute.width, game.containers.mute.height, game.input.x, game.input.y);
    pointer |= mute_hover;
    if (game.input.is_key_pressed("Mute") || (mute_hover && game.input.is_mouse_pressed(0))) {
        game.muted = !game.muted;
        if (game.muted) {
            Howler.volume(0);
        } else {
            Howler.volume(0.1);
        }
    }

    if (game.muted) {
        game.containers.mute.texture = game.resources.sprites["ui_sound_muted"];
    } else {
        game.containers.mute.texture = game.resources.sprites["ui_sound_on"];
    }

    if (!is_fullscreen()) {
        game.containers.fullscreen.texture = game.resources.sprites["ui_fullscreen_on"];
    } else {
        game.containers.fullscreen.texture = game.resources.sprites["ui_fullscreen_off"];
    }

    game.firework_timeout -= elapsed;
    game.extra_timeout -= elapsed * 1000;

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
    for (let i = 0; i < game.containers.clouds.length; i++) {
        game.containers.clouds[i].x += game.containers.clouds[i].speed;
        if (game.containers.clouds[i].x > game.render.render_width) {
            game.containers.clouds[i].x -= game.render.render_width + game.containers.clouds[i].width;
        }
    }
    game.containers.fireworks.clear();
    if (game.containers.fireworks_items.length > 0) {
        for (let i = 0; i < game.containers.fireworks_items.length; ) {
            game.containers.fireworks_items[i].x += game.containers.fireworks_items[i].velocity_x * elapsed;
            game.containers.fireworks_items[i].y += game.containers.fireworks_items[i].velocity_y * elapsed;

            game.containers.fireworks_items[i].velocity_y += 200 * elapsed;

            game.containers.fireworks.beginFill(game.containers.fireworks_items[i].color);
            game.containers.fireworks.drawCircle(game.containers.fireworks_items[i].x, game.containers.fireworks_items[i].y, 1.5);
            game.containers.fireworks.endFill();

            game.containers.fireworks_items[i].lifetime -= elapsed;
            if (game.containers.fireworks_items[i].lifetime <= 0) {
                if (game.containers.fireworks_items[i].generations > 0) {
                    if (game.firework_timeout <= 0) {
                        game.resources.sounds["Explosion4"].play();
                        game.firework_timeout = 0.15;
                    }
                }

                if (game.containers.fireworks_items[i].generations > 0) {
                    const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                    effect.x = game.containers.fireworks_items[i].x;
                    effect.y = game.containers.fireworks_items[i].y;
                    effect.anchor.set(0.5, 0.5);
                    effect.animationSpeed = 0.3;
                    effect.loop = false;
                    effect.play();
                    effect.onComplete = function () {
                        effect.destroy();
                    };
                    game.containers.firework_effects.addChild(effect);

                    for (let j = 0; j < Math.PI * 2; j += 0.5) {
                        game.containers.fireworks_items.push({
                            x: game.containers.fireworks_items[i].x,
                            y: game.containers.fireworks_items[i].y,
                            velocity_y: -25 + Math.sin(j) * 150 / (3 - game.containers.fireworks_items[i].generations),
                            velocity_x: Math.cos(j) * 150 / (3 - game.containers.fireworks_items[i].generations),
                            lifetime: 0.3 + Math.random() * 0.8,
                            color: PIXI.utils.rgb2hex([ 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5 ]),
                            generations: game.containers.fireworks_items[i].generations - 1
                        });
                    }
                }

                game.containers.fireworks_items.splice(i, 1);
            } else {
                i++;
            }
        }
    }
    if (game.start_button && game.broken && game.start_button.y < 209) {
        game.start_button.x += game.start_button_velocity.x * elapsed;
        game.start_button.y += game.start_button_velocity.y * elapsed;
        if (game.start_button.y >= 209) {
            game.resources.sounds["wall_grab"].play();

            if (game.start_button_velocity.bounces < 3) {
                game.start_button.y = 208;
                game.start_button_velocity.x /= 2;
                game.start_button_velocity.y = -game.start_button_velocity.y / 2;
                game.start_button_velocity.bounces++;
            } else {
                game.start_button.x = Math.round(game.start_button.x);
                game.start_button.y = 209;
            }

            const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_dust_ground"]);
            effect.x = game.start_button.x - game.start_button.width / 2;
            effect.y = game.start_button.y + game.start_button.height / 2;
            effect.anchor.set(0.5, 1);
            effect.animationSpeed = 0.3;
            effect.loop = false;
            effect.play();
            effect.onComplete = function () {
                effect.destroy();
            };
            game.containers.effects.addChild(effect);
        }
        game.start_button_velocity.y += 500 * elapsed;
    }

    if (game.start_button) {
        if (!game.broken && game.start_button.visible && Physics.point(game.start_button.x - game.start_button.width / 2, game.start_button.y - game.start_button.height / 2, game.start_button.width, game.start_button.height, world_x, world_y)) {
            pointer = true;

            if (!game.broken) {
                game.start_button.texture = game.resources.sprites["button_start_hover"];
            } else {
                game.start_button.texture = game.resources.sprites["button_start"];
            }

            if (game.input.is_mouse_pressed(0)) {
                if (game.joystick_zone) {
                    game.joystick_zone.style.display = "block";
                    game.jump_button.style.display = "block";
                }

                if (game.current_level === "main_menu_0") {
                    if (!game.broken) {
                        game.broken = true;

                        game.emit_event("pressed_start_0");

                        game.containers.ui.visible = true;
                        game.stats.level_start = game.stats.game_start = new Date();

                        game.start_button.texture = game.resources.sprites["button_start"];
                        game.start_button.interactive = false;
                        game.start_button.buttonMode = false;
                        game.start_button_velocity.x = -75;
                        game.start_button_velocity.y = -150;
                        game.start_button_velocity.bounces = 0;

                        const play_effect = function (x, y, delay) {
                            x -= game.start_button.x;
                            y -= game.start_button.y;
                            const play = function () {
                                const effect = new PIXI.AnimatedSprite(game.resources.sprites["animations_32px_effect_smoke"]);
                                effect.x = x + game.start_button.x;
                                effect.y = y + game.start_button.y;
                                effect.anchor.set(0.5, 0.5);
                                effect.animationSpeed = 0.3;
                                effect.loop = false;
                                effect.play();
                                effect.onComplete = function () {
                                    effect.destroy();
                                };
                                game.containers.front_effects.addChild(effect);

                                if (game.firework_timeout <= 0) {
                                    game.resources.sounds["Explosion4"].play();
                                    game.firework_timeout = 0.15;
                                }
                            };

                            if (delay === 0) {
                                play();
                            } else {
                                setTimeout(play, delay * 1.25);
                            }
                        };

                        play_effect(world_x, world_y, 0);
                        play_effect(201.944, 143.112, 25);
                        play_effect(213.519, 133.827, 25);
                        play_effect(190.993, 142.631, 50);
                        play_effect(283.64, 131.884, 50);
                        play_effect(254.416, 130.571, 75);
                        play_effect(272.686, 148.688, 75);
                        play_effect(231.676, 128.453, 100);
                        play_effect(197.116, 144.635, 100);
                        play_effect(263.551, 132.718, 125);
                        play_effect(284.264, 135.669, 125);

                        game.num_clicks++;

                        game.resources.sounds["Laser_Shoot8"].play();
                    }
                } else {
                    game.emit_event("pressed_start_1");

                    game.ui_logo.visible = game.start_button.visible = false;

                    const credits = new PIXI.Sprite(game.resources.sprites["ui_credits"]);
                    credits.anchor.set(0.5);
                    credits.x = (game.start_button.x -  game.render.render_width / 2) + game.render.render_width / 2;
                    credits.y = (game.start_button.y - game.render.render_height / 2 - 30) + game.render.render_height / 2;
                    game.containers.level.addChild(credits);

                    game.containers.fireworks_items.push({ x: game.render.render_width / 3, y: game.render.render_height * 2 / 3, velocity_y: -180, velocity_x: -90, lifetime: 1,
                        color: PIXI.utils.rgb2hex([ 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5 ]),
                        generations: 2 });
                    game.containers.fireworks_items.push({ x: game.render.render_width / 2, y: game.render.render_height * 2 / 3, velocity_y: -180, velocity_x: 0, lifetime: 0.5,
                        color: PIXI.utils.rgb2hex([ 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5 ]),
                        generations: 2 });
                    game.containers.fireworks_items.push({ x: game.render.render_width * 2 / 3, y: game.render.render_height * 2 / 3, velocity_y: -180, velocity_x: 90, lifetime: 1.3,
                        color: PIXI.utils.rgb2hex([ 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5 ]),
                        generations: 2 });

                    game.resources.sounds["Laser_Shoot8"].play();
                }
            }
        } else {
            game.start_button.texture = game.resources.sprites["button_start"];
        }
    }

    for (let i = 0; i < game.containers.medals_items.length; ) {
        const medal = game.containers.medals_items[i];

        medal.timeout -= elapsed;
        if (medal.timeout <= 0) {
            medal.container.destroy();
            game.containers.medals_items.splice(i, 1);
        } else {
            if (medal.timeout > 1) {
                medal.container.x = Math.max(medal.container.x - elapsed * 400, game.render.render_width - medal.background.width);
            } else if (medal.timeout < 0.4) {
                medal.container.x += elapsed * 400;
            }
            i++;
        }
    }

    let max_radius;
    if (PIXI.utils.isWebGLSupported()) {
        max_radius = Math.sqrt(game.render.render_width * game.render.render_width + game.render.render_height * game.render.render_height);
    } else {
        max_radius = Math.max(game.render.render_width, game.render.render_height);
    }

    const max_side = Math.max(game.render.render_width, game.render.render_height) + max_radius * 2 + 10;

    if (game.next_level == null && game.exit) {
        const next_level = game.exit.update_exit();
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);

            if (PIXI.utils.isWebGLSupported()) {
                game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
            } else {
                game.spawn_effect_radius = max_radius;
            }
        }
    } else if (game.next_level == null && game.altar) {
        const next_level = game.altar.update_altar(elapsed);
        if (next_level) {
            game.next_level = next_level;

            const player_x = game.player.x + game.containers.level.x + game.player.bounds.width / 2;
            const player_y = game.player.y + game.containers.level.y + game.player.bounds.height / 2;
            const max_x = Math.max(player_x, game.render.render_width - player_x);
            const max_y = Math.max(player_y, game.render.render_height - player_y);

            if (PIXI.utils.isWebGLSupported()) {
                game.spawn_effect_radius = Math.sqrt(max_x * max_x + max_y * max_y);
            } else {
                game.spawn_effect_radius = max_radius;
            }
        }
    }
    game.camera.update_camera(elapsed);
    game.input.update();

    game.containers.spawn_transition.clear();

    if (game.player.dead || game.next_level) {
        if (PIXI.utils.isWebGLSupported()) {
            game.containers.spawn_transition.beginFill(0x000000);
            game.containers.spawn_transition.drawRect((game.render.render_width - max_side) / 2, (game.render.render_height - max_side) / 2, max_side, max_side);
            game.containers.spawn_transition.endFill();
        }

        if (Math.abs(game.spawn_effect_radius) > 1e-5) {
            if (PIXI.utils.isWebGLSupported()) {
                game.containers.spawn_transition.beginHole();
                game.containers.spawn_transition.drawCircle(game.player.x + game.containers.level.x + game.player.bounds.width / 2, game.player.y + game.containers.level.y + game.player.bounds.height / 2, game.spawn_effect_radius);
                game.containers.spawn_transition.endHole();
            } else {
                game.containers.spawn_transition.beginFill(0x000000);
                game.containers.spawn_transition.drawCircle(game.player.x + game.containers.level.x + game.player.bounds.width / 2, game.player.y + game.containers.level.y + game.player.bounds.height / 2, max_radius - game.spawn_effect_radius);
                game.containers.spawn_transition.endFill();
            }

            game.spawn_effect_radius = Math.max(game.spawn_effect_radius - elapsed * max_radius, 0);

            if (Math.abs(game.spawn_effect_radius) < 1e-5) {
                if (game.next_level) {
                    if (game.altar) {
                        game.stats["item" + game.altar.item_num] = false;
                        const medal_names = [ "Undefined", "Goblet", "Potion", "Apple", "Key" ];
                        unlock_medal(medal_names[game.altar.item_num]);
                    }

                    game.stats.total_score += game.stats.score;
                    game.stats.total_kills += game.stats.kills;
                    game.current_level = game.next_level;

                    if (game.current_level === "backstage_1") {
                        game.emit_event(game.performance);
                    }

                    game.emit_event("start_" + game.current_level);
                } else {
                    game.emit_event("death_" + game.current_level);
                    game.stats.total_deaths++;
                }
                game.construct_level(game.current_level);
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

    if (game.current_level === "main_menu_1") {
        game.containers.ui.visible = total_elapsed % 1.2 < 0.6;

        const very_total_elapsed = (current_time.getTime() - game.stats.game_start.getTime()) / 1000 - total_elapsed;
        game.containers.score.text = game.stats.total_score + " total";
        game.containers.score_shadow.text = game.containers.score.text;
        const minutes = Math.floor(very_total_elapsed / 60);
        const seconds = Math.floor(very_total_elapsed % 60);
        game.containers.time.text = (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds) + " total";
        game.containers.time_shadow.text = game.containers.time.text;
    } else {
        game.containers.score.text = String(game.stats.score);
        game.containers.score_shadow.text = game.containers.score.text;
        const minutes = Math.floor(total_elapsed / 60);
        const seconds = Math.floor(total_elapsed % 60);
        game.containers.time.text = (minutes < 10 ? "0" + minutes : minutes) + " : " + (seconds < 10 ? "0" + seconds : seconds);
        game.containers.time_shadow.text = game.containers.time.text;
    }

    game.containers.background_1.x = (500 - game.render.render_width) * (game.containers.level.x / game.config.level.width);
    game.containers.background_2.x = (580 - game.render.render_width) * (game.containers.level.x / game.config.level.width);

    game.render.application.renderer.render(game.fake_stage, game.render_target);

    let game_window = document.getElementById("game_window");
    if (pointer) {
        game_window.style.cursor = "pointer";
    } else {
        game_window.style.cursor = "default";
    }
};

window.onfocus = function() {
    if (game.muted) {
        Howler.volume(0);
    } else {
        Howler.volume(0.1);
    }
};

window.onblur = function() {
    Howler.volume(0);
};
