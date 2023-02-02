import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine from "../engine/TDEngine";
import Tower from "../towers/Tower";
import Enemy from "../enemies/Enemy";

export interface GameProps extends PropsWithChildren {
    engine: TDEngine,
    lives?: number,
    score?: number,
    money?: number,
    isEnoughMoney?: boolean,
}

const Game: React.FC<GameProps> = ({engine}) => {
    // canvas ref
    const canvas = useRef<HTMLCanvasElement>(null)
    // game window ref
    const gameWindow = useRef<HTMLDivElement>(null)
    // tower sprite img
    const towerOneImage = useRef<HTMLImageElement>(null)
    const towerTwoImage = useRef<HTMLImageElement>(null)
    const towerThreeImage = useRef<HTMLImageElement>(null)
    // enemy sprite img
    const enemyOneImage = useRef<HTMLImageElement>(null)
    // projectile sprite img
    const projectileOneImage = useRef<HTMLImageElement>(null)
    const projectileTwoImage = useRef<HTMLImageElement>(null)
    const projectileThreeImage = useRef<HTMLImageElement>(null)
    // projectile hit img
    const projectileHitOneImage = useRef<HTMLImageElement>(null)
    const projectileHitTwoImage = useRef<HTMLImageElement>(null)
    const projectileHitThreeImage = useRef<HTMLImageElement>(null)
    // game status params
    const [lives, setLives] = useState<GameProps["lives"]>(10)
    const [score, setScore] = useState<GameProps["score"]>(0)
    const [money, setMoney] = useState<GameProps["money"]>(100)
    const [isEnoughMoney, setIsEnoughMoney] = useState<GameProps["isEnoughMoney"]>(false)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {
        if (engine.lives > 0) {
            engine.clearCanvas()
            // draw map grid
            engine.map.drawGrid()

            // draw level map
            engine.map?.drawMap()

            // draw towers
            engine.towers?.forEach((tower, index) => {
                tower.drawTower()
            })

            // build mode
            if (engine.isCanBuild) {
                if (engine.draftTower) {
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
        // add canvas mouse click event listener
        canvas.current.addEventListener('click', (e: MouseEvent) => {
            engine.draftBuildTower({x: e.pageX, y: e.pageY})
        })
        // add escape hotkey to cancel building mode
        gameWindow.current.addEventListener('keydown', (e:KeyboardEvent) => {
            // debug
            console.log(e)
            console.log(`e`)
            //
            engine.manageHotkeys(e)
        })
        /* /BUILD MODE */

        /* LOAD SPRITES */
        // tower sprites
        engine.towerSprites = {
            levelOne: towerOneImage.current,
            levelTwo: towerTwoImage.current,
            levelThree: towerThreeImage.current
        }
        // projectile sprites
        engine.projectileSprites = {
            levelOne: projectileOneImage.current,
            levelTwo: projectileTwoImage.current,
            levelThree: projectileThreeImage.current
        }
        // projectile hit sprites
        engine.projectileHitSprites = {
            levelOne: projectileHitOneImage.current,
            levelTwo: projectileTwoImage.current,
            levelThree: projectileThreeImage.current
        }
        /* /LOAD SPRITES */

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
            new Enemy(engine, enemyOneImage.current),
        ]
        engine.setEnemies(enemiesArray)

        // draw level map
        engine.map?.drawMap()

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

    }, [isGameStarted])


    return (
        <section ref={gameWindow}>
            <div>
                <canvas
                    ref={canvas!}
                    id="canvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{border: "2px solid green"}}
                    tabIndex={1}
                ></canvas>
            </div>
            <div className="b-tower-sprite" style={{display: 'none'}}>
                <img
                    id="towerOneImage"
                    alt="towerOneImage sprite"
                    src="towerOne.svg"
                    ref={towerOneImage}
                />
                <img
                    id="towerTwoImage"
                    alt="towerTwoImage sprite"
                    src="towerTwo.svg"
                    ref={towerTwoImage}
                />
                <img
                    id="towerThreeImage"
                    alt="towerThreeImage sprite"
                    src="towerThree.svg"
                    ref={towerThreeImage}
                />
            </div>
            <div className="b-enemy-sprite" style={{display: 'none'}}>
                <img
                    id="enemyOneImage"
                    alt="enemyOneImage sprite"
                    src="enemyOne.svg"
                    ref={enemyOneImage}
                />
            </div>
            <div className="b-projectile-sprite" style={{display: 'none'}}>
                <img
                    id="projectileOneImage"
                    alt="projectileOneImage sprite"
                    src="projectileOne.svg"
                    ref={projectileOneImage}
                />
                <img
                    id="projectileTwoImage"
                    alt="projectileTwoImage sprite"
                    src="projectileTwo.svg"
                    ref={projectileTwoImage}
                />
                <img
                    id="projectileThreeImage"
                    alt="projectileThreeImage sprite"
                    src="projectileThree.svg"
                    ref={projectileThreeImage}
                />
            </div>
            <div className="b-projectile-hit-sprite" style={{display: 'none'}}>
                <img
                    id="projectileHitOneImage"
                    alt="projectileHitOneImage sprite"
                    src="projectileHitOne.svg"
                    ref={projectileHitOneImage}
                />
                <img
                    id="projectileHitTwoImage"
                    alt="projectileHitTwoImage sprite"
                    src="projectileHitTwo.svg"
                    ref={projectileHitTwoImage}
                />
                <img
                    id="projectileHitThreeImage"
                    alt="projectileHitThreeImage sprite"
                    src="projectileHitThree.svg"
                    ref={projectileHitThreeImage}
                />
            </div>
            {isGameOver && (
                <h1>GAME IS OVER!</h1>
            )}
            <div>
                <p>
                    <span>{`Lives left: ${lives}`}</span>&nbsp;
                    <span>{`Killed enemies: ${score}`}</span>&nbsp;
                    <span style={{color: `${isEnoughMoney ? 'red' : ''}`}}>{`Money: $${money}`}</span>
                </p>
            </div>
            <hr/>
            <div>
                <button onClick={() => setIsGameStarted(true)}>Start teh game</button>
                <button onClick={() => setIsGameStarted(false)}>End teh game</button>
            </div>
            <div>
                <button onClick={() => {
                    if (money >= engine.towerOneParam.towerParams.price) {
                        setIsEnoughMoney(false)
                        engine.isCanBuild = true
                        engine.draftTower = new Tower(
                            engine,
                            engine.towerSprites.levelOne,
                            engine.projectileSprites.levelOne,
                            engine.projectileHitSprites.levelOne,
                            engine.cursorPosition,
                            engine.towerOneParam.towerParams,
                            engine.towerOneParam.projectileParams
                        )
                    } else {
                        setIsEnoughMoney(true)
                    }
                }}>Build 1 level tower(${engine.towerOneParam.towerParams.price})
                </button>
                <button onClick={() => {
                    if (money >= engine.towerTwoParam.towerParams.price) {
                        setIsEnoughMoney(false)
                        engine.isCanBuild = true
                        engine.draftTower = new Tower(
                            engine,
                            engine.towerSprites.levelTwo,
                            engine.projectileSprites.levelTwo,
                            engine.projectileHitSprites.levelTwo,
                            engine.cursorPosition,
                            engine.towerTwoParam.towerParams,
                            engine.towerTwoParam.projectileParams,
                        )
                    } else {
                        setIsEnoughMoney(true)
                    }
                }}>Build 2 level tower(${engine.towerTwoParam.towerParams.price})
                </button>
                <button onClick={() => {
                    if (money >= engine.towerThreeParam.towerParams.price) {
                        setIsEnoughMoney(false)
                        engine.isCanBuild = true
                        engine.draftTower = new Tower(
                            engine,
                            engine.towerSprites.levelThree,
                            engine.projectileSprites.levelThree,
                            engine.projectileHitSprites.levelThree,
                            engine.cursorPosition,
                            engine.towerThreeParam.towerParams,
                            engine.towerThreeParam.projectileParams,
                        )
                    } else {
                        setIsEnoughMoney(true)
                    }
                }}>Build 3 level tower(${engine.towerThreeParam.towerParams.price})
                </button>
            </div>
        </section>
    )
}

export default Game;