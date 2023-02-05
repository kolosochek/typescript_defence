import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine, {WaveGeneratorI} from "../engine/TDEngine";
import Tower from "../towers/Tower";

export interface GameProps extends PropsWithChildren {
    engine: TDEngine,
    lives?: number,
    score?: number,
    money?: number,
    wave?: WaveGeneratorI["waveParams"]["currentWave"],
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
    const [lives, setLives] = useState<GameProps["lives"]>(engine.lives)
    const [score, setScore] = useState<GameProps["score"]>(engine.score)
    const [money, setMoney] = useState<GameProps["money"]>(engine.money)
    const [wave, setWave] = useState<GameProps["wave"]>(engine.waveGenerator.waveParams.currentWave)
    const [enemiesLeft, setEnemiesLeft] = useState<GameProps["wave"]>(engine.enemies.length)
    const [isEnoughMoney, setIsEnoughMoney] = useState<GameProps["isEnoughMoney"]>(false)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {
        // draw level map
        engine.map?.drawMap()

        if (engine.isGameStarted) {

            if (engine.lives > 0) {
                engine.clearCanvas()

                // draw map grid
                if(engine.isShowGrid){
                    engine.map.drawGrid()
                }

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

                // debug
                //engine.highlightTile(engine.map.mapParams.closestTile)
                //

            } else {
                // GAME IS OVER!
                setIsGameOver(true)
            }

            // request animation frame
            engine.animationFrameId = requestAnimationFrame(gameLoop)
        } else {
            // cancel browser idle callback fn
            cancelAnimationFrame(engine.animationFrameId)
        }
    }

    const gameLoopLogic = () => {
        if (engine.isGameStarted) {
            // update game results
            setScore(engine.score)
            setLives(engine.lives)
            setMoney(engine.money)
            setWave(engine.waveGenerator.waveParams.currentWave)
            setEnemiesLeft(engine.enemies.length)

            // enemy init || move
            if(!engine.waveGenerator.isInitialized){
                engine.waveGenerator.init()
            }

            // isWaveInProgress?
            if(engine.lives > 0 && engine.enemies.length === 0 && engine.waveGenerator.waveParams.isWaveInProgress) {
                engine.waveGenerator.waveParams.isWaveInProgress = false;
                engine.clearMemory()
                if (!engine.waveGenerator.waveTimerBetweenWaves) {
                    setTimeout(() => {
                        engine.waveGenerator.spawnEnemies()
                    }, engine.waveGenerator.waveTimeoutBetweenWaves)
                }
            }

            // search n destroy
            engine.towers?.forEach((tower => {
                if (tower.target) {
                    tower.findTargetVector()
                    tower.fire()
                } else {
                    tower.findTarget()
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
        } else {
            cancelIdleCallback(engine.requestIdleCallback)
        }
    }

    useEffect(() => {
        if (!engine.context) {
            engine.setContext(canvas.current?.getContext('2d'))
        }

        /* BUILD MODE */
        // add canvas mousemove event listener
        canvas.current.addEventListener('mousemove', engine.canvasMouseMoveCallback)
        // add canvas mouse click event listener
        canvas.current.addEventListener('click', engine.canvasClickCallback)
        // add escape hotkey to cancel building mode
        gameWindow.current.addEventListener('keydown', engine.gameWindowKeydown)
        /* /BUILD MODE */

        /* LOAD SPRITES */
        if (!Object.keys(engine.towerSprites).length) {
            // tower sprites
            engine.towerSprites = {
                levelOne: towerOneImage.current,
                levelTwo: towerTwoImage.current,
                levelThree: towerThreeImage.current
            }
        }

        if (!Object.keys(engine.projectileSprites).length) {
            // projectile sprites
            engine.projectileSprites = {
                levelOne: projectileOneImage.current,
                levelTwo: projectileTwoImage.current,
                levelThree: projectileThreeImage.current
            }
        }

        if (!Object.keys(engine.projectileHitSprites).length) {
            // projectile hit sprites
            engine.projectileHitSprites = {
                levelOne: projectileHitOneImage.current,
                levelTwo: projectileTwoImage.current,
                levelThree: projectileThreeImage.current
            }
        }

        if (!Object.keys(engine.enemies).length) {
            // projectile hit sprites
            engine.enemySprites = {
                levelOne: enemyOneImage.current,
            }
        }
        /* /LOAD SPRITES */

        // draw level map
        engine.map?.drawMap()

        // game start
        if (engine.isGameStarted) {
            engine.animationFrameId = requestAnimationFrame(gameLoop)
            engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {timeout: engine.idleTimeout})
        } else {
            cancelAnimationFrame(engine.animationFrameId)
            cancelIdleCallback(engine.requestIdleCallback)
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
                    src="towerOne.png"
                    ref={towerOneImage}
                />
                <img
                    id="towerTwoImage"
                    alt="towerTwoImage sprite"
                    src="towerTwo.png"
                    ref={towerTwoImage}
                />
                <img
                    id="towerThreeImage"
                    alt="towerThreeImage sprite"
                    src="towerThree.png"
                    ref={towerThreeImage}
                />
            </div>
            <div className="b-enemy-sprite" style={{display: 'none'}}>
                <img
                    id="enemyOneImage"
                    alt="enemyOneImage sprite"
                    src="enemyOne.png"
                    ref={enemyOneImage}
                />
            </div>
            <div className="b-projectile-sprite" style={{display: 'none'}}>
                <img
                    id="projectileOneImage"
                    alt="projectileOneImage sprite"
                    src="projectileOne.png"
                    ref={projectileOneImage}
                />
                <img
                    id="projectileTwoImage"
                    alt="projectileTwoImage sprite"
                    src="projectileTwo.png"
                    ref={projectileTwoImage}
                />
                <img
                    id="projectileThreeImage"
                    alt="projectileThreeImage sprite"
                    src="projectileThree.png"
                    ref={projectileThreeImage}
                />
            </div>
            <div className="b-projectile-hit-sprite" style={{display: 'none'}}>
                <img
                    id="projectileHitOneImage"
                    alt="projectileHitOneImage sprite"
                    src="projectileHitOne.png"
                    ref={projectileHitOneImage}
                />
                <img
                    id="projectileHitTwoImage"
                    alt="projectileHitTwoImage sprite"
                    src="projectileHitTwo.png"
                    ref={projectileHitTwoImage}
                />
                <img
                    id="projectileHitThreeImage"
                    alt="projectileHitThreeImage sprite"
                    src="projectileHitThree.png"
                    ref={projectileHitThreeImage}
                />
            </div>
            {isGameOver && (
                <h1>GAME IS OVER!</h1>
            )}
            <div>
                <p>
                    <span>{`Enemies left: ${enemiesLeft}`}</span>&nbsp;
                    <span>{`Current wave: ${wave}`}</span>&nbsp;
                    <span>{`Lives left: ${lives}`}</span>&nbsp;
                    <span>{`Killed enemies: ${score}`}</span>&nbsp;
                    <span style={{color: `${isEnoughMoney ? 'red' : ''}`}}>{`Money: $${money}`}</span>
                </p>
            </div>
            <hr/>
            <div>
                <button onClick={() => {
                    engine.isGameStarted = true;
                    setIsGameStarted(true)
                }}>Start teh game
                </button>
                <button onClick={() => {
                    engine.isGameStarted = false;
                    setIsGameStarted(false)
                }}>End teh game
                </button>
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