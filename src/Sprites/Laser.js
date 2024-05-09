class Laser extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.visible = false;
        this.active = false;
        return this;
    }

    update() {
        let displayRadius = this.displayHeight / 2;
        if (this.active) {
            this.y -= this.speed;
            if (this.y < -(displayRadius) || this.y > game.config.height + displayRadius)
                this.makeInactive();
        }
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }
    
    makeInactive() {
        this.visible = false;
        this.active = false;
    }
}