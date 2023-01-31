import Enemy, {EnemyI} from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";
import Map from "../maps/Map";
import Projectile from "../projectiles/Projectile";

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
    canvasMouseMoveEvent: EventListener | null,
    draftTower: Tower | null,
    cursorPosition: twoDCoordinatesI,
}

class TDEngine {
    constructor(
        public context?: TDEngineI['context'],
        public enemies: TDEngineI['enemies'] = [],
        public towers: TDEngineI['towers'] = [],
        public projectiles: TDEngineI['projectiles'] = [],
        public map?: TDEngineI['map'],
        public idleTimeout?: number,
        public animationFrameId?: TDEngineI['animationFrameId'],
        public requestIdleCallback?: TDEngineI['requestIdleCallback'],
        public lives: TDEngineI["lives"] = 10,
        public score: TDEngineI["score"] = 0,
        public money: TDEngineI["money"] = 100,
        public isCanBuild: TDEngineI["isCanBuild"] = false,
        public isGameStarted: TDEngineI["isGameStarted"] = false,
        public draftTower: TDEngineI["draftTower"] = null,
        public levelOneTowerParam: TowerI["towerParam"] = {
            projectileSpeed: 100,
            attackRate: 1000,
            attackDamage: 30,
            attackRange: 120,
            width: 40,
            height: 40,
            rectCenterX: 0,
            rectCenterY: 0,
            strokeStyle: 'red',
            firingAngle: 0,
            firingX: 0,
            firingY: 0,
            price: 25,
        },
        public levelTwoTowerParam: TowerI["towerParam"] = {
            projectileSpeed: 50,
            attackRate: 300,
            attackDamage: 20,
            attackRange: 60,
            width: 40,
            height: 40,
            rectCenterX: 0,
            rectCenterY: 0,
            strokeStyle: 'red',
            firingAngle: 0,
            firingX: 0,
            firingY: 0,
            price: 45,
        },
        public cursorPosition: TDEngineI['cursorPosition'] = {x: 0, y: 0}
    ) {
        this.idleTimeout = 250;
    }

    public draftShowTower(currentPosition: twoDCoordinatesI) {
        this.cursorPosition = currentPosition

        if (this.isCanBuild) {
            console.log(`isCanBuild ${currentPosition.x}:${currentPosition.y}`)
            if (!this.draftTower) {
                this.draftTower = new Tower(this, undefined, undefined, {x: currentPosition.x, y: currentPosition.y})
            } else {
                this.draftTower.currentPosition = currentPosition
            }
        }
    }

    public draftBuildTower(currentPosition: twoDCoordinatesI) {
        if (this.isCanBuild && this.money >= this.draftTower.towerParam.price) {
            // debug
            //console.log(`draftBuildTower ${currentPosition.x}:${currentPosition.y}`)
            //
            if (!this.draftTower) {
                this.draftTower = new Tower(this, undefined, undefined, {x: currentPosition.x, y: currentPosition.y})
            } else {
                this.draftTower.currentPosition = currentPosition
            }
            this.towers = [
                ...this.towers,
                this.draftTower
            ]
            // disable building mode
            this.isCanBuild = false;
            this.money -= this.draftTower.towerParam.price
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

    public get towerOneParam(){
        return JSON.parse(JSON.stringify(this.levelOneTowerParam))
    }
    public get towerTwoParam(){
        return JSON.parse(JSON.stringify(this.levelTwoTowerParam))
    }
}

export default TDEngine