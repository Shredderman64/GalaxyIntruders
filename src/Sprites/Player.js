class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed) {
        super(scene, x, y, texture, frame);

        this.left = leftKey;
        this.right = rightKey;
        this.playerSpeed = playerSpeed;
        
        this.active = true;
        this.visible = true;

        scene.add.existing(this);

        return this;
    }

    update() {
        if (this.left.isDown) {
            if (this.x > (this.displayWidth / 2))
                this.x -= this.playerSpeed;
        }
        if (this.right.isDown) {
            if (this.x < (game.config.width - this.displayWidth / 2))
                this.x += this.playerSpeed;
        }
    }

    makeInactive() {
        this.active = false;
        this.visible = false;
    }
}