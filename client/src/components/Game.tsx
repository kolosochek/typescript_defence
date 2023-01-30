import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine from "../engine/TDEngine";
import Tower from "../towers/Tower";
import Enemy from "../enemies/Enemy";
import projectile from "../projectiles/Projectile";

export interface GameProps extends PropsWithChildren {
    engine: TDEngine
}

const Game: React.FC<GameProps> = ({engine}) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {

        // clear canvas
        engine.context?.clearRect(0, 0, engine.map?.mapParams.width!, engine.map?.mapParams.height!)

        // draw level map
        engine.map?.drawMap(engine.context!)
        // draw towers
        engine.towers?.forEach((tower, index) => {
            tower.drawTower()
        })

        // draw enemies
        engine.enemies?.forEach((enemy, index) => {
            enemy.move()
        })

        // draw projectiles
        if (engine.projectiles) {
            // debug
            console.log('projectile gotcha!')
            engine.projectiles?.forEach((projectile) => {
                projectile.move()
            })
        }

        engine.animationFrameId = requestAnimationFrame(gameLoop)
    }

    const gameLoopLogic = () => {
        engine.towers?.forEach((tower => {
            tower.findTarget()
            if(tower.target){
                // debug
                console.log(`target is in range && target locked`)
                tower.findTargetVector()
                tower.fire()
            }
        }))

        engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {timeout: engine.idleTimeout})
    }

    useEffect(() => {
        const context = canvas.current?.getContext('2d')
        // bind context to the engine
        engine.setContext(context!)

        // fill enemies array
        const enemiesArray = [
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
        ]
        engine.setEnemies(enemiesArray)

        // draw level map
        engine.map?.drawMap(engine.context!)

        // draw enemies
        engine.enemies?.forEach((enemy, index) => {
            enemy.drawEnemy({
                x: -enemy.enemyParams.spaceBetweenEnemies * engine.enemies?.length! + (index * enemy.enemyParams.spaceBetweenEnemies),
                y: 0
            })
        })

        // game start
        if (isGameStarted) {
            engine.animationFrameId = requestAnimationFrame(gameLoop)
            engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {timeout: engine.idleTimeout})
            setTimeout(() => {
                engine.enemies = [...engine.enemies,
                    new Enemy(engine, {x: 0, y: 50}),
                    new Enemy(engine, {x: -14, y: 52})]
            }, 3000)
            setTimeout(() => {
                engine.enemies = [...engine.enemies,
                    new Enemy(engine, {x: 0, y: 50}),]
            }, 5000)
        }

    }, [isGameStarted])


    return (
        <section>
            <div>
                <canvas ref={canvas!} id="canvas" width={engine.map?.mapParams.width}
                        height={engine.map?.mapParams.height}
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