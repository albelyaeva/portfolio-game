import * as Phaser from "phaser";

export function spawnRandomCows(scene: Phaser.Scene, cows: Phaser.Physics.Arcade.Group) {
    if (!cows) {
        console.error("⚠️ Cow group is not initialized!");
        return;
    }

    // ✅ Limit the number of cows in space
    if (cows.countActive(true) >= 5) {
        console.log("🐄 Too many cows in space! Skipping spawn.");
        return;
    }

    // 🚀 Spawn at a random position above the screen
    const x = Phaser.Math.Between(100, 700);
    const y = scene.cameras.main.scrollY - 50; // Appear above visible screen

    const cow = cows.create(x, y, "cow").setScale(1.2);
    if (!cow) return;

    // 🎲 Give cows random floating movement
    cow.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-20, 20));
    cow.setBounce(1, 1);
    cow.setCollideWorldBounds(true);

    // 🔄 Make the cow slowly rotate
    scene.tweens.add({
        targets: cow,
        angle: Phaser.Math.Between(-90, 90), // Random slight rotation
        duration: Phaser.Math.Between(2000, 5000), // Slow rotation effect
        yoyo: true,
        repeat: -1
    });

    console.log(`🐄 Space Cow Spawned! Total Cows: ${cows.countActive(true)}`);
}
