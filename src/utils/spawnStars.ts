import * as Phaser from "phaser";

export function generateStars(scene: Phaser.Scene, stars: Phaser.Physics.Arcade.Group) {
    // 🌟 Set a limit to prevent too many stars
    if (stars.countActive(true) >= 30) {
        console.log("🚀 Too many stars! Skipping spawn.");
        return;
    }

    for (let i = 0; i < 10; i++) {
        let x = Phaser.Math.Between(50, 750);
        let y = scene.cameras.main.scrollY - Phaser.Math.Between(50, 300);

        let star = stars.create(x, y, "star");
        star.setVelocityY(Phaser.Math.Between(10, 30)); // Slight downward movement
    }

    console.log("🌟 New stars have been spawned!");
}
