import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine from "../engine/TDEngine";
import Tower from "../towers/Tower";
import Enemy from "../enemies/Enemy";

export interface GameProps extends PropsWithChildren {
    engine: TDEngine,
    lives?: number,
    score?: number,
    money?: number,
    isBuildMode?: boolean,
}

const Game: React.FC<GameProps> = ({engine}) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    // tower sprite img
    const towerOneImage = useRef<HTMLImageElement>(null)
    const towerTwoImage = useRef<HTMLImageElement>(null)
    // enemy sprite img
    const enemyOneImage = useRef<HTMLImageElement>(null)
    // projectile sprite img
    const projectileOneImage = useRef<HTMLImageElement>(null)
    // game status params
    const [lives, setLives] = useState<GameProps["lives"]>(10)
    const [score, setScore] = useState<GameProps["score"]>(0)
    const [money, setMoney] = useState<GameProps["money"]>(100)
    const [isBuildMode, setIsBuildMode] = useState<GameProps["isBuildMode"]>(false)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {
        if (engine.lives > 0) {
            engine.clearCanvas()

            // draw level map
            engine.map?.drawMap(engine.context!)

            // draw towers
            engine.towers?.forEach((tower, index) => {
                tower.drawTower()
            })

            // build mode
            if (engine.isCanBuild) {
                if(engine.draftTower) {
                    engine.draftTower.draftBuildTower()
                }
            }

            if (isGameStarted) {
                engine.isGameStarted = true
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
            } else {
                engine.isGameStarted = false
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
                tower.findTargetVector()
                tower.fire()
            }
        }))

        // destroy projectiles without target
        if (engine.projectiles) {
            engine.projectiles?.forEach((projectile) => {
                if (projectile.tower.target === null) {
                    engine.projectiles.filter(proj => projectile !== proj)
                }
            })
        }

        // request callback when browser is idling
        engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {timeout: engine.idleTimeout})
    }

    useEffect(() => {
        const context = canvas.current?.getContext('2d')
        // bind 2d canvas render context to the engine HoC
        engine.setContext(context!)

        /* BUILD MODE */

        // add canvas mousemove event listener
        canvas.current.addEventListener('mousemove', (e: MouseEvent) => {
            engine.draftShowTower({x: e.pageX, y: e.pageY})
        })

        canvas.current.addEventListener('click', (e: MouseEvent) => {
            engine.draftBuildTower({x: e.pageX, y: e.pageY})
        })

        // add canvas mouse click event listener

        /*
        canvas.current.addEventListener('click', (e: MouseEvent) => {
            if(isBuildMode) {
                // debug
                console.log(`CLICK! mouseXY: ${e.pageX}:${e.pageY}`)
                //
                engine.towers = [
                    ...engine.towers,
                    new Tower(engine, towerOneImage.current, projectileOneImage.current, {x: e.pageX, y: e.pageY}),
                ]
            } else {
                engine.isCanBuild = false
            }
        })



        /* /BUILD MODE */

        // fill towers array
        //engine.towers = [
        //    new Tower(engine, towerOneImage.current, projectileOneImage.current, {x: 140, y: 200} ),
        //new Tower(engine, towerOneImage.current, {x: 360, y: 220}),
        //new Tower(engine, towerTwoImage.current, {x: 340, y: 60}),
        //]

        // fill enemies array
        const enemiesArray = [
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
            new Enemy(engine, enemyOneImage.current),
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
        }

    }, [isGameStarted, isBuildMode])


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
                    ref={towerOneImage}
                />
                <img
                    id="towerTwoImage"
                    alt="towerTwo Image sprite"
                    src="towerTwo.svg"
                    ref={towerTwoImage}
                />
            </div>
            <div className="b-enemies-sprite" style={{display: 'none'}}>
                <img
                    id="enemyOneImage"
                    alt="enemyOneImage sprite"
                    src="enemyOne.svg"
                    ref={enemyOneImage}
                />
            </div>
            <div className="b-projectiles-sprite" style={{display: 'none'}}>
                <img
                    id="projectileOneImage"
                    alt="projectileOneImage sprite"
                    src="projectileOne.svg"
                    ref={projectileOneImage}
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
                <button onClick={() => {
                    //setIsBuildMode(true)
                    engine.isCanBuild = true
                    engine.draftTower = new Tower(engine, towerOneImage.current, projectileOneImage.current, {x: 0, y: 0})
                }}>Build 1 level tower
                </button>
                <button onClick={() => {
                    //setIsBuildMode(true)
                    engine.isCanBuild = true
                    engine.draftTower = new Tower(engine, towerTwoImage.current, projectileOneImage.current, {x: 0, y: 0})
                }}>Build 2 level tower
                </button>
                <button onClick={() => setIsBuildMode(false)}>Build mode OFF</button>
            </div>
        </section>
    )
}

export default Game;