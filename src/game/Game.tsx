import * as Phaser from "phaser";
import {useEffect, useRef} from "react";
import {spawnRandomUFO, spawnChasingUFO} from "../utils/spawnUFO";
import {spawnAggressiveUFO} from "../utils/spawnAggressiveUFO";
import {generateStars} from "../utils/spawnStars";
import {spawnRandomCows} from "../utils/spawnCows";

const Game = () => {
    const gameContainer = useRef(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameContainer.current!,
            physics: {
                default: "arcade",
                arcade: {
                    gravity: {x: 0, y: 0}, // No gravity in space
                    debug: false
                }
            },
            scene: {
                preload,
                create,
                update
            }
        };

        const game = new Phaser.Game(config);
        let rocket: Phaser.Physics.Arcade.Sprite;
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
        let stars: Phaser.Physics.Arcade.Group;
        let ufos: Phaser.Physics.Arcade.Group;
        let cows: Phaser.Physics.Arcade.Group;
        let bullets: Phaser.Physics.Arcade.Group;
        let background: Phaser.GameObjects.TileSprite;
        let score = 0;
        let scoreText: Phaser.GameObjects.Text;

        function preload(this: Phaser.Scene) {
            console.log("✅ Preloading assets...");
            this.load.image("background", "/assets/space-bg.png");
            this.load.spritesheet("rocket", "assets/ship.png", {
                frameWidth: 16,
                frameHeight: 26,
                spacing: 0
            });
            this.load.spritesheet("star", "/assets/star.png", {
                frameWidth: 35,
                frameHeight: 26,
                spacing: 0
            });
            this.load.image("ufo", "/assets/animation/ufo_beam2.png");
            this.load.image("cow", "/assets/cow.png");

            // Load UFO animation frames separately
            this.load.image("ufo_idle", "assets/animation/ufo_idle.png");
            this.load.image("ufo_beam1", "assets/animation/ufo_beam1.png");
            this.load.image("ufo_beam2", "assets/animation/ufo_beam2.png");

            // Load spritesheet (if available)
            this.load.spritesheet("chasing_ufo", "assets/ufo_spritesheet.png", {
                frameWidth: 63, // Adjust according to actual frame size
                frameHeight: 44,
                spacing: 0
            });

        }

        function create(this: Phaser.Scene) {

            this.anims.create({
                key: "chasing_ufo_fly",
                frames: this.anims.generateFrameNumbers("chasing_ufo", {start: 0, end: 2}), // Adjust based on sheet
                frameRate: 10,
                repeat: -1
            });


            console.log("✅ Creating scene...");
            background = this.add.tileSprite(400, 300, 800, 600, "background").setScrollFactor(0);

            // 🎮 Initialize keyboard controls
            cursors = this.input.keyboard.createCursorKeys();

            // 🚀 Create & Animate Rocket
            this.anims.create({
                key: "fly",
                frames: this.anims.generateFrameNumbers("rocket", {start: 0, end: 3}), // Adjust frame range
                frameRate: 10,
                repeat: -1
            });

            rocket = this.physics.add.sprite(400, 500, "rocket").setScale(2);
            rocket.setOrigin(0.5, 1); // Anchor to bottom-center
            rocket.play("fly");
            rocket.setCollideWorldBounds(true);

            this.cameras.main.startFollow(rocket, true, 0.05, 0.05); // 🚀 Smooth camera follow
            this.cameras.main.setLerp(0.1, 0.1); // Adjust for smoothness

            this.physics.world.setBounds(0, 0, 1600, 2000); // Adjust world size
            this.cameras.main.setBounds(0, 0, 1600, 2000);


            stars = this.physics.add.group();

            // 🌟 Generate first batch of stars
            generateStars(this, stars);

            bullets = this.physics.add.group();

            stars.children.iterate((child) => {
                const star = child as Phaser.Physics.Arcade.Sprite;
                star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                star.setVelocityX(Phaser.Math.Between(-50, 50));
                return true;
            });

            cows = this.physics.add.group();

            // ✅ Spawn random cows every 7 seconds
            this.time.addEvent({
                delay: 7000,
                loop: true,
                callback: () => spawnRandomCows(this, cows)
            });

            console.log("🐄 Space cows will now spawn!");

            // ✨ Star Collection Event
            this.physics.add.overlap(rocket, stars, collectStar, undefined, this);

            // 🛸 UFOs Group
            ufos = this.physics.add.group(); // UFOs need to be properly initialized


            // spawnChasingUFO(this, ufos, rocket)
            this.time.addEvent({
                delay: 10000,
                loop: true,
                callback: () => spawnChasingUFO(this, ufos, rocket)
            });

            // Spawn aggressive UFOs every 15 seconds
            this.time.addEvent({
                delay: 15000,
                loop: true,
                callback: () => spawnAggressiveUFO(this, ufos, rocket, bullets)
            });

            // 🛸 UFO Click Interaction (Fixing Reference Issue)
            this.input.on("gameobjectdown", (pointer, gameObject) => {
                if (gameObject.texture.key === "ufo") {
                    alert("👽 Greetings! Check out my projects!");
                }
            });

            // 🏆 Score Display
            scoreText = this.add.text(16, 16, "Stars Collected: 0", {
                fontSize: "20px",
                color: "#fff"
            });

            // ⭐ Collect Stars Function
            function collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
                star.destroy();
                score += 10;
                scoreText.setText(`Stars Collected: ${score}`);
            }
        }

        let lastStarSpawnTime = 0;

        function update(this: Phaser.Scene) {
            if (!rocket || !cursors) return;

            // 🚀 Stop the rocket by default
            rocket.setVelocity(0);

            // 🎮 Movement controls
            if (cursors.left.isDown) {
                rocket.setVelocityX(-200);
            } else if (cursors.right.isDown) {
                rocket.setVelocityX(200);
            }

            if (cursors.up.isDown) {
                rocket.setVelocityY(-200);
                this.cameras.main.scrollY -= 4; // 🚀 Move the camera upward
                background.tilePositionY -= 2;  // 🎑 Scroll the background downwards
            } else if (cursors.down.isDown) {
                rocket.setVelocityY(200);
                this.cameras.main.scrollY += 2; // Move camera downward slightly
                background.tilePositionY += 1;  // Background moves slowly down
            }

            // // 🌟 Count only stars that are inside the visible screen
            // const numberVisibleStars = stars.getChildren().filter((star) => {
            //     return (star as Phaser.GameObjects.Sprite).y > this.cameras.main.scrollY &&
            //         (star as Phaser.GameObjects.Sprite).y < this.cameras.main.scrollY + 400;
            // }).length;
            //
            // // 🌟 If there are fewer than 5 stars in the visible area, spawn more
            // if (numberVisibleStars < 5 && Phaser.Math.Between(0, 100) > 98) {
            //     const star = stars.create(
            //         Phaser.Math.Between(50, 750),
            //         this.cameras.main.scrollY - 50, // Spawn slightly above the visible area
            //         "star"
            //     );
            //     star.setVelocityY(50); // Moves downward to simulate space travel
            // }

            // ⭐ Check if there are visible stars
            let visibleStars = stars.getChildren().some((star) => (star as Phaser.Physics.Arcade.Sprite).y > this.cameras.main.scrollY);

            // 🚀 Prevent spawning too often - Only spawn if at least 3 seconds have passed
            if (!visibleStars && this.time.now > lastStarSpawnTime + 3000) {
                console.log("✨ No stars visible! Generating new stars...");
                generateStars(this, stars);
                lastStarSpawnTime = this.time.now; // Update the last spawn time
            }

            // 🛸 Spawn UFOs randomly in space
            // if (Phaser.Math.Between(0, 200) > 198) {
            //     spawnRandomUFO(this, ufos);
            // }

            stars.getChildren().forEach((star) => {
                const sprite = star as Phaser.Physics.Arcade.Sprite;

                if (sprite.y > this.cameras.main.scrollY + 700) {
                    sprite.destroy();
                }
            });

            ufos.getChildren().forEach((ufo) => {
                const sprite = ufo as Phaser.Physics.Arcade.Sprite;

                if (sprite.y > this.cameras.main.scrollY + 700) {
                    sprite.destroy();
                }
            });

            cows.getChildren().forEach((cow) => {
                const sprite = cow as Phaser.Physics.Arcade.Sprite;

                if (sprite.y > this.cameras.main.scrollY + 700) {
                    sprite.destroy();
                }
            });

            bullets.getChildren().forEach((bullet) => {
                const sprite = bullet as Phaser.Physics.Arcade.Sprite;

                if (sprite.y > this.cameras.main.scrollY + 700) {
                    sprite.destroy();
                }
            });

            background.tilePositionY += rocket.body.velocity.y * 0.02;
            background.tilePositionX += rocket.body.velocity.x * 0.02;
        }

        return () => game.destroy(true);
    }, []);

    return <div ref={gameContainer}/>;
};

export default Game;
