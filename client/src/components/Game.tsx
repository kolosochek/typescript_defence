import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import TDEngine, {
    ITDEngine,
    IWaveGenerator,
    TEnemyName,
} from "../engine/TDEngine";
import Tower from "../towers/Tower";
import Enemy from "../enemies/Enemy";
import Map from "../maps/Map";
import Projectile from "../projectiles/Projectile";

// polyfill
if (!window.requestIdleCallback) {
    // @ts-ignore
    window.requestIdleCallback = function (
        callback: IdleRequestCallback,
        options: Record<string, string | number> = {},
    ): NodeJS.Timeout {
        let relaxation = 1;
        let timeout = options?.timeout || relaxation;
        let start = performance.now();
        return setTimeout(function () {
            callback({
                get didTimeout() {
                    return options.timeout
                        ? false
                        : performance.now() - start - relaxation > timeout;
                },
                timeRemaining: function () {
                    return Math.max(0, relaxation + (performance.now() - start));
                },
            });
        }, relaxation);
    };
}
if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function (id) {
        clearTimeout(id);
    };
}

export interface IGameProps extends PropsWithChildren {
    engine?: TDEngine;
    lives?: number;
    score?: number;
    money?: number;
    wave?: IWaveGenerator["waveParams"]["currentWave"];
    isEnoughMoney?: boolean;
}

export const Game: FC<IGameProps> = ({ engine = new TDEngine() }) => {
    // canvas ref
    const canvas = useRef<HTMLCanvasElement>(null);
    const projectileCanvas = useRef<HTMLCanvasElement>(null);
    const buildCanvas = useRef<HTMLCanvasElement>(null);
    const cannonCanvas = useRef<HTMLCanvasElement>(null);
    const towerCanvas = useRef<HTMLCanvasElement>(null);
    const mapCanvas = useRef<HTMLCanvasElement>(null);
    const enemyCanvas = useRef<HTMLCanvasElement>(null);
    const deadEnemyCanvas = useRef<HTMLCanvasElement>(null);
    // game window ref
    const gameWindow = useRef<HTMLDivElement>(null);
    // tower sprites ref
    // tower 1
    const towerOneBaseSprite = useRef<HTMLImageElement>(null);
    const towerOneImpact = useRef<HTMLImageElement>(null);
    const towerOneLevelOneWeapon = useRef<HTMLImageElement>(null);
    const towerOneLevelOneProjectile = useRef<HTMLImageElement>(null);
    const towerOneLevelTwoWeapon = useRef<HTMLImageElement>(null);
    const towerOneLevelTwoProjectile = useRef<HTMLImageElement>(null);
    const towerOneLevelThreeWeapon = useRef<HTMLImageElement>(null);
    const towerOneLevelThreeProjectile = useRef<HTMLImageElement>(null);
    // tower 2
    const towerTwoBaseSprite = useRef<HTMLImageElement>(null);
    // enemy sprites ref
    const firebugSprite = useRef<HTMLImageElement>(null);
    const leafbugSprite = useRef<HTMLImageElement>(null);
    const firelocustSprite = useRef<HTMLImageElement>(null);
    const firewaspSprite = useRef<HTMLImageElement>(null);

    // game status params
    const [lives, setLives] = useState<IGameProps["lives"]>(
        engine.initialGameParams.lives,
    );
    const [score, setScore] = useState<IGameProps["score"]>(engine.score);
    const [money, setMoney] = useState<IGameProps["money"]>(
        engine.initialGameParams.money,
    );
    const [wave, setWave] = useState<IGameProps["wave"]>(
        engine.waveGenerator?.waveParams.currentWave,
    );
    const [countdown, setCountdown] = useState(
        engine.waveGenerator?.waveCountdown,
    );
    const [enemiesLeft, setEnemiesLeft] = useState<IGameProps["wave"]>(
        engine.enemies?.length,
    );
    const [isNotEnoughMoney, setIsNotEnoughMoney] = useState<
        ITDEngine["isNotEnoughMoney"]
    >(engine.isNotEnoughMoney);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

    const gameLoop = () => {
        setTimeout(() => {
            if (engine.isGameStarted) {
                if (engine.lives > 0) {
                    engine.clearCanvas();

                    // draw level map
                    // engine.map?.drawMap();

                    // draw map grid
                    // if (engine.isShowGrid) {
                    //  engine.map?.drawGrid();
                    // }

                    // build mode
                    if (engine.isCanBuild) {
                        if (engine.draftTower) {
                            engine.draftTower.drawDraft();
                        }
                    }

                    // draw enemies
                    if (engine.enemies?.length) {
                        engine.enemies?.forEach((enemy: Enemy) => {
                            if (enemy.renderParams.isAnimateDeath) return;
                            if (
                                enemy.currentPosition.x +
                                enemy.enemyParams.width! +
                                enemy.randomOffset.x <
                                0
                            )
                                return;
                            enemy.draw(engine.enemyContext!, true);
                        });
                    }

                    // draw dead enemies
                    if (engine.deadEnemies?.length) {
                        engine.deadEnemies?.forEach((deadEnemy: Enemy) => {
                            deadEnemy.draw(engine.deadEnemyContext!, false);
                        });
                    }

                    // draw projectiles
                    if (engine.projectiles?.length) {
                        engine.projectiles?.forEach((projectile: Projectile) => {
                            projectile.draw();
                        });
                    }

                    // draw tower cannons
                    engine.towers?.forEach((tower: Tower) => {
                        tower.drawCannon(engine.cannonContext!);
                    });

                    // highlight the closest map tile to the cursor
                    // engine.highlightTile(engine.map!.mapParams.closestTile);
                    //
                } else {
                    // GAME IS OVER!
                }

                // request animation frame
                engine.animationFrameId = requestAnimationFrame(gameLoop);
            } else {
                // cancel browser idle callback fn
                cancelAnimationFrame(engine.animationFrameId);
            }
        }, 1000 / engine.initialGameParams.fps);
    };

    const gameLoopLogic = () => {
        if (engine.lives > 0) {
            if (engine.isGameStarted) {
                // update game results
                setScore(engine.score);
                setCountdown(engine.waveGenerator?.waveCountdown);
                setLives(engine.lives);
                setMoney(engine.money);
                setWave(engine.waveGenerator?.waveParams.currentWave);
                setEnemiesLeft(engine.enemies?.length);
                setIsNotEnoughMoney(engine.isNotEnoughMoney);
                if (isGameOver) {
                    setIsGameOver(false);
                }

                // enemy init || move
                if (!engine.waveGenerator?.isInitialized) {
                    if (!engine.waveGenerator?.waveTimerBetweenWaves) {
                        // UI countdown between waves
                        engine.waveGenerator?.countdown();
                        engine.waveGenerator!.waveTimerBetweenWaves = setTimeout(() => {
                            engine.waveGenerator?.init();
                        }, engine.waveGenerator?.waveTimeoutBetweenWaves);
                    }
                } else {
                    // isWaveInProgress?
                    if (
                        engine.enemies?.length === 0 &&
                        engine.waveGenerator?.waveParams.isWaveInProgress
                    ) {
                        engine.waveGenerator.waveParams.isWaveInProgress = false;
                        engine.waveGenerator!.waveCountdown! = Math.floor(
                            engine.waveGenerator!.waveTimeoutBetweenWaves / 1000,
                        );
                        if (!engine.waveGenerator.waveTimerBetweenWaves) {
                            // UI countdown between waves
                            engine.waveGenerator.waveCountdownTimer = setInterval(() => {
                                if (engine.waveGenerator!.waveCountdown > 0) {
                                    engine.waveGenerator!.waveCountdown -= 1;
                                } else {
                                    clearInterval(engine.waveGenerator?.waveCountdownTimer!);
                                    engine.waveGenerator!.isUICountdown = false;
                                }
                            }, 1000);
                            engine.waveGenerator!.waveTimerBetweenWaves = setTimeout(() => {
                                engine.clearMemory();
                                engine.waveGenerator?.spawnEnemies();
                            }, engine.waveGenerator.waveTimeoutBetweenWaves);
                        }
                    }
                }

                // search n destroy
                if (engine.enemies?.length) {
                    engine.towers?.forEach((tower: Tower) => {
                        if (tower.target) {
                            if (tower.isEnemyInRange(tower.target)) {
                                tower.findTargetAngle();
                                tower.fire();
                            } else {
                                tower.findTarget();
                            }
                        } else {
                            tower.findTarget();
                        }
                    });
                }

                // move enemies
                engine.enemies?.forEach((enemy: Enemy) => {
                    enemy.move();
                });

                // move projectiles
                if (engine.projectiles?.length) {
                    engine.projectiles?.forEach((projectile: Projectile) => {
                        projectile.move();
                    });
                }

                // request callback when browser is idling
                engine.requestIdleCallback = requestIdleCallback(gameLoopLogic, {
                    timeout: 1000 / engine.initialGameParams.fps,
                    // timeout: engine.idleTimeout,
                });
            } else {
                cancelIdleCallback(engine.requestIdleCallback);
            }
        } else {
            // game is over!
            engine.isGameStarted = false;
            setIsGameOver(true);
        }
    };

    useEffect(() => {
        if (!engine.context) {
            engine.setContext(canvas.current?.getContext("2d")!);
            engine.setBuildContext(buildCanvas.current?.getContext("2d")!);
            engine.setProjectileContext(projectileCanvas.current?.getContext("2d")!);
            engine.setCannonContext(cannonCanvas.current?.getContext("2d")!);
            engine.setTowerContext(towerCanvas.current?.getContext("2d")!);
            engine.setMapContext(mapCanvas.current?.getContext("2d")!);
            engine.setEnemyContext(enemyCanvas.current?.getContext("2d")!);
            engine.setDeadEnemyContext(deadEnemyCanvas.current?.getContext("2d")!);
        }

        if (!engine.map) {
            // set new map
            engine.map = new Map(engine);
        }

        /* BUILD MODE */
        // add canvas mousemove event listener
        buildCanvas.current?.addEventListener(
            "mousemove",
            engine.canvasMouseMoveCallback,
        );
        // add canvas mouse click event listener
        buildCanvas.current?.addEventListener("click", engine.canvasClickCallback);
        // add escape hotkey to cancel building mode
        gameWindow.current?.addEventListener("keydown", engine.gameWindowKeydown);
        /* /BUILD MODE */

        /* LOAD SPRITES */
        if (!Object.keys(engine.towerSprites).length) {
            // tower sprites
            engine.towerSprites = {
                one: {
                    spriteSource: {
                        base: towerOneBaseSprite.current!,
                        impact: towerOneImpact.current!,
                        levelOneWeapon: towerOneLevelOneWeapon.current!,
                        levelOneProjectile: towerOneLevelOneProjectile.current!,
                        levelTwoWeapon: towerOneLevelTwoWeapon.current!,
                        levelTwoProjectile: towerOneLevelTwoProjectile.current!,
                        levelThreeWeapon: towerOneLevelThreeWeapon.current!,
                        levelThreeProjectile: towerOneLevelThreeProjectile.current!,
                    },
                    canvasArr: null,
                    canvasContextArr: null,
                    framesPerSprite: 1,
                },
            };

            engine.splitTowerSprite("one");

            // debug
            console.log(`engine`);
            console.log(engine);
            //
        }

        if (!Object.keys(engine.enemySprites!).length) {
            // enemy sprites
            engine.enemySprites = {
                firebug: {
                    spriteSource: firebugSprite.current,
                    canvasArr: null,
                    canvasContextArr: null,
                    spriteEdgeOffset: 0,
                    spriteBetweenOffset: 0,
                    spriteRightRow: 5,
                    spriteLeftRow: 6,
                    spriteUpRow: 4,
                    spriteDownRow: 3,
                    framesPerSprite: 8,
                    deathFramesPerSprite: 11,
                },
                leafbug: {
                    spriteSource: leafbugSprite.current,
                    canvasArr: null,
                    canvasContextArr: null,
                    spriteEdgeOffset: 0,
                    spriteBetweenOffset: 0,
                    spriteRightRow: 5,
                    spriteLeftRow: 6,
                    spriteUpRow: 3,
                    spriteDownRow: 4,
                    framesPerSprite: 8,
                    deathFramesPerSprite: 8,
                },
                firelocust: {
                    spriteSource: firelocustSprite.current,
                    canvasArr: null,
                    canvasContextArr: null,
                    spriteEdgeOffset: 0,
                    spriteBetweenOffset: 0,
                    spriteRightRow: 6,
                    spriteLeftRow: 7,
                    spriteUpRow: 7,
                    spriteDownRow: 7,
                    framesPerSprite: 8,
                    deathFramesPerSprite: 11,
                },
                firewasp: {
                    spriteSource: firewaspSprite.current,
                    canvasArr: null,
                    canvasContextArr: null,
                    spriteEdgeOffset: 0,
                    spriteBetweenOffset: 0,
                    spriteRightRow: 6,
                    spriteLeftRow: 7,
                    spriteUpRow: 7,
                    spriteDownRow: 7,
                    framesPerSprite: 8,
                    deathFramesPerSprite: 11,
                },
            };

            engine.splitEnemySprite("firebug");
            engine.splitEnemySprite("leafbug");
            engine.splitEnemySprite("firelocust");
            engine.splitEnemySprite("firewasp");
        }
        /* /LOAD SPRITES */

        if (!engine.waveGenerator?.isInitialized) {
            // init level map draw
            engine.map?.drawMap();
        }

        // game start
        if (engine.isGameStarted) {
            gameLoop();
            gameLoopLogic();
        } else {
            cancelAnimationFrame(engine.animationFrameId);
            cancelIdleCallback(engine.requestIdleCallback);
        }
    }, [isGameStarted]);

    return (
        <section className="b-game" ref={gameWindow}>
            <div
                className="b-canvas-wrapper"
                style={{
                    position: "relative",
                    width: engine.map?.mapParams.width,
                    height: engine.map?.mapParams.height,
                }}
            >
                <canvas
                    ref={buildCanvas}
                    className="b-build-canvas"
                    id="buildCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{
                        position: "absolute",
                        zIndex: 999999,
                    }}
                    tabIndex={1}
                />
                <canvas
                    ref={projectileCanvas}
                    className="b-projectile-canvas"
                    id="projectileCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{
                        position: "absolute",
                        zIndex: 99999,
                        border: "1px solid black",
                    }}
                />
                <canvas
                    ref={canvas}
                    className="b-game-canvas"
                    id="gameCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{
                        position: "absolute",
                        zIndex: 99999,
                        border: "1px solid black",
                    }}
                />
                <canvas
                    ref={cannonCanvas}
                    className="b-cannon-canvas"
                    id="cannonCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{
                        position: "absolute",
                        zIndex: 9999,
                    }}
                />
                <canvas
                    ref={towerCanvas}
                    className="b-tower-canvas"
                    id="towerCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{ position: "absolute", zIndex: 999 }}
                />
                <canvas
                    ref={enemyCanvas}
                    className="b-enemy-canvas"
                    id="enemyCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{ position: "absolute", zIndex: 99 }}
                />
                <canvas
                    ref={deadEnemyCanvas}
                    className="b-dead-enemy-canvas"
                    id="deadEnemyCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{ position: "absolute", zIndex: 91 }}
                />
                <canvas
                    ref={mapCanvas}
                    className="b-map-canvas"
                    id="mapCanvas"
                    width={engine.map?.mapParams.width}
                    height={engine.map?.mapParams.height}
                    style={{ position: "absolute", zIndex: 9 }}
                />
            </div>
            <div className="b-game-sprites">
                <div className="b-tower-sprite" style={{ display: "none" }}>
                    <div className="b-tower-one-sprite">
                        <img
                            id="towerOneBase"
                            alt="towerOneSprite sprite"
                            src="sprites/tower/one/towerOneBaseSprite.png"
                            ref={towerOneBaseSprite}
                        />
                        <img
                            id="towerOneImpact"
                            alt="towerOneImpactSprite sprite"
                            src="sprites/tower/one/towerOneImpact.png"
                            ref={towerOneImpact}
                        />
                        <img
                            id="towerOneLevelOneWeapon"
                            alt="towerOneLevelOneWeaponSprite sprite"
                            src="sprites/tower/one/towerOneLevelOneWeapon.png"
                            ref={towerOneLevelOneWeapon}
                        />
                        <img
                            id="towerOneLevelOneProjectile"
                            alt="towerOneLevelOneProjectileSprite sprite"
                            src="sprites/tower/one/towerOneLevelOneProjectile.png"
                            ref={towerOneLevelOneProjectile}
                        />
                        <img
                            id="towerOneLevelTwoWeapon"
                            alt="towerOneLevelTwoWeaponSprite sprite"
                            src="sprites/tower/one/towerOneLevelTwoWeapon.png"
                            ref={towerOneLevelTwoWeapon}
                        />
                        <img
                            id="towerOneLevelTwoProjectile"
                            alt="towerOneLevelTwoProjectileSprite sprite"
                            src="sprites/tower/one/towerOneLevelTwoProjectile.png"
                            ref={towerOneLevelTwoProjectile}
                        />
                        <img
                            id="towerOneLevelThreeWeapon"
                            alt="towerOneLevelThreeWeaponSprite sprite"
                            src="sprites/tower/one/towerOneLevelThreeWeapon.png"
                            ref={towerOneLevelThreeWeapon}
                        />
                        <img
                            id="towerOneLevelThreeProjectile"
                            alt="towerOneLevelThreeProjectileSprite sprite"
                            src="sprites/tower/one/towerOneLevelThreeProjectile.png"
                            ref={towerOneLevelThreeProjectile}
                        />
                    </div>
                    <div className="b-tower-two-sprite">
                        <img
                            id="towerTwo"
                            alt="towerTwoSprite sprite"
                            src="sprites/tower/two/towerTwoBaseSprite.png"
                            ref={towerTwoBaseSprite}
                        />
                    </div>
                </div>
                <div className="b-enemy-sprite" style={{ display: "none" }}>
                    <img
                        id="firebugSprite"
                        alt="firebugSprite sprite"
                        src="sprites/enemy/FirebugSprite.png"
                        ref={firebugSprite}
                    />
                    <img
                        id="leafbugSprite"
                        alt="leafbugSprite sprite"
                        src="sprites/enemy/LeafbugSprite.png"
                        ref={leafbugSprite}
                    />
                    <img
                        id="firelocustSprite"
                        alt="firelocustSprite sprite"
                        src="sprites/enemy/FirelocustSprite.png"
                        ref={firelocustSprite}
                    />
                    <img
                        id="firewaspSprite"
                        alt="firewaspSprite sprite"
                        src="sprites/enemy/FirewaspSprite.png"
                        ref={firewaspSprite}
                    />
                </div>
            </div>
            <div className="b-game-status">
                {isGameOver && <h1>GAME IS OVER!</h1>}
                <div>
                    <p>
                        <span>{`Enemies left: ${enemiesLeft}`}</span>&nbsp;
                        <span>{`Current wave: ${wave}`}</span>&nbsp;
                        <span>{`Lives left: ${lives}`}</span>&nbsp;
                        <span>{`Killed enemies: ${score}`}</span>&nbsp;
                        <span>{`Money: $${money}`}</span>
                        &nbsp;
                    </p>
                    <p>
                        {Boolean(countdown) && (
                            <span>{`Next wave in: ${countdown} seconds`}</span>
                        )}
                    </p>
                </div>
                <hr />
                <div>
                    <button
                        onClick={() => {
                            engine.isGameStarted = true;
                            setIsGameStarted(true);
                        }}
                    >
                        Start
                    </button>
                    <button
                        onClick={() => {
                            engine.isGameStarted = false;
                            setIsGameStarted(false);
                        }}
                    >
                        Pause
                    </button>
                    <button
                        onClick={() => {
                            engine.restartGame();
                            setIsGameStarted(!isGameStarted);
                        }}
                    >
                        Restart
                    </button>
                    <button
                        onClick={() => {
                            canvas.current?.addEventListener(
                                "mousemove",
                                engine.canvasMouseMoveCallback,
                            );
                        }}
                    >
                        Enable mousemove callback
                    </button>
                    <button
                        onClick={() => {
                            canvas.current?.removeEventListener(
                                "mousemove",
                                engine.canvasMouseMoveCallback,
                            );
                        }}
                    >
                        Disable mousemove callback
                    </button>
                </div>
                <div>
                    <button
                        disabled={
                            !engine.isEnoughMoney(engine.towerOneParam!.towerParams.price)
                        }
                        onClick={() => {
                            engine.buildFirstTower();
                        }}
                    >
                        Build 1 level tower(${engine.towerOneParam!.towerParams.price})
                    </button>
                    <button
                        disabled={
                            !engine.isEnoughMoney(engine.towerTwoParam!.towerParams.price)
                        }
                        onClick={() => {
                            engine.buildSecondTower();
                        }}
                    >
                        Build 2 level tower(${engine.towerTwoParam!.towerParams.price})
                    </button>
                    <button
                        disabled={
                            !engine.isEnoughMoney(engine.towerThreeParam!.towerParams.price)
                        }
                        onClick={() => {
                            engine.buildThirdTower();
                        }}
                    >
                        Build 3 level tower(${engine.towerThreeParam!.towerParams.price})
                    </button>
                </div>
            </div>
        </section>
    );
};
