"use strict";

const init_input = function() {
    document.body.onkeydown = event => {input.current_keys[event.code] = true; return event.code !== "ArrowDown" && event.code !== "Space";};
    document.body.onkeyup = event => input.current_keys[event.code] = false;
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
    if (game.jump_button) {
        input.keys["Space"] = game.jump_button.is_pressed || input.current_keys["Space"] || input.current_keys["KeyZ"];
    } else {
        input.keys["Space"] = input.current_keys["Space"] || input.current_keys["KeyZ"];
    }
    if (game.joystick) {
        input.keys["ArrowLeft"] = game.joystick.left || input.current_keys["ArrowLeft"] || input.current_keys["KeyA"];
        input.keys["ArrowRight"] = game.joystick.right || input.current_keys["ArrowRight"] || input.current_keys["KeyD"];
        input.keys["ArrowUp"] = game.joystick.up || input.current_keys["ArrowUp"] || input.current_keys["KeyW"];
        input.keys["ArrowDown"] = game.joystick.down || input.current_keys["ArrowDown"] || input.current_keys["KeyS"];
    } else {
        input.keys["ArrowLeft"] = input.current_keys["ArrowLeft"] || input.current_keys["KeyA"];
        input.keys["ArrowRight"] = input.current_keys["ArrowRight"] || input.current_keys["KeyD"];
        input.keys["ArrowUp"] = input.current_keys["ArrowUp"] || input.current_keys["KeyW"];
        input.keys["ArrowDown"] = input.current_keys["ArrowDown"] || input.current_keys["KeyS"];
    }
    input.keys["Fullscreen"] = input.current_keys["KeyF"];
    input.keys["Mute"] = input.current_keys["KeyM"];
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
};

module.exports = input;
