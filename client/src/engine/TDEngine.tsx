import Enemy, { IEnemy } from "../enemies/Enemy";
import Tower from "../towers/Tower";
import Map from "../maps/Map";
import Projectile from "../projectiles/Projectile";

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
type TProjectileName =
  | "one"
  | "levelTwo"
  | "levelThree"
  | "fast"
  | "slow"
  | "boss";
type TProjectileSprite = TPartialRecord<TProjectileName, TImageSprite | null>;
type TTowerSprite = TPartialRecord<TTowerSpriteTypes, ITowerSprite | null>;
export type TTowerSpriteElements =
  | "base"
  | "impact"
  | "levelOneWeapon"
  | "levelOneProjectile"
  | "levelTwoWeapon"
  | "levelTwoProjectile"
  | "levelThreeWeapon"
  | "levelThreeProjectile";
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
  spriteSource: TPartialRecord<TTowerSpriteElements, HTMLImageElement> | null;
  canvasArr: TPartialRecord<TTowerSpriteElements, HTMLCanvasElement[]> | null;
  canvasContextArr: TPartialRecord<
    TTowerSpriteElements,
    CanvasRenderingContext2D[]
  > | null;
  spriteWidth?: number;
  spriteHeight?: number;
  spriteEdgeOffset?: number;
  spriteBetweenOffset?: number;
  framesPerSprite: number;
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
    public waveTimeoutBetweenWaves: IWaveGenerator["waveTimeoutBetweenWaves"] = 500, // 5000
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
      if (iteration === 10) {
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
      } else if (iteration % 10 === 0) {
        // slow enemy
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
      } else if (iteration % 5 === 0) {
        // fast enemy
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
      this.engine.enemies = [
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
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
          hp: 100 + this.waveParams.hpCoefficient * this.waveParams.currentWave,
        }),
      ];

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

  public spawnEnemiesCopy() {
    // fill enemies array
    if (
      this.waveParams.currentWave < this.waveParams.endWave &&
      !this.waveParams.isWaveInProgress
    ) {
      // increment wave
      this.waveParams.currentWave += 1;

      this.engine.enemies = this.repeatEnemy(
        this.waveParams.enemyCount +
          this.waveParams.enemyCountCoefficient * this.waveParams.currentWave,
      );
    }

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
    clearTimeout(this.waveTimerBetweenWaves!);
    this.waveParams.isWaveInProgress = true;
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

export interface ITwoDCoordinates {
  x: number;
  y: number;
}

export interface ITDEngine {
  context?: CanvasRenderingContext2D;
  mapContext?: CanvasRenderingContext2D;
  enemyContext?: CanvasRenderingContext2D;
  deadEnemyContext?: CanvasRenderingContext2D;
  offscreen: OffscreenCanvas | null;
  offscreenContext: OffscreenRenderingContext | null;
  offscreenWorker: Worker | null;
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
  projectileSprites: TProjectileSprite;
  projectileHitSprites: TProjectileSprite;
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
    public projectileSprites: ITDEngine["projectileSprites"] = {},
    public projectileHitSprites: ITDEngine["projectileHitSprites"] = {},
    public mapSprites: ITDEngine["mapSprites"] = [],
    public predefinedTowerParams: ITDEngine["predefinedTowerParams"] = {
      one: {
        towerParams: {
          attackRate: 2000,
          attackDamage: 30,
          attackRange: 300,
          width: 64,
          height: 128,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "green",
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
          width: 22,
          height: 40,
          projectileHitAlive: 120,
          frameLimit: 3,
        },
      },
      two: {
        towerParams: {
          attackRate: 3000,
          attackDamage: 20,
          attackRange: 300,
          width: 64,
          height: 128,
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
          width: 22,
          height: 40,
          projectileHitAlive: 120,
          frameLimit: 3,
        },
      },
      three: {
        towerParams: {
          attackRate: 4000,
          attackDamage: 100,
          attackRange: 300,
          width: 64,
          height: 128,
          rectCenterX: 0,
          rectCenterY: 0,
          strokeStyle: "green",
          firingAngle: 0,
          fireFromCoords: { x: 0, y: 0 },
          price: 65,
        },
        projectileParams: {
          acceleration: 1.2,
          projectileSpeed: 0.25,
          targetX: 0,
          targetY: 0,
          rectCenterX: 0,
          rectCenterY: 0,
          width: 22,
          height: 40,
          projectileHitAlive: 120,
          frameLimit: 3,
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
      speedCoefficient: 0.3,
      strokeStyle: "#000000",
      framesPerSprite: 8,
      fps: 24,
    },
    public waveGenerator: ITDEngine["waveGenerator"] = null,
  ) {
    // set map
    this.setMap(new Map(this));
    // set waveGenerator
    this.waveGenerator = new WaveGenerator(this);
    this.money = this.initialGameParams.money;
    this.lives = this.initialGameParams.lives;
  }

  public restartGame() {
    // clear memory
    this.enemies = [];
    this.deadEnemies = [];
    this.towers = [];
    this.projectiles = [];
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
    this.towerSprites[towerType]!.canvasArr = this.createTowerSpriteCanvasArr(
      this.towerSprites[towerType]!.framesPerSprite,
    );
    // set their render context
    this.towerSprites[towerType]!.canvasContextArr =
      this.createTowerSpriteCanvasContext(
        this.towerSprites[towerType]!.canvasArr,
        towerType,
      );

    for (const [element, source] of Object.entries(
      this.towerSprites[towerType]!.spriteSource!,
    )) {
      source.onload = () => {
        // and draw proper frames in each canvas
        this.drawTowerFrameOnCanvas(
          element as TTowerSpriteElements,
          this.towerSprites[towerType]!.canvasContextArr![
            element as TTowerSpriteElements
          ]!,
          source,
          this.towerSprites[towerType]!.spriteEdgeOffset!,
          this.towerSprites[towerType]!.spriteBetweenOffset!,
          towerType,
        );
        // debug
        /*
        this.towerSprites.one?.canvasArr?.levelOneWeapon!.forEach(
          (canvas, index) => {
            this.towerContext?.beginPath();
            this.towerContext?.drawImage(
              canvas,
              0,
              0,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
              this.map?.mapParams?.gridStep! * index,
              128,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
            );
            this.towerContext?.closePath();
          },
        );
        this.towerSprites.one?.canvasArr?.levelTwoWeapon!.forEach(
          (canvas, index) => {
            this.towerContext?.beginPath();
            this.towerContext?.drawImage(
              canvas,
              0,
              0,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
              this.map?.mapParams?.gridStep! * index,
              192,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
            );
            this.towerContext?.closePath();
          },
        );
        this.towerSprites.one?.canvasArr?.levelThreeWeapon!.forEach(
          (canvas, index) => {
            this.towerContext?.beginPath();
            this.towerContext?.drawImage(
              canvas,
              0,
              0,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
              this.map?.mapParams?.gridStep! * index,
              256,
              this.map?.mapParams?.gridStep!,
              this.map?.mapParams?.gridStep! * 2,
            );
            this.towerContext?.closePath();
          },
        );
        this.towerSprites.one?.canvasArr?.base!.forEach((canvas, index) => {
          this.towerContext?.beginPath();
          this.towerContext?.drawImage(
            canvas,
            0,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep! * 2,
            this.map?.mapParams?.gridStep! * index,
            302,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep! * 2,
          );
          this.towerContext?.closePath();
        });
         */
      };
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
      /*
      this.enemySprites.firebug?.canvasArr?.right!.forEach(
        (cnvs, index) => {
          this.towerContext?.beginPath();
          this.towerContext?.drawImage(
            cnvs,
            0,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep! * index,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep!,
          );
          this.towerContext?.closePath();
        },
      );
       */
    };
  }

  public createCanvasArr(arrLength: number) {
    return Array.from(Array(arrLength), () => document.createElement("canvas"));
  }

  public createTowerSpriteCanvasArr(frames: number) {
    return {
      base: this.createCanvasArr(3),
      // not set yet
      impact: this.createCanvasArr(5),
      levelOneWeapon: this.createCanvasArr(6),
      levelOneProjectile: this.createCanvasArr(4), // 3 frames + copy for rotation canvas
      levelTwoWeapon: this.createCanvasArr(6),
      levelTwoProjectile: this.createCanvasArr(4), // 3 frames + copy for rotation canvas
      levelThreeWeapon: this.createCanvasArr(6),
      levelThreeProjectile: this.createCanvasArr(4), // 3 frames + copy for rotation canvas
    };
  }

  public createTowerSpriteCanvasContext(
    canvasArr: ITowerSprite["canvasArr"],
    towerType: TTowerSpriteTypes,
  ) {
    let contextArr: ITowerSprite["canvasContextArr"] = {
      base: [],
      impact: [],
      levelOneWeapon: [],
      levelOneProjectile: [],
      levelTwoWeapon: [],
      levelTwoProjectile: [],
      levelThreeWeapon: [],
      levelThreeProjectile: [],
    };
    for (const [element, canvasArray] of Object.entries(canvasArr!)) {
      for (const canvas of canvasArray!) {
        // find the widest or longest value of projectile canvas depending on firing angle
        const canvasHypot = Math.ceil(
          Math.hypot(
            this.predefinedTowerParams[towerType]!.projectileParams.width,
            this.predefinedTowerParams[towerType]!.projectileParams?.height,
          ),
        );
        //
        switch (element as TTowerSpriteElements) {
          case "base": {
            canvas.width = this.map?.mapParams?.gridStep!;
            canvas.height = this.map?.mapParams?.gridStep! * 2;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelOneWeapon": {
            canvas.width = this.map?.mapParams?.gridStep!;
            canvas.height = this.map?.mapParams?.gridStep!;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelTwoWeapon": {
            canvas.width = this.map?.mapParams?.gridStep!;
            canvas.height = this.map?.mapParams?.gridStep!;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelThreeWeapon": {
            canvas.width = this.map?.mapParams?.gridStep!;
            canvas.height = this.map?.mapParams?.gridStep!;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelOneProjectile": {
            canvas.width = canvasHypot;
            canvas.height = canvasHypot;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelTwoProjectile": {
            canvas.width = canvasHypot;
            canvas.height = canvasHypot;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "levelThreeProjectile": {
            canvas.width = canvasHypot;
            canvas.height = canvasHypot;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
          case "impact": {
            canvas.width = this.map?.mapParams?.gridStep!;
            canvas.height = this.map?.mapParams?.gridStep!;
            contextArr[element as TTowerSpriteElements]!.push(
              canvas.getContext("2d")!,
            );
            break;
          }
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
    edgeOffset: ITowerSprite["spriteEdgeOffset"],
    betweenOffset: ITowerSprite["spriteBetweenOffset"],
    towerType: TTowerSpriteTypes,
  ) {
    contextArr.forEach((context, index) => {
      // find the widest or longest value of projectile canvas depending on firing angle
      const canvasHypot = Math.ceil(
        Math.hypot(
          this.predefinedTowerParams[towerType]!.projectileParams.width,
          this.predefinedTowerParams[towerType]!.projectileParams?.height,
        ),
      );
      //
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
        case "levelOneWeapon": {
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
            this.map?.mapParams?.gridStep! * 1.5,
          );
          break;
        }
        case "levelTwoWeapon": {
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
            96,
          );
          break;
        }
        case "levelThreeWeapon": {
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
            96,
          );
          break;
        }
        // projectiles
        case "levelOneProjectile": {
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]?.projectileParams?.width! *
              index,
            0,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams?.width!) /
              2,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams
                ?.height!) /
              2,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
          );
          break;
        }
        case "levelTwoProjectile": {
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]?.projectileParams?.width! *
              index,
            0,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams?.width!) /
              2,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams
                ?.height!) /
              2,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
          );
          break;
        }
        case "levelThreeProjectile": {
          this.drawFrame(
            context,
            spriteSource,
            this.predefinedTowerParams[towerType]?.projectileParams?.width! *
              index,
            0,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams?.width!) /
              2,
            (canvasHypot -
              this.predefinedTowerParams[towerType]?.projectileParams
                ?.height!) /
              2,
            this.predefinedTowerParams[towerType]?.projectileParams?.width,
            this.predefinedTowerParams[towerType]?.projectileParams?.height,
          );
          break;
        }
        case "impact": {
          this.drawFrame(
            context,
            spriteSource,
            this.map?.mapParams?.gridStep! * index,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep!,
            0,
            0,
            this.map?.mapParams?.gridStep!,
            this.map?.mapParams?.gridStep!,
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
      this.buildFirstTower();
    }
    if (e.key === "2") {
      this.draftTower = null;
      this.buildSecondTower();
    }
    if (e.key === "3") {
      this.draftTower = null;
      this.buildThirdTower();
    }
    if (e.key === "4") {
      // release all tower target
      for (const tower of this.towers!) {
        tower.target = null;
      }
    }
    if (e.key === "5") {
      // remove all projectiles
      this.projectiles = [];
    }
    if (e.key === "6") {
      // spawn next wave
      this.waveGenerator?.spawnEnemies();
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

  public buildFirstTower = () => {
    if (this.isEnoughMoney(this.towerOneParam!.towerParams.price)) {
      this.isCanBuild = true;
      this.draftTower = new Tower(
        this,
        "one",
        0,
        this.draftBuildCoordinates,
        this.towerOneParam!.towerParams,
        this.towerOneParam!.projectileParams,
      );
    }
  };

  public buildSecondTower = () => {
    if (this.isEnoughMoney(this.towerTwoParam!.towerParams.price)) {
      this.isCanBuild = true;
      this.draftTower = new Tower(
        this,
        "one",
        1,
        this.draftBuildCoordinates,
        this.towerTwoParam!.towerParams,
        this.towerTwoParam!.projectileParams,
      );
    }
  };

  public buildThirdTower = () => {
    if (this.isEnoughMoney(this.towerThreeParam!.towerParams.price)) {
      this.isCanBuild = true;
      this.draftTower = new Tower(
        this,
        "one",
        2,
        this.draftBuildCoordinates,
        this.towerThreeParam!.towerParams,
        this.towerThreeParam!.projectileParams,
      );
    }
  };

  public findClosestTile(coordinates: ITwoDCoordinates) {
    let minDistance = this.map?.mapParams.width;
    for (let tile of this.map?.mapParams.mapTilesArr!) {
      const distance =
        (tile.x -
          coordinates.x! +
          this.map?.mapParams.gridStep! -
          this.map?.mapParams?.tileCenter!) *
          (tile.x -
            coordinates.x! +
            this.map?.mapParams.gridStep! -
            this.map?.mapParams?.tileCenter!) +
        (tile.y -
          coordinates.y! +
          this.map?.mapParams.gridStep! +
          this.map?.mapParams?.tileCenter!) *
          (tile.y -
            coordinates.y! +
            this.map?.mapParams.gridStep! +
            this.map?.mapParams?.tileCenter!);
      if (distance < minDistance!) {
        minDistance = distance;
        this.map!.mapParams.closestTile! = tile!;
      }
    }

    this.draftBuildCoordinates = {
      x: this.map?.mapParams.closestTile.x! + this.map?.mapParams.gridStep!,
      y: this.map?.mapParams.closestTile.y! + this.map?.mapParams.gridStep!,
    };

    return {
      x: this.map?.mapParams.closestTile.x,
      y: this.map?.mapParams.closestTile.y!,
    };
  }

  highlightTile(coords: ITwoDCoordinates) {
    this.context?.beginPath();
    this.context!.strokeStyle = "green";
    this.context?.setLineDash([]);
    this.context?.strokeRect(
      coords.x,
      coords.y,
      this.map?.mapParams.gridStep!,
      this.map?.mapParams.gridStep!,
    );
    this.context?.closePath();
  }

  public canvasMouseMoveCallback = (e: MouseEvent) => {
    this.cursorPosition = { x: e.offsetX, y: e.offsetY };
    this.findClosestTile(this.cursorPosition);
    if (this.isCanBuild) {
      this.draftShowTower();
    }
  };

  public canvasClickCallback = (e: MouseEvent) => {
    this.draftBuildTower();
  };

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
          this.draftTower?.setAttackInterval();

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

  public get towerOneParam() {
    return structuredClone(this.predefinedTowerParams.one);
  }

  public get towerTwoParam() {
    return structuredClone(this.predefinedTowerParams.two);
  }

  public get towerThreeParam() {
    return structuredClone(this.predefinedTowerParams.three);
  }
}

export default TDEngine;
