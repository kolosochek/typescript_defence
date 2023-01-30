import Enemy, {EnemyI} from "../enemies/Enemy";
import Tower from "../towers/Tower";
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
}

class TDEngine {
    constructor(
        public context?: TDEngineI['context'],
        public enemies?: TDEngineI['enemies'],
        public towers?: TDEngineI['towers'],
        public projectiles?: TDEngineI['projectiles'],
        public map?: TDEngineI['map'],
        public idleTimeout?: number,
        public animationFrameId?: TDEngineI['animationFrameId'],
        public requestIdleCallback?: TDEngineI['requestIdleCallback'],
        public lives: TDEngineI["lives"] = 10,
        public score: TDEngineI["score"] = 0,
        public money: TDEngineI["money"] = 100,
    ) {
        this.idleTimeout = 250;
        this.projectiles = []
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
}

export default TDEngine