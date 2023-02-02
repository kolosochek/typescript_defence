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
    }
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
        public money: TDEngineI["money"] = 100,
        public isCanBuild: TDEngineI["isCanBuild"] = false,
        public isGameStarted: TDEngineI["isGameStarted"] = false,
        public isShowGrid: TDEngineI["isShowGrid"] = false,
        public draftTower: TDEngineI["draftTower"] = null,
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
                    projectileSpeed: 0.1,
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
                    projectileSpeed: 0.1,
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
                    projectileSpeed: 0.3,
                    targetX: 0,
                    targetY: 0,
                    rectCenterX: 0,
                    rectCenterY: 0,
                    width: 6,
                    height: 6,
                    projectileHitAlive: 200,
                }
            },
        },
        public cursorPosition: TDEngineI['cursorPosition'] = {x: 0, y: 0},
        public draftBuildCoordinates: twoDCoordinatesI = {x: 0, y: 0}
    ) {
        this.idleTimeout = 250;
    }

    public manageHotkeys(e:KeyboardEvent){
        // cancel building mode
        if(e.key === "Escape") {
            if(this.isCanBuild){
                this.isCanBuild = false;
                this.isShowGrid = false;
            }
        }
    }

    public findClosestTile(coordinates: twoDCoordinatesI){
        let minDistance = this.map.mapParams.width;
        for(let tile of this.map.mapParams.mapTilesArr){
            const distance = (tile.x - coordinates.x + this.map.mapParams.gridStep)
                * (tile.x - coordinates.x + this.map.mapParams.gridStep)
                + (tile.y - coordinates.y + this.map.mapParams.gridStep)
                * (tile.y - coordinates.y + this.map.mapParams.gridStep)
            if(distance < minDistance){
                minDistance = distance
                this.map.mapParams.closestTile = tile
            }
        }

        return {
            x: this.map.mapParams.closestTile.x + this.map.mapParams.gridStep,
            y: this.map.mapParams.closestTile.y + this.map.mapParams.gridStep
        }
    }

    public draftShowTower(currentPosition: twoDCoordinatesI) {
        this.cursorPosition = currentPosition

        if (this.isCanBuild) {
            // debug
            console.log(`this.findClosestTile(currentPosition)`)
            console.log(this.findClosestTile(currentPosition))
            //
            this.draftBuildCoordinates = this.findClosestTile(currentPosition)

            this.isShowGrid = true
            if (!this.draftTower) {
                this.draftTower = new Tower(this, undefined, undefined, undefined, this.draftBuildCoordinates)
            } else {
                this.draftTower.currentPosition = this.draftBuildCoordinates
            }
        }
    }

    public draftBuildTower(currentPosition: twoDCoordinatesI) {
        if (this.isCanBuild && this.money >= this.draftTower.towerParams.price) {
            this.isShowGrid = false
            if (!this.draftTower) {
                this.draftTower = new Tower(this, undefined, undefined, undefined,{x: currentPosition.x, y: currentPosition.y})
            } else {
                this.draftTower.currentPosition = this.draftBuildCoordinates
            }
            this.towers = [
                ...this.towers,
                this.draftTower
            ]
            // enable attack timer
            this.draftTower.setAttackInterval()
            // pop chosen tile from available space to build
            this.map.mapParams.mapTilesArr = [...this.map.mapParams.mapTilesArr.filter(tile => tile !== this.map.mapParams.closestTile)]
            // disable building mode
            this.isCanBuild = false;
            this.money -= this.draftTower.towerParams.price
            this.draftTower = null;

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