import Enemy from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";
import Map from "../maps/Map";
import Projectile from "../projectiles/Projectile";

// utilities declaration
type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

// types declaration
type TowerNameT = "levelOne" | "levelTwo" | "levelThree"
type TowerSpriteT = PartialRecord<TowerNameT, ImageSpriteT | null>
type EnemySpriteT = PartialRecord<TowerNameT, ImageSpriteT | null>
type ProjectileSpriteT = PartialRecord<TowerNameT, ImageSpriteT | null>
type ImageSpriteT = CanvasImageSource


// interfaces declaration
export interface WaveGeneratorI {
    waveParams: {
        currentWave: number,
        isWaveInProgress: boolean,
        hpCoefficient: number,
        speedCoefficient: number,
        enemyBountyCoefficient: number,
        enemyCountCoefficient: number,
        endWave: number,
        startWave: number,
        enemyCount: number,
    }
    waveTimerBetweenWaves: NodeJS.Timer,
    waveTimeoutBetweenWaves: number,
}

class WaveGenerator {
    constructor(
        public engine: TDEngine,
        public isInitialized: boolean = false,
        public waveParams: WaveGeneratorI["waveParams"] = {
            currentWave: 1,
            isWaveInProgress: false,
            hpCoefficient: 20,
            speedCoefficient: 0.05,
            enemyBountyCoefficient: 2,
            enemyCountCoefficient: 5,
            endWave: 10,
            startWave: 1,
            enemyCount: 15,
        },
        public waveTimerBetweenWaves: WaveGeneratorI["waveTimerBetweenWaves"] = null,
        public waveTimeoutBetweenWaves: WaveGeneratorI["waveTimeoutBetweenWaves"] = 5000,
    ) {

    }

    public repeatEnemy = (times) => {
        let enemiesArray = []
        for (let iteration = 0; iteration < times; iteration++) {
            enemiesArray.push(
                new Enemy(
                    this.engine,
                    this.engine.enemySprites.levelOne,
                    {
                        width: 20,
                        height: 20,
                        spaceBetweenEnemies: 35,
                        speed: 0.65 + (this.waveParams.speedCoefficient * this.waveParams.currentWave),
                        bounty: 5 + (this.waveParams.enemyBountyCoefficient * this.waveParams.currentWave),
                        hp: 100 + (this.waveParams.hpCoefficient * this.waveParams.currentWave),
                        strokeStyle: 'red',
                        rectCenterX: 0,
                        rectCenterY: 0,
                    }
                )
            )
        }
        return enemiesArray
    }

    public init() {
        if (!this.isInitialized) {
            // fill enemies array
            const enemiesArray = this.repeatEnemy(this.waveParams.enemyCount + (this.waveParams.enemyCountCoefficient * this.waveParams.currentWave))
            this.engine.enemies = [...enemiesArray]

            // draw enemies
            this.engine.enemies?.forEach((enemy, index) => {
                enemy.drawEnemy({
                    x: -enemy.enemyParams.spaceBetweenEnemies * this.engine.enemies?.length! + (index * enemy.enemyParams.spaceBetweenEnemies),
                    y: 0
                })
            })

            this.isInitialized = true;
            this.waveParams.currentWave = 1;
            this.waveParams.isWaveInProgress = true;
        }
    }

    public spawnEnemies() {
        // fill enemies array
        if (this.waveParams.currentWave < this.waveParams.endWave && !this.waveParams.isWaveInProgress) {
            // increment wave
            this.waveParams.currentWave += 1

            // debug
            console.log('current wave')
            console.log(this.waveParams.currentWave)
            //

            const enemiesArray = this.repeatEnemy(this.waveParams.enemyCount + (this.waveParams.enemyCountCoefficient * this.waveParams.currentWave))
            this.engine.enemies = [...enemiesArray]
        }

        // draw enemies
        this.engine.enemies?.forEach((enemy, index) => {
            enemy.drawEnemy({
                x: -enemy.enemyParams.spaceBetweenEnemies * this.engine.enemies?.length! + (index * enemy.enemyParams.spaceBetweenEnemies),
                y: 0
            })
        })

        // increment wave
        this.waveTimerBetweenWaves = null
        this.waveParams.isWaveInProgress = true
    }

}

export interface twoDCoordinatesI {
    x: number,
    y: number,
}

export interface TDEngineI {
    context?: CanvasRenderingContext2D,
    enemies?: Enemy[],
    towers?: Tower[],
    projectiles?: Projectile[],
    map?: Map,
    animationFrameId?: number,
    requestIdleCallback: number,
    twoDCoordinates: twoDCoordinatesI,
    lives: number,
    score: number,
    money: number,
    isCanBuild: boolean,
    isGameStarted: boolean,
    isShowGrid: boolean,
    isNotEnoughMoney: boolean,
    canvasMouseMoveEvent: EventListener | null,
    draftTower: Tower | null,
    cursorPosition: twoDCoordinatesI,
    towerSprites: TowerSpriteT,
    projectileSprites: ProjectileSpriteT,
    projectileHitSprites: ProjectileSpriteT,
    enemySprites: EnemySpriteT,
    mapSprites: ImageSpriteT[],
    predefinedTowerParams: {
        levelOne: {
            towerParams: TowerI["towerParams"],
            projectileParams: TowerI["projectileParams"]
        },
        levelTwo: {
            towerParams: TowerI["towerParams"],
            projectileParams: TowerI["projectileParams"]
        },
        levelThree: {
            towerParams: TowerI["towerParams"],
            projectileParams: TowerI["projectileParams"]
        },
    },
    waveGenerator: WaveGenerator | null,
}

class TDEngine {
    constructor(
        public context?: TDEngineI['context'],
        public enemies: TDEngineI['enemies'] = [],
        public towers: TDEngineI['towers'] = [],
        public projectiles: TDEngineI['projectiles'] = [],
        public map?: TDEngineI['map'],
        public idleTimeout?: number,
        public animationFrameId: TDEngineI['animationFrameId'] = 0,
        public requestIdleCallback: TDEngineI['requestIdleCallback'] = 0,
        public lives: TDEngineI["lives"] = 10,
        public score: TDEngineI["score"] = 0,
        public money: TDEngineI["money"] = 200,
        public isCanBuild: TDEngineI["isCanBuild"] = false,
        public isGameStarted: TDEngineI["isGameStarted"] = false,
        public isShowGrid: TDEngineI["isShowGrid"] = false,
        public isNotEnoughMoney: TDEngineI["isNotEnoughMoney"] = false,
        public draftTower: TDEngineI["draftTower"] = null,
        public cursorPosition: TDEngineI['cursorPosition'] = {x: 0, y: 0},
        public draftBuildCoordinates: twoDCoordinatesI = {x: 0, y: 0},
        public towerSprites: TDEngineI["towerSprites"] = {},
        public enemySprites: TDEngineI["enemySprites"] = {},
        public projectileSprites: TDEngineI["projectileSprites"] = {},
        public projectileHitSprites: TDEngineI["projectileHitSprites"] = {},
        public mapSprites: TDEngineI["mapSprites"] = [],
        public predefinedTowerParams: TDEngineI["predefinedTowerParams"] = {
            levelOne: {
                towerParams: {
                    attackRate: 1000,
                    attackDamage: 30,
                    attackRange: 120,
                    width: 30,
                    height: 30,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    strokeStyle: 'red',
                    firingAngle: 0,
                    firingX: 0,
                    firingY: 0,
                    price: 25,
                },
                projectileParams: {
                    acceleration: 1.2,
                    projectileSpeed: 0.2,
                    targetX: 0,
                    targetY: 0,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    width: 10,
                    height: 10,
                    projectileHitAlive: 100,
                }
            },
            levelTwo: {
                towerParams: {
                    attackRate: 300,
                    attackDamage: 20,
                    attackRange: 60,
                    width: 30,
                    height: 30,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    strokeStyle: 'red',
                    firingAngle: 0,
                    firingX: 0,
                    firingY: 0,
                    price: 45,
                },
                projectileParams: {
                    acceleration: 1.2,
                    projectileSpeed: 0.2,
                    targetX: 0,
                    targetY: 0,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    width: 10,
                    height: 10,
                    projectileHitAlive: 70,
                }
            },
            levelThree: {
                towerParams: {
                    attackRate: 4000,
                    attackDamage: 100,
                    attackRange: 250,
                    width: 30,
                    height: 30,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    strokeStyle: 'red',
                    firingAngle: 0,
                    firingX: 0,
                    firingY: 0,
                    price: 65,
                },
                projectileParams: {
                    acceleration: 1.2,
                    projectileSpeed: 0.25,
                    targetX: 0,
                    targetY: 0,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    width: 10,
                    height: 10,
                    projectileHitAlive: 200,
                }
            },
        },
        public waveGenerator: TDEngineI['waveGenerator'] = null,
    ) {
        this.waveGenerator = new WaveGenerator(this)
        this.idleTimeout = 250;
    }

    public restartGame(){
        this.enemies = []
        this.towers = []
        this.projectiles = []
        this.money = 200
        this.lives = 10
        this.score = 0
        this.waveGenerator.isInitialized = false
    }

    public clearMemory(){
        this.enemies = []
        this.projectiles = []
        for (let tower of this.towers){
            tower.target = null
        }
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
            if (!this.isCanBuild) {
                this.buildFirstTower()
            }
        }
        if (e.key === "2") {
            if (!this.isCanBuild) {
                this.buildSecondTower()
            }
        }
        if (e.key === "3") {
            if (!this.isCanBuild) {
                this.buildThirdTower()
            }
        }
        if (e.key === "4") {
        }
        // log mode
        if (e.key === "0") {
            // debug
            console.log('this.enemies')
            console.log(this.enemies)
            console.log(this.enemies.length)
            console.log('----')
            console.log(`this.towers`)
            console.log(this.towers)
            console.log(this.towers.length)
            console.log('----')
            console.log(`this.projectiles`)
            console.log(this.projectiles)
            console.log(this.projectiles.length)
            console.log('---')
            console.log(`this.lives`)
            console.log(this.lives)
            console.log(`this.money`)
            console.log(this.money)
            console.log('---')
            console.log(`this.waveGenerator.waveParams`)
            console.log(this.waveGenerator.waveParams)
            console.log('---')
            //
        }
    }

    public buildFirstTower = () => {
        this.isCanBuild = true
        this.draftTower = new Tower(
            this,
            this.towerSprites.levelOne,
            this.projectileSprites.levelOne,
            this.projectileHitSprites.levelOne,
            this.draftBuildCoordinates,
            this.towerOneParam.towerParams,
            this.towerOneParam.projectileParams
        )
    }

    public buildSecondTower = () => {
        this.isCanBuild = true
        this.draftTower = new Tower(
            this,
            this.towerSprites.levelTwo,
            this.projectileSprites.levelTwo,
            this.projectileHitSprites.levelTwo,
            this.draftBuildCoordinates,
            this.towerTwoParam.towerParams,
            this.towerTwoParam.projectileParams,
        )
    }

    public buildThirdTower = () => {
        this.isCanBuild = true
        this.draftTower = new Tower(
            this,
            this.towerSprites.levelThree,
            this.projectileSprites.levelThree,
            this.projectileHitSprites.levelThree,
            this.draftBuildCoordinates,
            this.towerThreeParam.towerParams,
            this.towerThreeParam.projectileParams,
        )
    }

    public findClosestTile(coordinates: twoDCoordinatesI) {
        let minDistance = this.map.mapParams.width;
        for (let tile of this.map.mapParams.mapTilesArr) {
            const distance = (tile.x - coordinates.x + this.map.mapParams.gridStep)
                * (tile.x - coordinates.x + this.map.mapParams.gridStep)
                + (tile.y - coordinates.y + this.map.mapParams.gridStep)
                * (tile.y - coordinates.y + this.map.mapParams.gridStep)
            if (distance <= minDistance) {
                minDistance = distance
                this.map.mapParams.closestTile = tile
            }
        }

        this.draftBuildCoordinates = {
            x: this.map.mapParams.closestTile.x + this.map.mapParams.gridStep,
            y: this.map.mapParams.closestTile.y + this.map.mapParams.gridStep,
        }

        return {
            x: this.map.mapParams.closestTile.x,
            y: this.map.mapParams.closestTile.y
        }
    }

    highlightTile(coords:twoDCoordinatesI){
        this.context.beginPath()
        this.context.strokeStyle = 'green'
        this.context.setLineDash([])
        this.context.strokeRect(coords.x, coords.y, this.map.mapParams.gridStep, this.map.mapParams.gridStep)
        this.context.closePath()
    }

    public canvasMouseMoveCallback = (e: MouseEvent) => {
        this.cursorPosition = {x: e.pageX, y: e.pageY}
        this.map.mapParams.closestTile = this.findClosestTile(this.cursorPosition)
        this.draftShowTower()
    }

    public canvasClickCallback = (e: MouseEvent) => {
        this.draftBuildTower()
    }

    public gameWindowKeydown = (e: KeyboardEvent) => {
        this.manageHotkeys(e)
    }

    public draftShowTower() {
        if (this.isCanBuild) {
            // show building grid
            //this.isShowGrid = true

            if (!this.draftTower) {
                this.draftTower = new Tower(this, undefined, undefined, undefined, this.draftBuildCoordinates)
            } else {
                this.draftTower.currentPosition = this.draftBuildCoordinates
            }
        }
    }

    public draftBuildTower() {
        if (this.isCanBuild) {
            if (this.money >= this.draftTower.towerParams.price) {
                this.isNotEnoughMoney = false

                let isTileFound = false
                for(const tile of this.map.mapParams.mapTilesArr){
                    if (tile.x === this.map.mapParams.closestTile.x && tile.y === this.map.mapParams.closestTile.y) {
                        isTileFound = true
                    }

                }

                if (isTileFound){
                    // show building grid
                    //this.isShowGrid = true

                    if (!this.draftTower) {
                        this.draftTower = new Tower(this, undefined, undefined, undefined, this.draftBuildCoordinates)
                    } else {
                        this.draftTower.currentPosition = this.draftBuildCoordinates
                    }

                    // add new tower
                    this.towers = [
                        ...this.towers,
                        this.draftTower
                    ]

                    // enable attack timer
                    this.draftTower.setAttackInterval()

                    // pop chosen tile from available space to build
                    this.map.mapParams.mapTilesArr = this.map.mapParams.mapTilesArr.filter(tile => {
                        return tile.x !== this.map.mapParams.closestTile.x || tile.y !== this.map.mapParams.closestTile.y
                    })
                    // disable building mode
                    this.isCanBuild = false;
                    this.money -= this.draftTower.towerParams.price
                    this.draftTower = null
                    //this.map.mapParams.closestTile = this.findClosestTile(this.cursorPosition)
                }
            } else {
                this.isNotEnoughMoney = true
            }
        }
    }

    public clearCanvas() {
        // clear canvas
        this.context?.clearRect(0, 0, this.map?.mapParams.width!, this.map?.mapParams.height!)
    }

    public setContext(context: TDEngineI['context']) {
        this.context = context
    }

    public setMap(map: TDEngineI['map']) {
        this.map = map
    }

    public setEnemies(enemies: TDEngineI['enemies']) {
        this.enemies = enemies
    }

    public setTowers(towers: TDEngineI['towers']) {
        this.towers = towers
    }

    public setProjectiles(projectiles: TDEngineI['projectiles']) {
        this.projectiles = projectiles
    }

    public pushProjectile(projectile: Projectile) {
        this.projectiles?.push(projectile)
    }

    public get towerOneParam() {
        return JSON.parse(JSON.stringify(this.predefinedTowerParams.levelOne))
    }

    public get towerTwoParam() {
        return JSON.parse(JSON.stringify(this.predefinedTowerParams.levelTwo))
    }

    public get towerThreeParam() {
        return JSON.parse(JSON.stringify(this.predefinedTowerParams.levelThree))
    }
}

export default TDEngine