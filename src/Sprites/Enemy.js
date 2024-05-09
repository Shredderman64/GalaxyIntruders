class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, enemySpeed) {
        super(scene, x, y, texture, frame);
        this.parentScene = scene;
        this.visible = false;
        this.active = false;

        this.origin = x;
        this.exposed = false;

        this.enemySpeed = enemySpeed;
        this.fallReset = 100;
        this.fallSpeed = 30;

        this.enemyCooldown = Math.floor(Math.random() * 50) + 100;

        this.followerConfig = {
            from: 0,
            to: 1,
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: 0,
            rotateToPath: true,
            rotationOffset: -90
        };

        scene.add.existing(this);

        return this;
    }

    update() {
        this.enemyCooldown--;
        this.fallTimer--;

        let scene = this.parentScene;
        if (this.active) {
            if (this.x < (this.origin - 80) || this.x > (this.origin + 80))
                this.enemySpeed = -(this.enemySpeed);

            this.x += this.enemySpeed;
            if (this.fallTimer <= 0) {
                this.fallTimer = this.fallReset;
                this.y += this.fallSpeed;
            }
        }
        for (let laser of scene.my.sprite.laserGroup.getChildren()) {
            if (this.visible == true && scene.collides(this, laser)) {
                this.y = laser.y = -100;
                this.makeInactive();
                laser.makeInactive();
                if (this instanceof Cruiser)
                    scene.playerScore += 25;
                if (this instanceof Bomber)
                    scene.playerScore += 50;
                scene.sound.play("boom");
            }
        }
    }

    reset(x, time) {
        this.origin = x;
        this.fallTimer = time;
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
        this.exposed = false;
    }
}

class Cruiser extends Enemy {
    performAction() {
        let scene = this.parentScene;
        if (this.enemyCooldown <= 0) {
            let laser = scene.my.sprite.enemyLaserGroup.getFirstDead();
            if (laser != null) {
                laser.makeActive();
                laser.x = this.x;
                laser.y = this.y;
                scene.sound.play("enemyPew");
            }
            this.enemyCooldown = Math.floor(Math.random() * 50) + 100;
        }
    }

    update() {
        super.update();

        let scene = this.parentScene;
        for (let laser of scene.my.sprite.enemyLaserGroup.getChildren()) {
            if (scene.collides(scene.my.sprite.player, laser)) {
                laser.y = -100;
                laser.makeInactive();
                scene.playerHealth--;
                scene.sound.play("ouch");
            }
        }
    }
}

class Bomber extends Enemy {
    performAction() {
        let scene = this.parentScene;
        if (this.enemyCooldown <= 0) {
            this.visible = false;
            this.points = [
                this.x, this.y,
                this.x - 200, this.y + 250,
                this.x + 200, this.y + 500,
                this.x - 200, this.y + 750
            ];
            this.curve = new Phaser.Curves.Spline(this.points);

            this.diveBomber = scene.add.follower(this.curve, 10, 10, "bomber");
            this.diveBomber.setScale(0.5);
            this.diveBomber.x = this.curve.points[0].x;
            this.diveBomber.y = this.curve.points[0].y;
            this.diveBomber.startFollow(this.followerConfig);

            scene.sound.play("shooom");
            this.enemyCooldown = Math.floor(Math.random() * 100) + 150;
        }
    }

    update() {
        super.update();

        let diveBomber = this.diveBomber;
        let scene = this.parentScene;
        if (diveBomber) {
            if (diveBomber.y > (game.config.height + diveBomber.displayHeight / 2)) {
                this.destroyBomber(diveBomber);
                this.visible = true;
            }
            if (scene.collides(diveBomber, scene.my.sprite.player)) {
                this.destroyBomber(diveBomber);
                this.visible = true;
                scene.playerHealth--;
                scene.sound.play("ouch");
            }
            for (let laser of scene.my.sprite.laserGroup.getChildren()) {
                if (scene.collides(laser, diveBomber)) {
                    laser.y = -100;
                    laser.makeInactive();
                    this.makeInactive();
                    this.destroyBomber(diveBomber);
                    scene.playerScore += 100;
                    scene.sound.play("boom");
                }
            }
        }
    }

    destroyBomber(diveBomber) {
        diveBomber.destroy();
        this.diveBomber = null;
    }
}