class MovieClip extends PIXI.AnimatedSprite {
    constructor(descriptors) {
        super(descriptors[0].frames);
        super.animationSpeed = descriptors[0].speed || 1;
        super.loop = !(descriptors[0].loop === false);

        this.descriptors = descriptors;
        this.animation = descriptors[0].name;
    }

    gotoAndPlay(frameOrAnimation) {
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

    gotoAndStop(frameOrAnimation) {
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

module.exports = MovieClip;
