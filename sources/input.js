"use strict";

const Physics = require("./physics.js");

const init_input = function() {
    document.body.onkeydown = event => {
        input.current_keys[event.code || event.keyCode] = true;

        if (event.code === "KeyF" || event.keyCode === 70) {
            game.toggle_fullscreen();
        }

        const is_space = event.code === "Space" || event.keyCode === 32;
        const is_up = event.code === "ArrowUp" || event.keyCode === 38;
        const is_down = event.code === "ArrowDown" || event.keyCode === 40;
        return !is_space && !is_up && !is_down;
    };

    document.body.onkeyup = event => input.current_keys[event.code || event.keyCode] = false;
    document.body.onmousedown = event => {
        input.mouse[event.button] = true;

        const fullscreen_hover = Physics.point(game.containers.fullscreen.x - game.containers.fullscreen.width / 2, game.containers.fullscreen.y - game.containers.fullscreen.height / 2, game.containers.fullscreen.width, game.containers.fullscreen.height, input.x, input.y);
        if (fullscreen_hover) {
            game.toggle_fullscreen();
        }
    };
    document.body.onmouseup = event => input.mouse[event.button] = false;
    document.body.onmousemove = event => {input.page_x = event.pageX; input.page_y = event.pageY;};

    let game_window = document.getElementById("game_window");
    window.addEventListener("pointerdown", event => {
        input.mouse[0] = true;
        input.page_x = event.pageX;
        input.page_y = event.pageY;
        input.x = (input.page_x - game_window.offsetLeft) / (game.render_target_sprite.scale.x || 1);
        input.y = (input.page_y - game_window.offsetTop) / (game.render_target_sprite.scale.y || 1);

        const fullscreen_hover = Physics.point(game.containers.fullscreen.x - game.containers.fullscreen.width / 2, game.containers.fullscreen.y - game.containers.fullscreen.height / 2, game.containers.fullscreen.width, game.containers.fullscreen.height, input.x, input.y);
        if (fullscreen_hover) {
            game.toggle_fullscreen();
        }

        return false;
    }, false);
    window.addEventListener("pointerup", event => {
        input.mouse[0] = false;
        input.page_x = event.pageX;
        input.page_y = event.pageY;
        input.x = (input.page_x - game_window.offsetLeft) / (game.render_target_sprite.scale.x || 1);
        input.y = (input.page_y - game_window.offsetTop) / (game.render_target_sprite.scale.y || 1);
        return false;
    }, false);

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
    if (game.jump_button) {
        input.keys["Space"] = game.jump_button.is_pressed || input.current_keys["Space"] || input.current_keys["KeyZ"] || input.current_keys[32] || input.current_keys[90];
    } else {
        input.keys["Space"] = input.current_keys["Space"] || input.current_keys["KeyZ"] || input.current_keys[32] || input.current_keys[90];
    }
    if (game.joystick) {
        input.keys["ArrowLeft"] = game.joystick.left || input.current_keys["ArrowLeft"] || input.current_keys["KeyA"] || input.current_keys[65] || input.current_keys[37];
        input.keys["ArrowRight"] = game.joystick.right || input.current_keys["ArrowRight"] || input.current_keys["KeyD"] || input.current_keys[68] || input.current_keys[39];
        input.keys["ArrowUp"] = game.joystick.up || input.current_keys["ArrowUp"] || input.current_keys["KeyW"] || input.current_keys[87] || input.current_keys[38];
        input.keys["ArrowDown"] = game.joystick.down || input.current_keys["ArrowDown"] || input.current_keys["KeyS"] || input.current_keys[83] || input.current_keys[40];
    } else {
        input.keys["ArrowLeft"] = input.current_keys["ArrowLeft"] || input.current_keys["KeyA"] || input.current_keys[65] || input.current_keys[37];
        input.keys["ArrowRight"] = input.current_keys["ArrowRight"] || input.current_keys["KeyD"] || input.current_keys[68] || input.current_keys[39];
        input.keys["ArrowUp"] = input.current_keys["ArrowUp"] || input.current_keys["KeyW"] || input.current_keys[87] || input.current_keys[38];
        input.keys["ArrowDown"] = input.current_keys["ArrowDown"] || input.current_keys["KeyS"] || input.current_keys[83] || input.current_keys[40];
    }
    input.keys["Mute"] = input.current_keys["KeyM"] || input.current_keys[77];

    let game_window = document.getElementById("game_window");
    input.x = (input.page_x - game_window.offsetLeft) / (game.render_target_sprite.scale.x || 1);
    input.y = (input.page_y - game_window.offsetTop) / (game.render_target_sprite.scale.y || 1);
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
    current_keys: {},
    previous_keys: {},
    mouse: {},
    previous_mouse: {},
    page_x: 0,
    page_y: 0,
    x: 0,
    y: 0,
};

module.exports = input;
