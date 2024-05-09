class Title extends Phaser.Scene {
    constructor() {
        super("titleScreen");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.bitmapFont("pixel_square", "fonts/pixel_square_0.png", "fonts/pixel_square.fnt");
    }

    create() {
        this.startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.add.bitmapText(game.config.width / 2, game.config.height / 2 - 100, "pixel_square",
        "Galaxy Intruders", 32).setOrigin(0.5);
        this.add.bitmapText(game.config.width / 2, game.config.height / 2, "pixel_square",
        "A and D keys to move", 20).setOrigin(0.5);
        this.add.bitmapText(game.config.width / 2, game.config.height / 2 + 20, "pixel_square",
        "Space to fire", 20).setOrigin(0.5);
        this.add.bitmapText(game.config.width / 2, game.config.height / 2 + 60, "pixel_square",
        "Press ENTER to start game", 20).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startGame))
            this.scene.start("galleryScreen");
    }
}