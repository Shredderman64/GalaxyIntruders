class Gallery extends Phaser.Scene {
    constructor() {
        super("galleryScreen");

        this.my = {sprite: {}};
        
        this.laserSpeed = 10;
        this.laserCooldown = 25;
        this.laserReady = 0;

        this.enemySpeed = 5;
        this.fallTimer = 100;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("player", "playerShip.png");
        this.load.image("cruiser", "enemyCruiser.png");
        this.load.image("bomber", "enemyBomber.png");

        this.load.image("laser", "laserGreen.png");
        this.load.image("enemyLaser", "laserBlue.png");

        this.load.audio("pew", "audio/laserRetro_000.ogg");
        this.load.audio("boom", "audio/explosionCrunch_000.ogg");
        this.load.audio("enemyPew", "audio/laserRetro_001.ogg");
        this.load.audio("shooom", "audio/shooom.ogg");

        this.load.audio("ouch", "audio/forceField_000.ogg");
        this.load.audio("death", "audio/explosionCrunch_003.ogg");

        this.load.bitmapFont("pixel_square", "fonts/pixel_square_0.png", "fonts/pixel_square.fnt");
    }

    create() {
        this.init_game();

        let my = this.my;

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.return = this.input.keyboard.addKey("R");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.sprite.player = new Player(this, game.config.width / 2, game.config.height - 100, "player",
        null, this.left, this.right, 10);
        my.sprite.player.setScale(0.5);

        my.sprite.laserGroup = this.add.group({
            defaultKey: "laser",
            maxSize: 5,
            runChildUpdate: true
            }
        )
        my.sprite.laserGroup.createMultiple({
            classType: Laser,
            active: false,
            visible: false,
            key: my.sprite.laserGroup.defaultKey,
            repeat: my.sprite.laserGroup.maxSize - 1
            }
        )
        my.sprite.laserGroup.propertyValueSet("speed", this.laserSpeed);

        my.sprite.enemyLaserGroup = this.add.group({
            defaultKey: "enemyLaser",
            maxSize: 5,
            runChildUpdate: true
            }
        )
        my.sprite.enemyLaserGroup.createMultiple({
            classType: Laser,
            active: false,
            visible: false,
            key: my.sprite.enemyLaserGroup.defaultKey,
            repeat: my.sprite.enemyLaserGroup.maxSize - 1
            }
        )
        my.sprite.enemyLaserGroup.propertyValueSet("speed", -(this.laserSpeed));

        my.sprite.enemyGroup = this.add.group({
            defaultKey: "cruiser",
            maxSize: 9,
            runChildUpdate: true
            }
        )
        my.sprite.enemyGroup.createMultiple({
            classType: Cruiser,
            active: false,
            visible: false,
            key: my.sprite.enemyGroup.defaultKey,
            repeat: 5
            }
        )
        my.sprite.enemyGroup.createMultiple({
            classType: Bomber,
            active: false,
            visible: false,
            key: "bomber",
            repeat: 2
            }
        )

        this.myScore = this.add.bitmapText(580, 775, "pixel_square", "Score: " + this.playerScore, 32)
        .setOrigin(1);
        this.myHealth = this.add.bitmapText(20, 743, "pixel_square", "Lives: " + this.playerHealth, 32)
        .setOrigin(0);
    }

    update() {
        let my = this.my;
        if (!this.gameOver)
            this.laserReady--;

        my.sprite.player.update();
        this.myScore.setText("Score: " + this.playerScore);
        this.myHealth.setText("Lives: " + this.playerHealth);

        // start of new wave
        if (my.sprite.enemyGroup.getTotalUsed() == 0) {
            this.newWave = true;
        }
        if (this.newWave == true) {
            this.columns = [[], [], []];
            my.sprite.enemyGroup.propertyValueSet("enemySpeed", this.enemySpeed);
            for (let enemyY = 300; enemyY >= 100; enemyY -= 100) {
                for (let enemyX = 150; enemyX <= 450; enemyX += 150) {
                    let enemy = my.sprite.enemyGroup.get();
                    enemy.reset(enemyX, this.fallTimer);
                    enemy.x = enemyX;
                    enemy.y = enemyY;
                    enemy.setScale(0.5);
                    enemy.makeActive();
                }
            }
            for (let enemy of my.sprite.enemyGroup.getChildren()) {
                if (enemy.x == 150)
                    this.columns[0].push(enemy);
                if (enemy.x == 300)
                    this.columns[1].push(enemy);
                if (enemy.x == 450)
                    this.columns[2].push(enemy);
            }
            this.newWave = false;
        }

        // enables behaviors for exposed enemies
        for (let column of this.columns) {
            for (let enemy of column) {
                if (enemy.exposed)
                    enemy.performAction();
                if (enemy.active) {
                    enemy.exposed = true;
                    break;
                }
            }
        }

        if (!this.gameOver) {
            // laser mechanics
            if (this.space.isDown && this.laserReady <= 0) {
                let laser = my.sprite.laserGroup.getFirstDead();
                if (laser != null) {
                    this.laserReady = this.laserCooldown;
                    laser.makeActive();
                    laser.x = my.sprite.player.x;
                    laser.y = my.sprite.player.y - (my.sprite.player.displayHeight / 2);
                    this.sound.play("pew");
                }
            }
            for (let enemy of my.sprite.enemyGroup.getChildren()) {
                // enemy collision
                for (let laser of this.my.sprite.laserGroup.getChildren()) {
                    if (enemy.visible == true && this.collides(enemy, laser)) {
                        enemy.y = laser.y = -100;
                        enemy.makeInactive();
                        laser.makeInactive();
                        enemy.givePoints(this);
                        this.sound.play("boom");
                    }
                }
                // game over
                if ((enemy.y >= (my.sprite.player.y - my.sprite.player.displayHeight / 2)
                    || this.playerHealth == 0)) {
                    my.sprite.player.makeInactive();
                    my.sprite.enemyGroup.setActive(false);
                    my.sprite.laserGroup.setActive(false).setVisible(false);
                    this.sound.play("death");
                    
                    this.add.bitmapText(game.config.width / 2, game.config.height / 2, "pixel_square",
                    "game over", 32).setOrigin(0.5)
                    this.add.bitmapText(game.config.width / 2, (game.config.height / 2) + 30, "pixel_square", 
                    "Press R to return to menu", 20).setOrigin(0.5);
                    this.gameOver = true;
                    break;
                }
            }
        }

        if (this.gameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.return))
                this.scene.start("titleScreen");
        }
    }

    collides(obj1, obj2) {
        if (Math.abs(obj1.x - obj2.x) > (obj1.displayWidth / 2 + obj2.displayWidth / 2))
            return false;
        if (Math.abs(obj1.y - obj2.y) > (obj1.displayHeight / 2 + obj2.displayHeight / 2))
            return false;
        return true;
    }

    init_game() {
        this.playerHealth = 3;
        this.playerScore = 0;

        this.newWave = false;

        this.gameOver = false;
    }
}