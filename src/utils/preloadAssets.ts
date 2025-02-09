import * as Phaser from "phaser";

export const preloadAssets = (scene: Phaser.Scene) => {
    scene.load.image("background", "/assets/space-bg.png");
    scene.load.spritesheet("rocket", "/assets/ship.png", { frameWidth: 16, frameHeight: 26 });
    scene.load.image("ufo", "/assets/animation/ufo_beam2.png");
    scene.load.image("cow", "/assets/cow.png");
    scene.load.spritesheet("star", "/assets/star.png", {
        frameWidth: 35,
        frameHeight: 26,
        spacing: 0
    });
    scene.load.spritesheet("chasing_ufo", "/assets/ufo_spritesheet.png", { frameWidth: 63, frameHeight: 44 });
    scene.load.image('speakerOn', 'assets/icons/speaker-on.png');
    scene.load.image('speakerOff', 'assets/icons/speaker-off.png');
    scene.load.audio('backgroundMusic', 'assets/audio/slow-travel.wav');
};