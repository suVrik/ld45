"use strict";

const update_physical_size = function() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

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
