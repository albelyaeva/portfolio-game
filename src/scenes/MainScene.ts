import * as Phaser from "phaser";
import {preloadAssets} from "../utils/preloadAssets";
import {createAnimations} from "../utils/createAnimations";
import {generateStars} from "../utils/spawnStars";
import {spawnRandomCows} from "../utils/spawnCows";
import {spawnChasingUFO} from "../utils/spawnUFO";
import {spawnAggressiveUFO} from "../utils/spawnAggressiveUFO";
import {bulletHitRocket} from "../utils/bulletHitRocket";

export default class MainScene extends Phaser.Scene {
    // Constants for gameplay values
    private static readonly ROCKET_SPEED = 200;
    private static readonly BULLET_SPEED = -300;
    private static readonly BULLET_COOLDOWN = 300;
    private static readonly UFO_COW_ESCAPE_DISTANCE = 150;
    private static readonly UFO_COW_ESCAPE_VELOCITY = 170;
    private static readonly OFFSCREEN_BUFFER = 700;

    // Game Objects & Groups
    private rocket!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private shootKey!: Phaser.Input.Keyboard.Key;
    private background!: Phaser.GameObjects.TileSprite;

    private stars!: Phaser.Physics.Arcade.Group;
    private ufos!: Phaser.Physics.Arcade.Group;
    private cows!: Phaser.Physics.Arcade.Group;
    private rocketBullets!: Phaser.Physics.Arcade.Group;
    private ufoBullets!: Phaser.Physics.Arcade.Group;

    // Game State
    private score = 0;
    private rocketHealth = 3;
    private cowsRescued = 0;
    private lastStarSpawnTime = 0;
    private lastFired = 0;

    // UI Elements
    private scoreText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    private cowsRescuedText!: Phaser.GameObjects.Text;
    private gameOverText!: Phaser.GameObjects.Text;
    private cowsRescuedGameOverText!: Phaser.GameObjects.Text;

    constructor() {
        super({key: "MainScene"});
    }

    init() {
        this.score = 0;
        this.rocketHealth = 3;
        this.cowsRescued = 0;
    }


    preload() {
        preloadAssets(this);
        // Create bullet texture once
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillRect(0, 0, 4, 10);
        graphics.generateTexture('pinkBullet', 4, 10);
        graphics.destroy();
    }

    create() {
        createAnimations(this);
        this.setupBackground();
        this.setupInput();
        this.setupRocket();
        this.setupCameraAndWorld();
        this.initializeGroups();
        this.setupUI();
        this.registerCollisions();
        this.registerSpawnEvents();
        this.registerGlobalBulletCleanup();
        const music = this.sound.add('backgroundMusic', {loop: true, volume: 0.5});
        music.play();

        let thrust = 0;

        const speakerIcon = this.add.image(this.cameras.main.width - 40, this.cameras.main.height - 40, 'speakerOn')
            .setScrollFactor(0)
            .setInteractive()
            .setDisplaySize(40, 40);

        speakerIcon.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            thrust = -300;

            if (music.isPlaying) {
                music.pause();
                speakerIcon.setTexture('speakerOff');
            } else {
                music.resume();
                speakerIcon.setTexture('speakerOn');
            }
        });

        this.input.on('pointerdown', (pointer) => {
            thrust = 0;
            if (pointer.x < this.cameras.main.width / 2) {
                this.rocket.setVelocityX(-200);
            } else {
                this.rocket.setVelocityX(200);
            }

            this.rocket.setVelocityY(-200);
        });

        this.input.on('pointerup', () => {
            this.rocket.setVelocityX(0);
            this.rocket.setVelocityY(0);
        });

        this.physics.world.on('worldstep', () => {
            this.rocket.setVelocityY(thrust); // Apply continuous thrust
        });

        speakerIcon.on('pointerover', () => {
            speakerIcon.setDisplaySize(50, 50);
        });

        speakerIcon.on('pointerout', () => {
            speakerIcon.setDisplaySize(40, 40);
        });

        this.scale.on('resize', (gameSize) => {
            const {width, height} = gameSize;

            speakerIcon.setPosition(width - 40, height - 40);

            // 🚀 Center the rocket
            this.rocket.setPosition(width / 2, height - 100);

            // 🎮 Center "Game Over" text
            const newFontSize = Math.max(width * 0.08, 24);
            this.gameOverText.setPosition(width / 2, height / 2);
            this.gameOverText.setFontSize(newFontSize);

            // ⭐ Reposition the stars collected text
            const scoreFontSize = Math.max(width * 0.03, 16);
            this.scoreText.setPosition(width - 160, 16);
            this.scoreText.setFontSize(scoreFontSize);

            this.cowsRescuedGameOverText.setPosition(width / 2, height / 2 + 50);
        });

        console.log("✅ Scene Created!");
    }

    update(time: number) {
        if (!this.rocket || !this.rocket.body) return;
        this.handlePlayerMovement();
        this.manageStars(time);
        this.handleCowEscape();
        this.handleShooting(time);
        this.cleanupOffscreenObjects();
        this.updateBackgroundPosition();
    }

    // ─── SETUP METHODS ────────────────────────────────────────────────

    private setupBackground() {
        this.background = this.add
            .tileSprite(400, 300, 800, 600, "background")
            .setScrollFactor(0);
    }

    private setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    private setupRocket() {
        this.rocket = this.physics.add
            .sprite(400, 500, "rocket")
            .setScale(2)
            .setCollideWorldBounds(true);
        this.rocket.play("fly");
    }

    private setupCameraAndWorld() {
        this.cameras.main.startFollow(this.rocket, true, 0.05, 0.05);
        this.cameras.main.setLerp(0.1, 0.1);
        const worldWidth = 1600;
        const worldHeight = 2000;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    }

    private initializeGroups() {
        this.stars = this.physics.add.group();
        generateStars(this, this.stars);

        this.rocketBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: true,
            maxSize: 20
        });
        this.ufoBullets = this.physics.add.group({
            defaultKey: "ufoBullet",
            maxSize: 10
        });
        this.cows = this.physics.add.group({
            collideWorldBounds: true,
            bounceY: 1,
        });
        this.ufos = this.physics.add.group();
    }

    private setupUI() {
        const baseFontSize = Math.max(this.cameras.main.width * 0.025, 14);
        const baseFontSizeGameOver = Math.max(this.cameras.main.width * 0.03, 16);

        //  Health Text (Top-Left)
        this.healthText = this.add.text(16, 16, `❤️ Health: ${this.rocketHealth}`, {
            fontSize: `${baseFontSize}px`,
            color: "#ff4d4d"
        }).setScrollFactor(0);

        // Stars Text (Top-Right)
        this.scoreText = this.add.text(this.cameras.main.width - 160, 16, `⭐ Stars: ${this.score}`, {
            fontSize: `${baseFontSize}px`,
            color: "#ffff00",
            fontFamily: "Arial",
            fontStyle: "bold"
        }).setScrollFactor(0);

        // Cows Rescued Text (Below Health)
        this.cowsRescuedText = this.add.text(16, 50, `🐄 Cows Rescued: ${this.cowsRescued}`, {
            fontSize: `${baseFontSize}px`,
            color: "#ffffff"
        }).setScrollFactor(0);

        this.cowsRescuedGameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50,
            `🐄 Cows Rescued: ${this.cowsRescued}`, {
            fontSize: "30px",
            color: "#ffffff"
        }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

        this.gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', {
            fontSize: `${baseFontSizeGameOver}px`,
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setVisible(false);


        const padding = Math.max(this.cameras.main.width * 0.02, 10);

        this.healthText.setPosition(padding, padding);
        this.cowsRescuedText.setPosition(padding, this.healthText.y + baseFontSize + padding);
        const safeAreaPadding = 20;
        this.scoreText.setPosition(this.cameras.main.width - 160, safeAreaPadding);
        this.tweens.add({
            targets: this.cowsRescuedText,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true,
            duration: 200,
            ease: 'Power2'
        });
    }

    private registerCollisions() {
        // Rocket hit by UFO bullet
        this.physics.add.overlap(
            this.ufoBullets,
            this.rocket,
            (rocket, bullet) => this.onRocketHitByBullet(rocket as Phaser.Physics.Arcade.Sprite, bullet as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );

        // Rocket collects a star
        this.physics.add.overlap(
            this.rocket,
            this.stars,
            (rocket, star) => this.onStarCollected(star as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );

        // Rocket rescues a cow
        this.physics.add.overlap(
            this.rocket,
            this.cows,
            (rocket, cow) => this.onCowRescued(cow as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );

        // Rocket bullet hits a cow
        this.physics.add.overlap(
            this.rocketBullets,
            this.cows,
            (bullet, cow) => this.onCowHitByBullet(bullet as Phaser.Physics.Arcade.Image, cow as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );

        // Rocket collides with UFO
        this.physics.add.overlap(
            this.rocket,
            this.ufos,
            (rocket, ufo) => this.onRocketCollideWithUFO(ufo as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );

        // Rocket bullet hits UFO
        this.physics.add.overlap(
            this.rocketBullets,
            this.ufos,
            (bullet, ufo) => this.onRocketBulletHitUFO(bullet as Phaser.Physics.Arcade.Image, ufo as Phaser.Physics.Arcade.Sprite),
            undefined,
            this
        );
    }

    private registerSpawnEvents() {
        this.time.addEvent({
            delay: 7000,
            loop: true,
            callback: () => spawnRandomCows(this, this.cows)
        });
        this.time.addEvent({
            delay: 10000,
            loop: true,
            callback: () => spawnChasingUFO(this, this.ufos, this.rocket)
        });
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => spawnAggressiveUFO(this, this.ufos, this.rocket, this.ufoBullets)
        });
    }

    private registerGlobalBulletCleanup() {
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
            const gameObject = body.gameObject as Phaser.GameObjects.GameObject;
            if (gameObject && (gameObject as Phaser.Physics.Arcade.Image).texture.key === 'pinkBullet') {
                gameObject.destroy();
            }
        });
    }

    // ─── COLLISION HANDLERS ───────────────────────────────────────────

    private onRocketHitByBullet(rocket: Phaser.Physics.Arcade.Sprite, bullet: Phaser.Physics.Arcade.Sprite) {
        bulletHitRocket(rocket, bullet, this, this.healthText, () => {
            this.rocketHealth--;
            this.healthText.setText(`❤️ Health: ${this.rocketHealth}`);
            if (this.rocketHealth <= 0) this.endGame();
        });
    }

    private onStarCollected(star: Phaser.Physics.Arcade.Sprite) {
        star.destroy();
        this.score++;
        this.scoreText.setText(`⭐ Stars: ${this.score}`);
    }

    private onCowRescued(cow: Phaser.Physics.Arcade.Sprite) {
        console.log("🐄 Cow rescued! +1 Health!");
        cow.destroy();
        this.cowsRescued++;
        this.cowsRescuedText.setText(`🐄 Cows Rescued: ${this.cowsRescued}`);
        if (this.rocketHealth < 3) {
            this.rocketHealth++;
            this.healthText.setText(`❤️ Health: ${this.rocketHealth}`);
        }
    }

    private onCowHitByBullet(bullet: Phaser.Physics.Arcade.Image, cow: Phaser.Physics.Arcade.Sprite) {
        console.log("💥 Cow hit by bullet!");
        bullet.destroy();
        cow.setVelocityY(-300); // Knock the cow upwards
        this.time.delayedCall(2000, () => cow.destroy());
    }

    private onRocketCollideWithUFO(ufo: Phaser.Physics.Arcade.Sprite) {
        console.log("🚀 Rocket hit by UFO!");
        this.rocketHealth--;
        this.healthText.setText(`❤️ Health: ${this.rocketHealth}`);
        if (this.rocketHealth <= 0) {
            this.endGame();
        }
        ufo.destroy();
    }

    private onRocketBulletHitUFO(bullet: Phaser.Physics.Arcade.Image, ufo: Phaser.Physics.Arcade.Sprite) {
        console.log("💥 Rocket bullet hit UFO!");
        bullet.destroy();
        ufo.destroy();
    }

    // ─── UPDATE HELPER METHODS ─────────────────────────────────────────

    private handlePlayerMovement() {
        this.rocket.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.rocket.setVelocityX(-MainScene.ROCKET_SPEED);
        }
        if (this.cursors.right.isDown) {
            this.rocket.setVelocityX(MainScene.ROCKET_SPEED);
        }
        if (this.cursors.up.isDown) {
            this.rocket.setVelocityY(-MainScene.ROCKET_SPEED);
            this.cameras.main.scrollY -= 4;
            this.background.tilePositionY -= 2;
        } else if (this.cursors.down.isDown) {
            this.rocket.setVelocityY(MainScene.ROCKET_SPEED);
            this.cameras.main.scrollY += 2;
            this.background.tilePositionY += 1;
        }
    }

    private manageStars(currentTime: number) {
        const hasVisibleStars = this.stars.getChildren().some(
            (star) => (star as Phaser.Physics.Arcade.Sprite).y > this.cameras.main.scrollY
        );
        if (!hasVisibleStars && currentTime > this.lastStarSpawnTime + 3000) {
            generateStars(this, this.stars);
            this.lastStarSpawnTime = currentTime;
        }
    }

    private handleCowEscape() {
        this.ufos.getChildren().forEach((ufoObj) => {
            const ufo = ufoObj as Phaser.Physics.Arcade.Sprite;
            this.cows.getChildren().forEach((cowObj) => {
                const cow = cowObj as Phaser.Physics.Arcade.Sprite;
                const distance = Phaser.Math.Distance.Between(ufo.x, ufo.y, cow.x, cow.y);
                if (distance < MainScene.UFO_COW_ESCAPE_DISTANCE) {
                    console.log("🐄 Cow is running away from UFO!");
                    const angle = Phaser.Math.Angle.Between(ufo.x, ufo.y, cow.x, cow.y);
                    cow.setVelocity(
                        Math.cos(angle) * MainScene.UFO_COW_ESCAPE_VELOCITY,
                        Math.sin(angle) * MainScene.UFO_COW_ESCAPE_VELOCITY
                    );
                    cow.setTint(0xff0000);
                    this.time.delayedCall(1000, () => cow.clearTint());
                }
            });
        });
    }

    private handleShooting(currentTime: number) {
        if (this.shootKey.isDown && currentTime > this.lastFired + MainScene.BULLET_COOLDOWN) {
            this.fireBullet();
            this.lastFired = currentTime;
        }

        // Remove bullets that have gone too far above the camera view
        this.rocketBullets.getChildren().forEach((bullet) => {
            if ((bullet as Phaser.Physics.Arcade.Image).y < this.cameras.main.scrollY - 50) {
                bullet.destroy();
            }
        });
    }

    private cleanupOffscreenObjects() {
        const groups = [this.stars, this.ufos, this.cows, this.ufoBullets, this.rocketBullets];
        groups.forEach((group) => {
            group.getChildren().forEach((obj) => {
                if ((obj as Phaser.Physics.Arcade.Sprite).y > this.cameras.main.scrollY + MainScene.OFFSCREEN_BUFFER) {
                    obj.destroy();
                }
            });
        });
    }

    private updateBackgroundPosition() {
        this.background.tilePositionY += (this.rocket.body.velocity.y * 0.02);
        this.background.tilePositionX += (this.rocket.body.velocity.x * 0.02);
    }

    // ─── BULLET CREATION ──────────────────────────────────────────────

    private fireBullet() {
        const bullet = this.rocketBullets.get(this.rocket.x, this.rocket.y - 20, 'pinkBullet') as Phaser.Physics.Arcade.Image;
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setDisplaySize(4, 10);
            bullet.setTint(0xff1493);
            (bullet.body as Phaser.Physics.Arcade.Body).setVelocityY(MainScene.BULLET_SPEED);
            bullet.setCollideWorldBounds(true);
            (bullet.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
            // No need to add an event listener here because we already registered one globally in registerGlobalBulletCleanup()
        }
    }

    // ─── GAME OVER ─────────────────────────────────────────────────────

    private endGame() {
        console.log("🚀💀 Game Over! Rocket destroyed!");
        this.rocket.destroy();
        this.gameOverText.setVisible(true);
        this.cowsRescuedGameOverText.setVisible(true);

        this.tweens.add({
            targets: this.gameOverText,
            alpha: {from: 0, to: 1},
            duration: 1000,
            ease: 'Power2'
        });
        this.time.delayedCall(3000, () => this.scene.restart());
    }
}
