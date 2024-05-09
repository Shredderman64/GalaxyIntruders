"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 600,
    height: 800,
    scene: [Title, Gallery],
    fps: { forceSetTimeOut: true, target: 40}
}

const game = new Phaser.Game(config);