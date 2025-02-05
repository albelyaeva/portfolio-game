import * as Phaser from "phaser";

export const createAnimations = (scene: Phaser.Scene) => {
    scene.anims.create({ key: "fly", frames: scene.anims.generateFrameNumbers("rocket", { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: "chasing_ufo_fly", frames: scene.anims.generateFrameNumbers("chasing_ufo", { start: 0, end: 2 }), frameRate: 10, repeat: -1 });
};