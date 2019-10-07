class MovieClip extends PIXI.AnimatedSprite {
    constructor(descriptors, default_animation) {
        super(descriptors[default_animation].frames);
        super.animationSpeed = descriptors[default_animation].speed || 1;
        super.loop = !(descriptors[default_animation].loop === false);

        this.descriptors = descriptors;
        this.animation = default_animation;
    }

    gotoAndPlay(frameOrAnimation) {
        if (this.animation !== frameOrAnimation) {
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
    }

    gotoAndStop(frameOrAnimation) {
        if (this.animation !== frameOrAnimation) {
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
}

module.exports = MovieClip;
