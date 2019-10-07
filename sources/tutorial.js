class Tutorial extends PIXI.AnimatedSprite {
    constructor(x, y, frame_a, frame_b) {
        super([ game.resources.sprites[frame_a], game.resources.sprites[frame_b] ]);
        this.animationSpeed = 0.025;
        this.x = x;
        this.y = y;
        this.anchor.set(0.5, 0.5);
        this.alpha = 0.5;
        this.play();
        this.visible = game.num_clicks >= 1;
        this.onFrameChange = function() {
            this.visible = game.num_clicks >= 1;
        };
    }
}

module.exports = Tutorial;
