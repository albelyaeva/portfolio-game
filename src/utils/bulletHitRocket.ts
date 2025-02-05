import * as Phaser from "phaser";

export function bulletHitRocket(
    rocket: Phaser.Physics.Arcade.Sprite, // ✅ Ensure this is a Sprite
    bullet: Phaser.Physics.Arcade.Sprite,
    scene: Phaser.Scene,
    healthText: Phaser.GameObjects.Text,
    decreaseHealth: () => void
) {
    console.log("💥 Rocket hit by bullet!");

    bullet.destroy(); // Remove the bullet

    // 🚀 Reduce `rocketHealth` stored in the scene
    decreaseHealth(); // Update health value in Game.tsx

    // 🔥 Add screen shake effect
    scene.cameras.main.shake(200, 0.02);
}
