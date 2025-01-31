import * as Phaser from "phaser";

export function spawnAggressiveUFO(scene: Phaser.Scene, ufos: Phaser.Physics.Arcade.Group, target: Phaser.GameObjects.Sprite, bullets: Phaser.Physics.Arcade.Group) {
    if (!ufos) {
        console.error("⚠️ UFO group is not initialized!");
        return;
    }

    if (ufos.countActive(true) >= 4) {
        console.log("🛸 Maximum UFO limit reached. Skipping spawn.");
        return;
    }

    const x = Phaser.Math.Between(100, 700);
    const y = scene.cameras.main.scrollY - 50;

    const ufo = ufos.create(x, y, "chasing_ufo").setScale(1.2);
    if (!ufo) return;

    ufo.play("chasing_ufo_fly");

    // 🚀 Aggressive UFO follows Rocket
    scene.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
            if (!ufo.active || !target.active) return;
            const angle = Phaser.Math.Angle.Between(ufo.x, ufo.y, target.x, target.y);
            scene.physics.velocityFromRotation(angle, 60, ufo.body.velocity);
        }
    });

    // 🔥 Shoots bullets at the rocket
    scene.time.addEvent({
        delay: 4000, // Shoots every 2 seconds
        loop: true,
        callback: () => {
            if (!ufo.active || !target.active) return;
            const bullet = scene.add.circle(ufo.x, ufo.y, 5, 0xffffff);
            scene.physics.add.existing(bullet); // Enable physics for the bullet
            bullets.add(bullet);
            scene.physics.moveTo(bullet, target.x, target.y, 200);
        }
    });

    console.log("💥 Aggressive UFO spawned.");
}
