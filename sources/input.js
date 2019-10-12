"use strict";

const init_input = function() {
    document.body.onkeydown = event => {input.keys[event.code] = true; return event.code !== "ArrowDown" && event.code !== "Space";};
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
