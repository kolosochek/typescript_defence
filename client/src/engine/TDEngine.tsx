import Enemy from "../enemies/Enemy";
import Tower from "../towers/Tower";
import Map from "../maps/Map";
import Projectile from "../projectiles/Projectile";
import Sound from "../sound/Sound";

// utilities declaration
export type TPartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

// types declaration
export type TTowerSpriteTypes =
  | "one"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six";
export type TEnemyName =
  | "firebug"
  | "leafbug"
  | "scorpion"
  | "firewasp"
  | "clampbeetle"
  | "firelocust";
type TTowerSprite = TPartialRecord<TTowerSpriteTypes, ITowerSprite | null>;
export type TTowerSpriteElements = "base" | "impact" | "weapon" | "projectile";
type TEnemySprite = TPartialRecord<TEnemyName, IEnemySprite | null>;
export type TEnemySpriteDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "start"
  | "end"
  | "startDead"
  | "endDead"
  | "leftDead"
  | "rightDead"
  | "upDead"
  | "downDead";
type TImageSprite = CanvasImageSource;

interface ITowerSprite {
  spriteSource: TPartialRecord<
    TTowerSpriteElements,
    HTMLImageElement | HTMLImageElement[]
  > | null;
  canvasArr: TPartialRecord<
    TTowerSpriteElements,
    HTMLCanvasElement[] | HTMLCanvasElement[][]
  > | null;
  canvasContextArr: Record<
    TTowerSpriteElements,
    CanvasRenderingContext2D[] | CanvasRenderingContext2D[][]
  > | null;
  spriteWidth?: number;
  spriteHeight?: number;
}
interface IEnemySprite {
  spriteSource: HTMLImageElement | null;
  canvasArr: TPartialRecord<TEnemySpriteDirection, HTMLCanvasElement[]> | null;
  canvasContextArr: TPartialRecord<
    TEnemySpriteDirection,
    CanvasRenderingContext2D[]
  > | null;
  spriteEdgeOffset: number;
  spriteBetweenOffset: number;
  framesPerSprite: number;
  deathFramesPerSprite: number;
  spriteRightRow: number;
  spriteLeftRow: number;
  spriteUpRow: number;
  spriteDownRow: number;
}

/**
 * interfaces declaration
 */

export interface ITwoDCoordinates {
  x: number;
  y: number;
}
export interface IWaveGenerator {
  waveParams: {
    currentWave: number;
    isWaveInProgress: boolean;
    hpCoefficient: number;
    speedCoefficient: number;
    enemyBountyCoefficient: number;
    enemyCountCoefficient: number;
    endWave: number;
    startWave: number;
    enemyCount: number;
  };
  waveTimerBetweenWaves: NodeJS.Timer | null;
  waveTimeoutBetweenWaves: number;
  waveCountdownTimer: NodeJS.Timer | null;
  waveCountdown: number;
}

class WaveGenerator {
  constructor(
    public engine: TDEngine,
    public isInitialized: boolean = false,
    public waveParams: IWaveGenerator["waveParams"] = {
      currentWave: 1,
      isWaveInProgress: false,
      hpCoefficient: engine.initialGameParams.hpCoefficient,
      speedCoefficient: engine.initialGameParams.speedCoefficient,
      enemyBountyCoefficient: 1,
      enemyCountCoefficient: 5,
      endWave: engine.initialGameParams.endWave,
      startWave: 1,
      enemyCount: engine.initialGameParams.enemiesPerWave,
    },
    public waveTimerBetweenWaves: IWaveGenerator["waveTimerBetweenWaves"] = null,
    public waveTimeoutBetweenWaves: IWaveGenerator["waveTimeoutBetweenWaves"] = 5000, // 5000
    public waveCountdownTimer: IWaveGenerator["waveCountdownTimer"] = null,
    public waveCountdown: IWaveGenerator["waveCountdown"] = 0,
    public isUICountdown = false,
  ) {
    this.waveCountdown = Math.floor(this.waveTimeoutBetweenWaves / 1000);
  }

  public repeatEnemy = (times: number) => {
    let enemiesArray = [];
    for (let iteration = 0; iteration < times; iteration++) {
      // boss enemy
      if (iteration % 5) {
        enemiesArray.push(
          new Enemy(this.engine, {
            type: "firebug",
            width: this.engine.map?.mapParams?.gridStep!,
            height: this.engine.map?.mapParams?.gridStep!,
            spaceBetweenEnemies: this.engine.map?.mapParams?.gridStep! * 1.5,
            speed:
              0.65 +
              this.waveParams.speedCoefficient * this.waveParams.currentWave,
            bounty:
              1 +
              this.waveParams.enemyBountyCoefficient *
                this.waveParams.currentWave,
            hp:
              100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
          }),
        );
      } else if (iteration % 3 === 0) {
        // slow enemy
        enemiesArray.push(
          new Enemy(this.engine, {
            type: "leafbug",
            width: this.engine.map?.mapParams?.gridStep!,
            height: this.engine.map?.mapParams?.gridStep!,
            spaceBetweenEnemies: this.engine.map?.mapParams?.gridStep! * 1.5,
            speed:
              0.65 +
              this.waveParams.speedCoefficient * this.waveParams.currentWave,
            bounty:
              1 +
              this.waveParams.enemyBountyCoefficient *
                this.waveParams.currentWave,
            hp:
              100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
          }),
        );
      } else if (iteration % 5 === 0) {
        // fast enemy
        enemiesArray.push(
          new Enemy(this.engine, {
            type: "firelocust",
            width: this.engine.map?.mapParams?.gridStep!,
            height: this.engine.map?.mapParams?.gridStep!,
            spaceBetweenEnemies: this.engine.map?.mapParams?.gridStep! * 1.5,
            speed:
              0.65 +
              this.waveParams.speedCoefficient * this.waveParams.currentWave,
            bounty:
              1 +
              this.waveParams.enemyBountyCoefficient *
                this.waveParams.currentWave,
            hp:
              100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
          }),
        );
      } else {
        // regular enemy
        enemiesArray.push(
          new Enemy(this.engine, {
            type: "firebug",
            width: this.engine.map?.mapParams?.gridStep!,
            height: this.engine.map?.mapParams?.gridStep!,
            spaceBetweenEnemies: this.engine.map?.mapParams?.gridStep! * 1.5,
            speed:
              0.65 +
              this.waveParams.speedCoefficient * this.waveParams.currentWave,
            bounty:
              1 +
              this.waveParams.enemyBountyCoefficient *
                this.waveParams.currentWave,
            hp:
              100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
          }),
        );
      }
    }
    return enemiesArray;
  };

  public init() {
    if (!this.isInitialized) {
      this.waveParams.currentWave = 1;
      // fill enemies array
      this.engine.enemies = this.repeatEnemy(this.waveParams.enemyCount);

      // set enemies position
      this.engine.enemies?.forEach((enemy: Enemy, index: number) => {
        enemy.initialSetEnemy({
          x:
            -enemy.enemyParams.spaceBetweenEnemies! *
              this.engine.enemies?.length! +
            index * enemy.enemyParams.spaceBetweenEnemies!,
          y: 0,
        });
      });
      this.isInitialized = true;
      this.waveParams.isWaveInProgress = true;
      clearTimeout(this.waveTimerBetweenWaves!);
      this.waveTimerBetweenWaves = null;
    }
  }

  public spawnEnemies() {
    // fill enemies array
    if (this.waveParams.currentWave < this.waveParams.endWave) {
      // increment wave
      this.waveParams.currentWave += 1;

      // spawn into running wave
      if (this.waveParams.isWaveInProgress) {
        // create new Enemy class instances
        const enemiesSpawned = this.repeatEnemy(
          this.waveParams.enemyCount +
            this.waveParams.enemyCountCoefficient * this.waveParams.currentWave,
        );

        // push spawned enemies into common enemies pool
        if (this.engine.enemies?.length) {
          this.engine.enemies = this.engine.enemies?.concat(enemiesSpawned);
        }
        // set spawned enemies coordinates
        enemiesSpawned.forEach((enemy: Enemy, index: number) => {
          enemy.initialSetEnemy({
            x:
              -enemy.enemyParams.spaceBetweenEnemies! *
                this.engine.enemies?.length! +
              index * enemy.enemyParams.spaceBetweenEnemies!,
            y: 0,
          });
        });
        // spawn between waves
      } else {
        // fill enemies array
        this.engine.enemies = this.repeatEnemy(
          this.waveParams.enemyCount +
            this.waveParams.enemyCountCoefficient * this.waveParams.currentWave,
        );
        // draw enemies
        this.engine.enemies?.forEach((enemy: Enemy, index: number) => {
          enemy.initialSetEnemy({
            x:
              -enemy.enemyParams.spaceBetweenEnemies! *
                this.engine.enemies?.length! +
              index * enemy.enemyParams.spaceBetweenEnemies!,
            y: 0,
          });
        });
      }

      clearTimeout(this.waveTimerBetweenWaves!);
      this.waveTimerBetweenWaves = null;
      this.waveParams.isWaveInProgress = true;
    }
  }

  public countdown() {
    if (!this.waveCountdownTimer) {
      this.waveCountdownTimer = setInterval(() => {
        if (this.waveCountdown > 0) {
          this.waveCountdown -= 1;
        } else {
          clearInterval(this.waveCountdownTimer!);
          this.isUICountdown = false;
        }
      }, 1000);
    }
  }
}

export interface ITDEngine {
  context?: CanvasRenderingContext2D;
  mapContext?: CanvasRenderingContext2D;
  enemyContext?: CanvasRenderingContext2D;
  deadEnemyContext?: CanvasRenderingContext2D;
  enemies?: Enemy[];
  towers?: Tower[];
  projectiles?: Projectile[];
  map?: Map;
  animationFrameId: number;
  requestIdleCallback: number;
  twoDCoordinates: ITwoDCoordinates;
  lives: number;
  score: number;
  money: number;
  idleTimeout: number;
  isCanBuild: boolean;
  isGameStarted: boolean;
  isShowGrid: boolean;
  isNotEnoughMoney: boolean;
  canvasMouseMoveEvent: EventListener | null;
  draftTower: Tower | null;
  cursorPosition: ITwoDCoordinates;
  towerSprites: TTowerSprite;
  enemySprites: TEnemySprite;
  mapSprites: TImageSprite[];
  predefinedTowerParams: TPartialRecord<
    TTowerSpriteTypes,
    {
      towerParams: Tower["towerParams"];
      projectileParams: Tower["projectileParams"];
    }
  >;
  initialGameParams: {
    money: number;
    lives: number;
    wave: number;
    enemiesPerWave: number;
    endWave: number;
    hpCoefficient: number;
    speedCoefficient: number;
    strokeStyle: string;
    framesPerSprite: number;
    fps: number;
  };
  waveGenerator: WaveGenerator | null;
  sound: Sound | null;
}

class TDEngine {
  constructor(
    // render context
    public context?: ITDEngine["context"],
    public mapContext?: ITDEngine["context"],
    public buildContext?: ITDEngine["context"],
    public projectileContext?: ITDEngine["context"],
    public cannonContext?: ITDEngine["context"],
    public towerContext?: ITDEngine["context"],
    public enemyContext?: ITDEngine["context"],
    public deadEnemyContext?: ITDEngine["context"],
    public map?: ITDEngine["map"],
    public enemies: ITDEngine["enemies"] = [],
    public deadEnemies: ITDEngine["enemies"] = [],
    public towers: ITDEngine["towers"] = [],
    public projectiles: ITDEngine["projectiles"] = [],
    public idleTimeout: ITDEngine["idleTimeout"] = 250,
    public animationFrameId: ITDEngine["animationFrameId"] = 0,
    public requestIdleCallback: ITDEngine["requestIdleCallback"] = 0,
    public lives: ITDEngine["lives"] = 0,
    public score: ITDEngine["score"] = 0,
    public money: ITDEngine["money"] = 0,
    public isCanBuild: ITDEngine["isCanBuild"] = false,
    public isGameStarted: ITDEngine["isGameStarted"] = false,
    public isShowGrid: ITDEngine["isShowGrid"] = false,
    public isNotEnoughMoney: ITDEngine["isNotEnoughMoney"] = false,
    public draftTower: ITDEngine["draftTower"] = null,
    public cursorPosition: ITDEngine["cursorPosition"] = { x: 0, y: 0 },
    public draftBuildCoordinates: ITwoDCoordinates = { x: 0, y: 0 },
    public towerSprites: ITDEngine["towerSprites"] = {},
    public enemySprites: ITDEngine["enemySprites"] = {},
    public mapSprites: ITDEngine["mapSprites"] = [],
    public predefinedTowerParams: ITDEngine["predefinedTowerParams"] = {
      one: {
        towerParams: {
          attackRate: 2000,
          attackDamage: 30,
          attackRange: 300,
          baseWidth: 64,
          baseHeight: 128,
          dimensions: [
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 20,
            },
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 12,
            },
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 4,
            },
          ],
          cannonFrameLimit: 6,
          isSelected: false,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "rgba(0, 255, 0, 0.2)",
          firingAngle: 0,
          fireFromCoords: { x: 0, y: 0 },
          price: 25,
        },
        projectileParams: {
          acceleration: 1.2,
          projectileSpeed: 0.2,
          targetX: 0,
          targetY: 0,
          rectCenterX: 0,
          rectCenterY: 0,
          dimensions: [
            {
              projectileWidth: 22,
              projectileHeight: 40,
            },
            {
              projectileWidth: 22,
              projectileHeight: 40,
            },
            {
              projectileWidth: 22,
              projectileHeight: 40,
            },
          ],
          projectileHitAlive: 120,
          projectileFrameLimit: 3,
          impactFrameLimit: 6,
        },
      },
      two: {
        towerParams: {
          attackRate: 3000,
          attackDamage: 20,
          attackRange: 300,
          baseWidth: 64,
          baseHeight: 128,
          dimensions: [
            {
              cannonWidth: 48,
              cannonHeight: 48,
              cannonOffsetX: 0,
              cannonOffsetY: 22,
            },
            {
              cannonWidth: 64,
              cannonHeight: 64,
              cannonOffsetX: 0,
              cannonOffsetY: 12,
            },
            {
              cannonWidth: 64,
              cannonHeight: 64,
              cannonOffsetX: 0,
              cannonOffsetY: 4,
            },
          ],
          cannonFrameLimit: 16,
          isSelected: false,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "rgba(0, 255, 0, 0.2)",
          firingAngle: 0,
          fireFromCoords: { x: 0, y: 0 },
          price: 45,
        },
        projectileParams: {
          acceleration: 1.2,
          projectileSpeed: 0.4,
          targetX: 0,
          targetY: 0,
          rectCenterX: 0,
          rectCenterY: 0,
          dimensions: [
            {
              projectileWidth: 32,
              projectileHeight: 32,
            },
            {
              projectileWidth: 32,
              projectileHeight: 32,
            },
            {
              projectileWidth: 32,
              projectileHeight: 32,
            },
          ],
          projectileHitAlive: 120,
          projectileFrameLimit: 5,
          impactFrameLimit: 5,
        },
      },
      three: {
        towerParams: {
          attackRate: 3000,
          attackDamage: 20,
          attackRange: 300,
          baseWidth: 64,
          baseHeight: 128,
          dimensions: [
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 22,
            },
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 12,
            },
            {
              cannonWidth: 96,
              cannonHeight: 96,
              cannonOffsetX: 0,
              cannonOffsetY: 4,
            },
          ],
          cannonFrameLimit: 8,
          isSelected: false,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "rgba(0, 255, 0, 0.2)",
          firingAngle: 0,
          fireFromCoords: { x: 0, y: 0 },
          price: 45,
        },
        projectileParams: {
          acceleration: 1.2,
          projectileSpeed: 0.4,
          targetX: 0,
          targetY: 0,
          rectCenterX: 0,
          rectCenterY: 0,
          dimensions: [
            {
              projectileWidth: 10,
              projectileHeight: 10,
            },
            {
              projectileWidth: 10,
              projectileHeight: 10,
            },
            {
              projectileWidth: 10,
              projectileHeight: 10,
            },
          ],
          projectileHitAlive: 120,
          projectileFrameLimit: 6,
          impactFrameLimit: 5,
        },
      },
      four: {
        towerParams: {
          attackRate: 3000,
          attackDamage: 20,
          attackRange: 300,
          baseWidth: 64,
          baseHeight: 128,
          dimensions: [
            {
              cannonWidth: 128,
              cannonHeight: 128,
              cannonOffsetX: 0,
              cannonOffsetY: 22,
            },
            {
              cannonWidth: 128,
              cannonHeight: 128,
              cannonOffsetX: 0,
              cannonOffsetY: 12,
            },
            {
              cannonWidth: 128,
              cannonHeight: 128,
              cannonOffsetX: 0,
              cannonOffsetY: 4,
            },
          ],
          cannonFrameLimit: 16,
          isSelected: false,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "green",
          firingAngle: 0,
          fireFromCoords: { x: 0, y: 0 },
          price: 45,
        },
        projectileParams: {
          acceleration: 1.2,
          projectileSpeed: 0.4,
          targetX: 0,
          targetY: 0,
          rectCenterX: 0,
          rectCenterY: 0,
          dimensions: [
            {
              projectileWidth: 8,
              projectileHeight: 8,
            },
            {
              projectileWidth: 8,
              projectileHeight: 8,
            },
            {
              projectileWidth: 8,
              projectileHeight: 8,
            },
          ],
          projectileHitAlive: 120,
          projectileFrameLimit: 6,
          impactFrameLimit: 8,
        },
      },
    },
    public initialGameParams: ITDEngine["initialGameParams"] = {
      money: 1000,
      lives: 10,
      wave: 1,
      enemiesPerWave: 20,
      endWave: 10,
      hpCoefficient: 20,
      speedCoefficient: 0.3, // 0.3,
      strokeStyle: "#000000",
      framesPerSprite: 8,
      fps: 24,
    },
    public waveGenerator: ITDEngine["waveGenerator"] = null,
    public sound: ITDEngine["sound"] = new Sound(),
  ) {
    // set map
    this.setMap(new Map(this));
    // set waveGenerator
    this.waveGenerator = new WaveGenerator(this);
    this.money = this.initialGameParams.money;
    this.lives = this.initialGameParams.lives;
  }

  public gameRestart() {
    // clear memory
    this.enemies = [];
    this.deadEnemies = [];
    this.towers = [];
    this.projectiles = [];
    // reset sound
    // game start sound
    this.sound?.soundArr?.gameStart?.pause();
    this.sound!.soundArr!.gameStart!.currentTime = 0;
    // clear canvas
    this.clearTowerCanvas();
    // wave generator
    clearInterval(this.waveGenerator!.waveCountdownTimer!);
    clearTimeout(this.waveGenerator!.waveTimerBetweenWaves!);
    this.waveGenerator!.waveCountdownTimer = null;
    this.waveGenerator!.waveTimerBetweenWaves = null;
    this.waveGenerator!.isInitialized = false;
    //
    this.isGameStarted = true;
    // create mapTilesArr
    this.map?.createMapTilesArr();
    // pop tiles which is occupied by map path
    this.map?.popMapPathTiles();
    // game params
    this.money = this.initialGameParams.money;
    this.lives = this.initialGameParams.lives;
    this.score = 0;
    // spawner
    this.waveGenerator!.waveParams.currentWave = 1;
    this.waveGenerator!.waveCountdown = Math.floor(
      this.waveGenerator!.waveTimeoutBetweenWaves / 1000,
    );
    setTimeout(() => {
      this.waveGenerator!.waveParams.isWaveInProgress = false;
      this.waveGenerator!.isUICountdown = false;
    }, this.waveGenerator!.waveTimeoutBetweenWaves);
  }

  public gamePause() {
    this.isGameStarted = false;
  }

  public gameStart() {
    this.isGameStarted = true;
  }

  public clearMemory() {
    this.enemies = [];
    this.deadEnemies = [];
    this.projectiles = [];
    for (let tower of this.towers!) {
      tower.target = null;
    }
  }

  public splitTowerSprite(towerType: TTowerSpriteTypes) {
    // split sprites into proper frames
    // and draw proper frames in each canvas
    // split png sprite to separate canvases,
    this.towerSprites[towerType]!.canvasArr =
      this.createTowerSpriteCanvasArr(towerType);
    // set their render context
    this.towerSprites[towerType]!.canvasContextArr =
      this.createTowerSpriteCanvasContext(
        this.towerSprites[towerType]!.canvasArr,
        towerType,
      );

    for (const [element, source] of Object.entries(
      this.towerSprites[towerType]!.spriteSource!,
    )) {
      if (Array.isArray(source)) {
        source.forEach((imageSource, upgradeLevel) => {
          imageSource.onload = () => {
            // and draw proper frames in each canvas
            this.drawTowerFrameOnCanvas(
              element as TTowerSpriteElements,
              this.towerSprites[towerType]!.canvasContextArr![
                element as TTowerSpriteElements
              ][upgradeLevel]! as CanvasRenderingContext2D[],
              imageSource,
              towerType,
              upgradeLevel,
            );
          };
        });
      } else {
        source.onload = () => {
          // and draw proper frames in each canvas
          this.drawTowerFrameOnCanvas(
            element as TTowerSpriteElements,
            this.towerSprites[towerType]!.canvasContextArr![
              element as TTowerSpriteElements
            ]! as CanvasRenderingContext2D[],
            source,
            towerType,
          );
        };
      }
    }
  }

  public splitEnemySprite(enemyType: TEnemyName) {
    // split sprites into proper frames
    // and draw proper frames in each canvas

    // split png sprite to separate canvases,
    this.enemySprites[enemyType]!.canvasArr = this.createEnemySpriteCanvasArr(
      enemyType,
      this.enemySprites[enemyType]!.framesPerSprite,
    );
    // set their render context
    this.enemySprites[enemyType]!.canvasContextArr =
      this.createEnemySpriteCanvasContext(
        this.enemySprites[enemyType]!.canvasArr,
      );

    this.enemySprites![enemyType]!.spriteSource!.onload = () => {
      // and draw proper frames in each canvas
      this.drawEnemyFrameOnCanvas(
        this.enemySprites[enemyType]!.canvasContextArr!,
        this.enemySprites[enemyType]!.spriteSource!,
        this.enemySprites[enemyType]!.spriteRightRow,
        this.enemySprites[enemyType]!.spriteLeftRow,
        this.enemySprites[enemyType]!.spriteUpRow,
        this.enemySprites[enemyType]!.spriteDownRow,
      );

      // debug
    };
  }

  public createCanvasArr(arrLength: number) {
    return Array.from(Array(arrLength), () => document.createElement("canvas"));
  }

  public createTowerSpriteCanvasArr(towerType: TTowerSpriteTypes) {
    return {
      base: this.createCanvasArr(3),
      impact: [
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.impactFrameLimit!,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.impactFrameLimit!,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.impactFrameLimit!,
        )!,
      ],
      weapon: [
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.towerParams?.cannonFrameLimit!,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.towerParams?.cannonFrameLimit!,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.towerParams?.cannonFrameLimit!,
        )!,
      ],
      projectile: [
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.projectileFrameLimit! + 1,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.projectileFrameLimit! + 1!,
        )!,
        this.createCanvasArr(
          this.predefinedTowerParams[towerType]?.projectileParams
            ?.projectileFrameLimit! + 1!,
        )!,
      ],
    };
  }

  public createTowerSpriteCanvasContext(
    canvasArr: ITowerSprite["canvasArr"],
    towerType: TTowerSpriteTypes,
  ) {
    let contextArr: ITowerSprite["canvasContextArr"] = {
      base: [],
      impact: [[], [], []],
      weapon: [[], [], []],
      projectile: [[], [], []],
    };
    for (const [element, upgradeArr] of Object.entries(canvasArr!)) {
      switch (element as TTowerSpriteElements) {
        case "base": {
          upgradeArr.forEach((canvas, upgradeLevel) => {
            if (!Array.isArray(canvas)) {
              canvas.width =
                this.predefinedTowerParams[
                  towerType as TTowerSpriteTypes
                ]!.towerParams.baseWidth!;
              canvas.height =
                this.predefinedTowerParams[
                  towerType as TTowerSpriteTypes
                ]!.towerParams.baseHeight!;
              (contextArr?.base as CanvasRenderingContext2D[]).push(
                canvas.getContext("2d")!,
              );
            }
          });
          break;
        }
        case "weapon": {
          upgradeArr.forEach((upgradeLevel, level) => {
            (upgradeLevel as HTMLCanvasElement[]).forEach((canvas) => {
              canvas.width = this.predefinedTowerParams[towerType]!.towerParams
                ?.dimensions[level]!.cannonWidth as number;
              canvas.height = this.predefinedTowerParams[towerType]!.towerParams
                ?.dimensions[level]!.cannonHeight as number;
              (contextArr!.weapon[level]! as CanvasRenderingContext2D[]).push(
                canvas.getContext("2d")!,
              );
            });
          });
          break;
        }
        case "projectile": {
          upgradeArr.forEach((upgradeLevel, level) => {
            (upgradeLevel as HTMLCanvasElement[]).forEach((canvas) => {
              const canvasHypot = Math.ceil(
                Math.hypot(
                  this.predefinedTowerParams[towerType]!.projectileParams
                    ?.dimensions[level]!.projectileWidth,
                  this.predefinedTowerParams[towerType]!.projectileParams
                    ?.dimensions[level]!.projectileHeight,
                ),
              );
              canvas.width = canvasHypot;
              canvas.height = canvasHypot;
              (
                contextArr!.projectile[level]! as CanvasRenderingContext2D[]
              ).push(canvas.getContext("2d")!);
            });
          });
          break;
        }
        case "impact": {
          upgradeArr.forEach((upgradeLevel, level) => {
            (upgradeLevel as HTMLCanvasElement[]).forEach((canvas) => {
              canvas.width =
                this.predefinedTowerParams[
                  towerType
                ]!.projectileParams?.dimensions[level]!.projectileWidth;
              canvas.height =
                this.predefinedTowerParams[
                  towerType
                ]!.projectileParams?.dimensions[level].projectileHeight;
              (contextArr!.impact[level]! as CanvasRenderingContext2D[]).push(
                canvas.getContext("2d")!,
              );
            });
          });
          break;
        }
      }
    }
    return contextArr;
  }

  public createEnemySpriteCanvasArr(type: TEnemyName, frames: number) {
    return {
      right: this.createCanvasArr(this.enemySprites[type!]?.framesPerSprite!),
      left: this.createCanvasArr(this.enemySprites[type!]?.framesPerSprite!),
      up: this.createCanvasArr(this.enemySprites[type!]?.framesPerSprite!),
      down: this.createCanvasArr(this.enemySprites[type!]?.framesPerSprite!),
      rightDead: this.createCanvasArr(
        this.enemySprites[type!]?.deathFramesPerSprite!,
      ),
      leftDead: this.createCanvasArr(
        this.enemySprites[type!]?.deathFramesPerSprite!,
      ),
      upDead: this.createCanvasArr(
        this.enemySprites[type!]?.deathFramesPerSprite!,
      ),
      downDead: this.createCanvasArr(
        this.enemySprites[type!]?.deathFramesPerSprite!,
      ),
    };
  }

  public createEnemySpriteCanvasContext(canvasArr: IEnemySprite["canvasArr"]) {
    let contextArr: IEnemySprite["canvasContextArr"] = {
      left: [],
      right: [],
      up: [],
      down: [],
      leftDead: [],
      rightDead: [],
      upDead: [],
      downDead: [],
    };
    for (const [direction, canvasArray] of Object.entries(canvasArr!)) {
      for (const canvas of canvasArray!) {
        canvas.width = this.map?.mapParams?.gridStep!;
        canvas.height = this.map?.mapParams?.gridStep!;
        contextArr[direction as TEnemySpriteDirection]!.push(
          canvas.getContext("2d")!,
        );
      }
    }
    return contextArr;
  }

  public drawFrame(
    context: CanvasRenderingContext2D,
    source: CanvasImageSource,
    sx = 0,
    sy = 0,
    sw = this.map?.mapParams?.gridStep!,
    sh = this.map?.mapParams?.gridStep!,
    dx = 0,
    dy = 0,
    dw = this.map?.mapParams?.gridStep!,
    dh = this.map?.mapParams?.gridStep!,
  ) {
    context.beginPath();
    context.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
    context.closePath();
  }

  public drawEnemyFrameOnCanvas(
    contextArr: IEnemySprite["canvasContextArr"],
    spriteSource: IEnemySprite["spriteSource"],
    spriteRightRow: IEnemySprite["spriteRightRow"],
    spriteLeftRow: IEnemySprite["spriteLeftRow"],
    spriteUpRow: IEnemySprite["spriteUpRow"],
    spriteDownRow: IEnemySprite["spriteDownRow"],
  ) {
    for (const [direction, contextArray] of Object.entries(contextArr!)) {
      contextArray.forEach((context, index) => {
        switch (direction) {
          case "right": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * spriteRightRow,
            );
            break;
          }
          case "left": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * spriteLeftRow,
            );
            break;
          }
          case "up": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * spriteUpRow,
            );
            break;
          }
          case "down": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * spriteDownRow,
            );
            break;
          }
          case "rightDead": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * (spriteRightRow + 4),
            );
            break;
          }
          case "leftDead": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * (spriteLeftRow + 4),
            );
            break;
          }
          case "upDead": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * (spriteUpRow + 4),
            );
            break;
          }
          case "downDead": {
            this.drawFrame(
              context,
              spriteSource!,
              index * this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * (spriteDownRow + 4),
            );
            break;
          }
        }
      });
    }
  }

  public drawTowerFrameOnCanvas(
    element: TTowerSpriteElements,
    contextArr: CanvasRenderingContext2D[],
    spriteSource: CanvasImageSource,
    towerType: TTowerSpriteTypes,
    upgradeLevel = 0,
  ) {
    contextArr.forEach((context, index) => {
      switch (element) {
        case "base": {
          this.drawFrame(
            context,
            spriteSource,
            this.map?.mapParams?.gridStep! * index,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep! * 2,
            0,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep! * 2,
          );
          break;
        }
        // weapons
        case "weapon": {
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]?.towerParams?.dimensions[
              upgradeLevel
            ].cannonWidth! * index,
            0,
            this.predefinedTowerParams[towerType]?.towerParams?.dimensions[
              upgradeLevel
            ].cannonWidth!,
            this.predefinedTowerParams[towerType]?.towerParams?.dimensions[
              upgradeLevel
            ].cannonHeight!,
            0,
            0,
            this.predefinedTowerParams[towerType]?.towerParams?.dimensions[
              upgradeLevel
            ].cannonWidth!,
            this.predefinedTowerParams[towerType]?.towerParams?.dimensions[
              upgradeLevel
            ].cannonHeight!,
          );
          break;
        }
        case "projectile": {
          // find the widest or longest value of projectile canvas depending on firing angle
          const canvasHypot = Math.ceil(
            Math.hypot(
              this.predefinedTowerParams[towerType]!.projectileParams
                ?.dimensions[upgradeLevel].projectileWidth,
              this.predefinedTowerParams[towerType]!.projectileParams
                ?.dimensions[upgradeLevel].projectileHeight,
            ),
          );
          //
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]!.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth * index,
            0,
            this.predefinedTowerParams[towerType]!.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth,
            this.predefinedTowerParams[towerType]!.projectileParams?.dimensions[
              upgradeLevel
            ].projectileHeight,
            (canvasHypot -
              this.predefinedTowerParams[towerType]!.projectileParams
                ?.dimensions[upgradeLevel].projectileWidth) /
              2,
            (canvasHypot -
              this.predefinedTowerParams[towerType]!.projectileParams
                ?.dimensions[upgradeLevel].projectileHeight) /
              2,
            this.predefinedTowerParams[towerType]!.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth,
            this.predefinedTowerParams[towerType]!.projectileParams?.dimensions[
              upgradeLevel
            ].projectileHeight,
          );
          break;
        }
        case "impact": {
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]?.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth! * index,
            0,
            this.predefinedTowerParams[towerType]?.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth!,
            this.predefinedTowerParams[towerType]?.projectileParams?.dimensions[
              upgradeLevel
            ].projectileHeight!,
            0,
            0,
            this.predefinedTowerParams[towerType]?.projectileParams?.dimensions[
              upgradeLevel
            ].projectileWidth!,
            this.predefinedTowerParams[towerType]?.projectileParams?.dimensions[
              upgradeLevel
            ].projectileHeight!,
          );
          break;
        }
      }
    });
  }

  public manageHotkeys(e: KeyboardEvent) {
    // cancel building mode
    if (e.key === "Escape") {
      if (this.isCanBuild) {
        this.isCanBuild = false;
        this.isShowGrid = false;
      }
    }

    if (e.key === "1") {
      this.draftTower = null;
      this.isShowGrid = false;
      this.buildTower("one", 0);
    }
    if (e.key === "2") {
      this.draftTower = null;
      this.buildTower("one", 1);
    }
    if (e.key === "3") {
      this.draftTower = null;
      this.buildTower("one", 2);
    }
    if (e.key === "4") {
      this.draftTower = null;
      this.buildTower("two", 0);
    }
    if (e.key === "5") {
      this.draftTower = null;
      this.buildTower("two", 1);
    }
    if (e.key === "6") {
      this.draftTower = null;
      this.buildTower("two", 2);
    }
    if (e.key === "7") {
      this.draftTower = null;
      this.buildTower("three", 0);
    }
    if (e.key === "8") {
      this.draftTower = null;
      this.buildTower("three", 1);
    }
    if (e.key === "9") {
      this.draftTower = null;
      this.buildTower("three", 2);
    }
    if (e.key === "q") {
      this.draftTower = null;
      this.buildTower("four", 0);
    }
    if (e.key === "w") {
      this.draftTower = null;
      this.buildTower("four", 1);
    }
    if (e.key === "e") {
      this.draftTower = null;
      this.buildTower("four", 2);
    }
    if (e.key === "s") {
      this.gameStart();
    }
    if (e.key === "p") {
      this.gamePause();
    }
    // log mode
    if (e.key === "0") {
      // debug
      console.log("engine");
      console.log(this);
      console.log("this.enemies");
      console.log(this.enemies);
      console.log(this.enemies?.length);
      console.log("----");
      console.log(`this.towers`);
      console.log(this.towers);
      console.log(this.towers?.length);
      console.log("----");
      console.log(`this.projectiles`);
      console.log(this.projectiles);
      console.log(this.projectiles?.length);
      console.log("---");
      console.log(`this.lives`);
      console.log(this.lives);
      console.log(`this.money`);
      console.log(this.money);
      console.log("---");
      console.log(`this.waveGenerator.waveParams`);
      console.log(this.waveGenerator?.waveParams);
      console.log("---");
      //
    }
  }

  public buildTower = (
    type: TTowerSpriteTypes,
    upgradeLevel: Tower["upgradeLevel"],
  ) => {
    if (
      this.isEnoughMoney(this.predefinedTowerParams[type]!.towerParams.price)
    ) {
      this.isCanBuild = true;
      this.draftTower = new Tower(
        this,
        type,
        upgradeLevel,
        this.draftBuildCoordinates,
        structuredClone(this.predefinedTowerParams[type]?.towerParams!),
        structuredClone(this.predefinedTowerParams[type]?.projectileParams!),
      );
    }
  };

  public findClosestTile(
    coordinates: ITwoDCoordinates,
    tilesArr: ITwoDCoordinates[] = this.map?.mapParams.mapTilesArr!,
  ): ITwoDCoordinates {
    let minDistance = this.map?.mapParams.width;
    tilesArr.forEach((tile) => {
      const distance =
        (tile.x -
          coordinates.x! +
          this.map?.mapParams.gridStep! -
          this.map?.mapParams?.tileCenter!) *
          (tile.x -
            coordinates.x! +
            this.map?.mapParams.gridStep! -
            this.map?.mapParams?.tileCenter!) +
        (tile.y - coordinates.y! + this.map?.mapParams?.tileCenter!) *
          (tile.y - coordinates.y! + this.map?.mapParams?.tileCenter!);
      if (distance < minDistance!) {
        minDistance = distance;
        this.map!.mapParams.closestTile! = tile!;
      }
    });

    this.draftBuildCoordinates = {
      x: this.map?.mapParams.closestTile.x! + this.map?.mapParams.gridStep!,
      y: this.map?.mapParams.closestTile.y! + this.map?.mapParams.gridStep!,
    };

    return {
      x: this.map?.mapParams.closestTile.x!,
      y: this.map?.mapParams.closestTile.y!,
    };
  }

  public highlightTile(
    coords: ITwoDCoordinates,
    context: CanvasRenderingContext2D = this.context!,
  ) {
    context.beginPath();
    context.strokeStyle = "green";
    context.setLineDash([]);
    context.strokeRect(
      coords.x,
      coords.y,
      this.map?.mapParams.gridStep!,
      this.map?.mapParams.gridStep!,
    );
    context.closePath();
  }

  public canvasMouseMoveCallback = (e: MouseEvent) => {
    this.cursorPosition = {
      x: e.offsetX,
      y: e.offsetY,
    };
    this.map!.mapParams.closestTile = this.findClosestTile(this.cursorPosition);
    if (this.isCanBuild) {
      this.draftShowTower();
    }
  };

  public canvasClickCallback = (e: MouseEvent) => {
    // build tower
    if (this.isCanBuild) {
      this.draftBuildTower();
    } else {
      this.selectTower();
    }
  };

  public selectTower() {
    if (!this.towers?.length) return;
    const closestTile = this.findClosestTile(
      { x: this.cursorPosition.x + 64, y: this.cursorPosition.y + 64 },
      this.map?.mapParams?.towerTilesArr,
    );
    // closestTile.x -= 64;
    // closestTile.y -= 64;
    this.towers.forEach((tower) => {
      // remove selection
      if (tower.towerParams.isSelected) {
        tower.towerParams.isSelected = false;
        tower.drawBase();
      }
      // set new selection
      if (
        tower.currentPosition.x === closestTile.x &&
        tower.currentPosition.y === closestTile.y
      ) {
        // debug
        console.log(`gotcha tower!`);
        console.log(tower);
        //
        tower.towerParams.isSelected = true;
        tower.drawBase();
      }
    });
  }

  public gameWindowKeydown = (e: KeyboardEvent) => {
    this.manageHotkeys(e);
  };

  public isEnoughMoney(towerPrice: Tower["towerParams"]["price"]) {
    if (this.money >= towerPrice!) {
      return true;
    }
    this.isNotEnoughMoney = true;
    return false;
  }

  public draftShowTower() {
    if (!this.isCanBuild) return;
    // show building grid
    // this.isShowGrid = true;

    this.draftTower!.currentPosition = this.draftBuildCoordinates;
    this.draftTower!.towerParams.strokeStyle = "green";
    // this.draftTower!.drawDraft();
  }

  public draftBuildTower() {
    if (this.isCanBuild) {
      if (this.money >= this.draftTower?.towerParams.price!) {
        this.isNotEnoughMoney = false;

        let isTileFound = false;
        for (const tile of this.map?.mapParams.mapTilesArr!) {
          if (
            tile.x === this.map?.mapParams.closestTile.x &&
            tile.y === this.map?.mapParams.closestTile.y
          ) {
            isTileFound = true;
          }
        }

        if (isTileFound) {
          // show building grid
          // this.isShowGrid = true

          this.draftTower!.currentPosition = this.draftBuildCoordinates;

          // set strokeStyle to default
          this.draftTower!.towerParams.strokeStyle =
            this.initialGameParams.strokeStyle;

          // add new tower
          this.towers = [...this.towers!, this.draftTower!];

          // draw tower on canvas
          this.draftTower!.draw();

          // enable attack timer
          // this.draftTower?.setAttackInterval();

          // push tile to towerTilesArr
          this.map!.mapParams.towerTilesArr.push(this.draftBuildCoordinates);

          // pop chosen tile from available space to build
          this.map!.mapParams.mapTilesArr! =
            this.map?.mapParams.mapTilesArr.filter((tile) => {
              return (
                tile.x !== this.map?.mapParams.closestTile.x ||
                tile.y !== this.map?.mapParams.closestTile.y
              );
            })!;
          // disable building mode
          this.isCanBuild = false;
          this.money -= this.draftTower?.towerParams.price!;
          this.draftTower = null;
          // this.map.mapParams.closestTile = this.findClosestTile(this.cursorPosition)
        }
      } else {
        this.isNotEnoughMoney = true;
      }
    }
  }

  public clearTowerCanvas() {
    this.towerContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
  }

  public clearCanvas() {
    // clear game canvas
    this.context?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear cannon canvas
    this.cannonContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear projectile canvas
    this.projectileContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear build canvas
    this.buildContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear enemy canvas
    this.enemyContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear dead enemy canvas
    this.deadEnemyContext?.clearRect(
      0,
      0,
      this.map?.mapParams.width!,
      this.map?.mapParams.height!,
    );
    // clear tower canvas
    // this.clearTowerCanvas();
  }

  public setContext(context: ITDEngine["context"]) {
    this.context = context;
  }

  public setBuildContext(buildContext: ITDEngine["context"]) {
    this.buildContext = buildContext;
  }

  public setProjectileContext(projectileContext: ITDEngine["context"]) {
    this.projectileContext = projectileContext;
  }

  public setCannonContext(cannonContext: ITDEngine["context"]) {
    this.cannonContext = cannonContext;
  }

  public setTowerContext(towerContext: ITDEngine["context"]) {
    this.towerContext = towerContext;
  }

  public setMapContext(mapContext: ITDEngine["context"]) {
    this.mapContext = mapContext;
  }

  public setEnemyContext(enemyContext: ITDEngine["context"]) {
    this.enemyContext = enemyContext;
  }

  public setDeadEnemyContext(deadEnemyContext: ITDEngine["context"]) {
    this.deadEnemyContext = deadEnemyContext;
  }

  public setMap(map: ITDEngine["map"]) {
    this.map = map;
  }

  public setEnemies(enemies: ITDEngine["enemies"]) {
    this.enemies = enemies;
  }

  public setTowers(towers: ITDEngine["towers"]) {
    this.towers = towers;
  }

  public setProjectiles(projectiles: ITDEngine["projectiles"]) {
    this.projectiles = projectiles;
  }

  public pushProjectile(projectile: Projectile) {
    this.projectiles?.push(projectile);
  }
}

export default TDEngine;
