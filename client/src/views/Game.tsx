import React, {useEffect, useRef, useState} from 'react';
import drawMap, {getMapParams} from '../maps/Level1'
import Enemy from "../enemies/Enemy";

const gameParams = {
    tickTimeout: 100,
}

const Game = () => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)
    const [tick, setTick] = useState(0)
    const mapParams = getMapParams()


    useEffect(() => {
        const context = canvas.current?.getContext('2d')
        if (context) {
            // draw level map
            drawMap(context)

            const enemyArr = [
                new Enemy(context),
                new Enemy(context),
                new Enemy(context),
                new Enemy(context),
                new Enemy(context),
            ]
            // game start
            if (isGameStarted) {
                // draw enemies
                enemyArr.forEach((enemy, index) => {
                    enemy.drawEnemy({x: -enemy.enemyParams.spaceBetweenEnemies * enemyArr.length + (index * enemy.enemyParams.spaceBetweenEnemies), y: 0})
                    enemy.move()
                })
            }
        }

    }, [isGameStarted])

    return (
        <section>
            <div>
                <canvas ref={canvas!} id="canvas" width={mapParams.width} height={mapParams.height}
                        style={{border: "2px solid green"}}></canvas>
            </div>
            <div>
                <button onClick={() => setIsGameStarted(true)}>Start teh game</button>
                <button onClick={() => setIsGameStarted(false)}>End teh game</button>
            </div>
        </section>
    )
}

export default Game;