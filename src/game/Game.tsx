import * as Phaser from "phaser";
import { useEffect, useRef } from "react";
import MainScene from "../scenes/MainScene";

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
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: [MainScene]
        };

        const game = new Phaser.Game(config);

        return () => game.destroy(true);
    }, []);

    return <div ref={gameContainer} />;
};

export default Game;
