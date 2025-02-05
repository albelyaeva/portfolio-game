import * as Phaser from "phaser";
import { preloadAssets } from "../utils/preloadAssets";
import { createAnimations } from "../utils/createAnimations";
import { generateStars } from "../utils/spawnStars";
import { spawnRandomCows } from "../utils/spawnCows";
import { spawnChasingUFO } from "../utils/spawnUFO";
import { spawnAggressiveUFO } from "../utils/spawnAggressiveUFO";
import { bulletHitRocket } from "../utils/bulletHitRocket";

export default class MainScene extends Phaser.Scene {
    private rocket!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars!: Phaser.Physics.Arcade.Group;
    private ufos!: Phaser.Physics.Arcade.Group;
    private cows!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private background!: Phaser.GameObjects.TileSprite;
    private score = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private rocketHealth = 3;
    private healthText!: Phaser.GameObjects.Text;
    private lastStarSpawnTime = 0;

    constructor() {
        super({ key: "MainScene" });
    }

    preload() {
        preloadAssets(this);
    }

    create() {
        createAnimations(this);

        this.background = this.add.tileSprite(400, 300, 800, 600, "background").setScrollFactor(0);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create Rocket
        this.rocket = this.physics.add.sprite(400, 500, "rocket").setScale(2).setCollideWorldBounds(true);
        this.rocket.play("fly");

        // Camera Settings
        this.cameras.main.startFollow(this.rocket, true, 0.05, 0.05);
        this.cameras.main.setLerp(0.1, 0.1);
        this.physics.world.setBounds(0, 0, 1600, 2000);
        this.cameras.main.setBounds(0, 0, 1600, 2000);

        // Initialize Objects
        this.stars = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.cows = this.physics.add.group();
        this.ufos = this.physics.add.group();
        generateStars(this, this.stars);

        // UI Elements
        this.healthText = this.add.text(16, 16, `❤️ Health: ${this.rocketHealth}`, {
            fontSize: "20px",
            color: "#ff4d4d"
        }).setScrollFactor(0);

        this.scoreText = this.add.text(600, 16, `⭐ Stars: ${this.score}`, {
            fontSize: "20px",
            color: "#ffff00",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setScrollFactor(0);


        // Collisions
        this.physics.add.overlap(this.bullets, this.rocket, (rocket, bullet) => {
            bulletHitRocket(rocket as Phaser.Physics.Arcade.Sprite, bullet as Phaser.Physics.Arcade.Sprite, this, this.healthText, () => {
                this.rocketHealth--;
                this.healthText.setText(`Health: ${this.rocketHealth}`);
                if (this.rocketHealth <= 0) this.endGame();
            });
        });

        this.physics.add.overlap(this.rocket, this.stars, (player, star) => {
            star.destroy();
            this.score++;
            this.scoreText.setText(`⭐ Stars: ${this.score}`);
        });

        this.physics.add.overlap(this.rocket, this.ufos, (rocket, ufo) => {
            console.log("🚀 Rocket hit by UFO!"); // ✅ Debugging log
            this.rocketHealth--; // Decrease health
            this.healthText.setText(`❤️ Health: ${this.rocketHealth}`);

            if (this.rocketHealth <= 0) {
                console.log("🚀💀 Game Over! Rocket destroyed!");
                this.rocket.destroy();
                this.add.text(300, 300, "GAME OVER", { fontSize: "40px", color: "#ff0000" });

                // Restart game after 3 seconds
                this.time.delayedCall(3000, () => this.scene.restart());
            }

            ufo.destroy(); // 💥 Remove UFO on collision (optional)
        });



        // Spawn Events
        this.time.addEvent({ delay: 7000, loop: true, callback: () => spawnRandomCows(this, this.cows) });
        this.time.addEvent({ delay: 10000, loop: true, callback: () => spawnChasingUFO(this, this.ufos, this.rocket) });
        this.time.addEvent({ delay: 15000, loop: true, callback: () => spawnAggressiveUFO(this, this.ufos, this.rocket, this.bullets) });

        console.log("✅ Scene Created!");
    }

    update() {
        if (!this.rocket || !this.cursors) return;

        this.rocket.setVelocity(0);
        if (this.cursors.left.isDown) this.rocket.setVelocityX(-200);
        if (this.cursors.right.isDown) this.rocket.setVelocityX(200);
        if (this.cursors.up.isDown) {
            this.rocket.setVelocityY(-200);
            this.cameras.main.scrollY -= 4;
            this.background.tilePositionY -= 2;
        } else if (this.cursors.down.isDown) {
            this.rocket.setVelocityY(200);
            this.cameras.main.scrollY += 2;
            this.background.tilePositionY += 1;
        }

        // Star Management
        let visibleStars = this.stars.getChildren().some((star) => (star as Phaser.Physics.Arcade.Sprite).y > this.cameras.main.scrollY);
        if (!visibleStars && this.time.now > this.lastStarSpawnTime + 3000) {
            generateStars(this, this.stars);
            this.lastStarSpawnTime = this.time.now;
        }

        // Cleanup Offscreen Objects
        [this.stars, this.ufos, this.cows, this.bullets].forEach(group => {
            group.getChildren().forEach(obj => {
                if ((obj as Phaser.Physics.Arcade.Sprite).y > this.cameras.main.scrollY + 700) obj.destroy();
            });
        });

        this.background.tilePositionY += this.rocket.body.velocity.y * 0.02;
        this.background.tilePositionX += this.rocket.body.velocity.x * 0.02;
    }

    private endGame() {
        console.log("🚀💀 Game Over! Rocket destroyed!");
        this.rocket.destroy();
        this.add.text(300, 300, "GAME OVER", { fontSize: "40px", color: "#ff0000" });
        this.time.delayedCall(3000, () => this.scene.restart());
    }
}