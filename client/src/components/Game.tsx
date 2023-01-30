import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine from "../engine/TDEngine";
import Tower from "../towers/Tower";
import Enemy from "../enemies/Enemy";

export interface GameProps extends PropsWithChildren {
    engine: TDEngine,
    lives?: number,
    score?: number,
    money?: number,
}

const Game: React.FC<GameProps> = ({engine}) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const towerOneImage = useRef<HTMLImageElement>(null)
    const towerTwoImage = useRef<HTMLImageElement>(null)
    const [lives, setLives] = useState<GameProps["lives"]>(10)
    const [score, setScore] = useState<GameProps["score"]>(0)
    const [money, setMoney] = useState<GameProps["money"]>(100)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {
        if(engine.lives > 0) {
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
                engine.projectiles?.forEach((projectile) => {
                    projectile.move()
                })
            }

            // request animation frame
            engine.animationFrameId = requestAnimationFrame(gameLoop)
        } else {
            // GAME IS OVER!
            setIsGameOver(true)
            // cancel browser idle callback fn
            cancelIdleCallback(engine.requestIdleCallback)
        }
    }

    const gameLoopLogic = () => {
        // update game results
        setScore(engine.score)
        setLives(engine.lives)
        setMoney(engine.money)

        // search n destroy
        engine.towers?.forEach((tower => {
            tower.findTarget()
            if (tower.target) {
                // debug
                console.log(`target is in range && target locked`)
                tower.findTargetVector()
                tower.fire()
            }
        }))

        // request callback when browser is idling
        engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {timeout: engine.idleTimeout})
    }

    useEffect(() => {
        const context = canvas.current?.getContext('2d')
        // bind 2d canvas render context to the engine HoC
        engine.setContext(context!)

        // fill towers array
        engine.towers = [
            new Tower(engine, {x: 120, y: 80}, towerOneImage.current),
            new Tower(engine, {x: 360, y: 220}, towerOneImage.current),
            new Tower(engine, {x: 340, y: 60}, towerTwoImage.current)
        ]

        // fill enemies array
        const enemiesArray = [
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
            new Enemy(engine),
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
                <canvas
                    ref={canvas!}
                    id="canvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{border: "2px solid green"}}
                ></canvas>
            </div>
            <div className="b-towers-sprite" style={{display: 'none'}}>
                <img
                    id="towerOneImage"
                    alt="towerOneImage sprite"
                    src="towerOne.svg"
                    width="20"
                    height="20"
                    ref={towerOneImage}
                />
                <img
                    id="towerTwoImage"
                    alt="towerTwo Image sprite"
                    src="towerTwo.svg"
                    width="20"
                    height="20"
                    ref={towerTwoImage}
                />
            </div>
            {isGameOver && (
                <h1>GAME IS OVER!</h1>
            )}
            <div>
                <p>
                    <span>{`Lives left: ${lives}`}</span>&nbsp;
                    <span>{`Killed enemies: ${score}`}</span>&nbsp;
                    <span>{`Money: $${money}`}</span>
                </p>
            </div>
            <div>
                <button onClick={() => setIsGameStarted(true)}>Start teh game</button>
                <button onClick={() => setIsGameStarted(false)}>End teh game</button>
            </div>
        </section>
    )
}

export default Game;