import * as Phaser from "phaser";

export function spawnRandomUFO(scene: Phaser.Scene, ufos: Phaser.Physics.Arcade.Group) {
    if (!ufos) {
        console.error("⚠️ UFO group is not initialized!");
        return;
    }

    if (ufos.countActive(true) >= 3) {
        console.log("🛸 Maximum UFO limit reached. Skipping spawn.");
        return;
    }

    const x = Phaser.Math.Between(100, 700);
    const y = scene.cameras.main.scrollY - 50;

    const ufo = ufos.create(x, y, "chasing_ufo").setScale(1.2);
    if (!ufo) return;

    // 🎥 Play animation
    ufo.play("chasing_ufo_fly");

    // 🎲 Random movement
    ufo.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-50, 50));
    ufo.setBounce(1, 1);
    ufo.setCollideWorldBounds(true);

    console.log("🛸 Normal UFO spawned.");
}


export function spawnChasingUFO(scene: Phaser.Scene, ufos: Phaser.Physics.Arcade.Group, target: Phaser.GameObjects.Sprite) {
    if (!ufos) {
        console.error("⚠️ UFO group is not initialized!");
        return;
    }

    if (ufos.countActive(true) >= 3) {
        console.log("🛸 Maximum UFO limit reached. Skipping spawn.");
        return;
    }

    // 🚀 Randomly spawn UFO at top of the screen
    const x = Phaser.Math.Between(100, 700);
    const y = scene.cameras.main.scrollY - 50; // Spawn above the visible screen

    const ufo = ufos.create(x, y, "chasing_ufo").setScale(1);

    if (!ufo) {
        console.error("⚠️ Failed to create chasing UFO!");
        return;
    }

    // ✅ Play UFO Animation
    ufo.play("chasing_ufo_fly");

    // Make UFO chase the target (Rocket)
    scene.physics.add.overlap(target, ufo, () => {
        console.log("💥 Rocket hit by UFO!");
        scene.cameras.main.shake(300, 0.02); // Small screen shake effect
        ufo.destroy();
    });

    // // UFO AI - Move towards the Rocket
    scene.physics.add.collider(target, ufo);

    scene.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
            if (!ufo.active || !target.active) return;
            const angle = Phaser.Math.Angle.Between(ufo.x, ufo.y, target.x, target.y);
            scene.physics.velocityFromRotation(angle, 60, ufo.body.velocity);
        }
    });

    console.log("🛸 A chasing UFO has appeared!");
}

