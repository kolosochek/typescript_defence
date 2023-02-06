import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import TDEngine, {TDEngineI, WaveGeneratorI} from "../engine/TDEngine";

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
    const enemyFastImage = useRef<HTMLImageElement>(null)
    const enemySlowImage = useRef<HTMLImageElement>(null)
    const enemyBossImage = useRef<HTMLImageElement>(null)
    // projectile sprite img
    const projectileOneImage = useRef<HTMLImageElement>(null)
    const projectileTwoImage = useRef<HTMLImageElement>(null)
    const projectileThreeImage = useRef<HTMLImageElement>(null)
    // projectile hit img
    const projectileHitOneImage = useRef<HTMLImageElement>(null)
    const projectileHitTwoImage = useRef<HTMLImageElement>(null)
    const projectileHitThreeImage = useRef<HTMLImageElement>(null)
    // game status params
    const [lives, setLives] = useState<GameProps["lives"]>(engine.initialGameParams.lives)
    const [score, setScore] = useState<GameProps["score"]>(engine.score)
    const [money, setMoney] = useState<GameProps["money"]>(engine.initialGameParams.money)
    const [wave, setWave] = useState<GameProps["wave"]>(engine.waveGenerator.waveParams.currentWave)
    const [countdown, setCountdown] = useState(engine.waveGenerator.waveCountdown)
    const [enemiesLeft, setEnemiesLeft] = useState<GameProps["wave"]>(engine.enemies.length)
    const [isNotEnoughMoney, setIsNotEnoughMoney] = useState<TDEngineI["isNotEnoughMoney"]>(engine.isNotEnoughMoney)
    const [isGameOver, setIsGameOver] = useState<boolean>(false)
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false)


    const gameLoop = () => {
        if (engine.isGameStarted) {
            if (engine.lives > 0) {
                engine.clearCanvas()

                // draw level map
                engine.map?.drawMap()

                // draw map grid
                if (engine.isShowGrid) {
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
            //setCountdown(engine.waveGenerator.waveCountdown)
            setLives(engine.lives)
            setMoney(engine.money)
            setWave(engine.waveGenerator.waveParams.currentWave)
            setEnemiesLeft(engine.enemies.length)
            setIsNotEnoughMoney(engine.isNotEnoughMoney)
            if(engine.lives){
                if (!isGameOver){
                    setIsGameOver(false)
                }
            } else {
                setIsGameOver(true)
            }


            // enemy init || move
            if (!engine.waveGenerator.isInitialized) {
                if (!engine.waveGenerator.waveTimerBetweenWaves) {
                    // UI countdown between waves
                    engine.waveGenerator.countdown()
                    setTimeout(() => {
                        engine.waveGenerator.init()
                    }, engine.waveGenerator.waveTimeoutBetweenWaves)
                }

            }

            // isWaveInProgress?
            if (engine.lives > 0 && engine.enemies.length === 0 && engine.waveGenerator.waveParams.isWaveInProgress) {
                engine.waveGenerator.waveParams.isWaveInProgress = false;
                engine.clearMemory()
                if (!engine.waveGenerator.waveTimerBetweenWaves) {
                    // UI countdown between waves
                    engine.waveGenerator.countdown()
                    setTimeout(() => {
                        engine.waveGenerator.spawnEnemies()
                    }, engine.waveGenerator.waveTimeoutBetweenWaves)
                }
            }

            // search n destroy
            engine.towers?.forEach((tower => {
                if (tower.target) {
                    if(tower.isEnemyInRange(tower.target)){
                        tower.findTargetVector()
                        tower.fire()
                    } else {
                        tower.findTarget()
                    }
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
                fast: enemyFastImage.current,
                slow: enemySlowImage.current,
                boss: enemyBossImage.current,
            }
        }
        /* /LOAD SPRITES */

        if (!engine.waveGenerator.isInitialized){
            // init level map draw
            engine.map?.drawMap()
        }

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
                <img
                    id="enemyFastImage"
                    alt="enemyFastImage sprite"
                    src="enemyFast.png"
                    ref={enemyFastImage}
                />
                <img
                    id="enemySlowImage"
                    alt="enemySlowImage sprite"
                    src="enemySlow.png"
                    ref={enemySlowImage}
                />
                <img
                    id="enemyBossImage"
                    alt="enemyBossImage sprite"
                    src="enemyBoss.png"
                    ref={enemyBossImage}
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
                    <span style={{color: `${isNotEnoughMoney ? 'red' : ''}`}}>{`Money: $${money}`}</span>&nbsp;
                </p>
                {/* <p>{Boolean(countdown) && <span>{`Next wave in: ${countdown} seconds`}</span>}</p> */}
            </div>
            <hr/>
            <div>
                <button onClick={() => {
                    engine.isGameStarted = true;
                    setIsGameStarted(true)
                }}>Start
                </button>
                <button onClick={() => {
                    engine.isGameStarted = false;
                    setIsGameStarted(false)
                }}>Pause
                </button>
                <button onClick={() => {
                    engine.restartGame()
                    engine.isGameStarted = true;
                    setIsGameStarted(true)
                }}>Restart
                </button>
            </div>
            <div>
                <button onClick={() => {
                    engine.buildFirstTower()
                }}>Build 1 level tower(${engine.towerOneParam.towerParams.price})
                </button>
                <button onClick={() => {
                    engine.buildSecondTower()
                }}>Build 2 level tower(${engine.towerTwoParam.towerParams.price})
                </button>
                <button onClick={() => {
                    engine.buildThirdTower()
                }}>Build 3 level tower(${engine.towerThreeParam.towerParams.price})
                </button>
            </div>
        </section>
    )
}

export default Game;