import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Projectile from "../projectiles/Projectile";

export interface TowerI {
    engine: TDEngine
    towerParam: Record<string, number>
        attackSpeed: number,
        attackRate: number,
        attackDamage: number,
        attackRange: number,
        width: number,
        height: number,
        rectWidth: number,
}
class Tower {
    public target?: Enemy | null;
    public firingAngle?: number;
    public firingX?: number;
    public firingY?: number;
    constructor(
        public engine:TowerI['engine'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public towerParam: TowerI['towerParam'] = {
            attackSpeed: 100,
            attackRate: 2000,
            attackDamage: 100,
            attackRange: 80,
            width: 20,
            height: 20,
            rectWidth: 0
        },
    ) {
        this.towerParam.rectWidth = this.towerParam.width / 2
    }

    public drawTower(){
        this.engine.context?.beginPath()
        this.engine.context!.strokeStyle = 'red'
        this.engine.context?.strokeRect(
            this.currentPosition.x,
            this.currentPosition.y,
            this.towerParam.width,
            this.towerParam.height
        )
        this.engine.context?.arc(
            this.currentPosition.x + this.towerParam.width / 2,
            this.currentPosition.y + this.towerParam.height / 2,
            this.towerParam.attackRange,
            0,
            360
        )
        this.engine.context?.stroke()
        this.engine.context?.closePath()
    }
    public isEnemyInRange(enemy: Enemy){
            const distance = (enemy.currentPosition.x-this.currentPosition.x)*(enemy.currentPosition.x-this.currentPosition.x+this.towerParam.rectWidth)+(enemy.currentPosition.y-this.currentPosition.y)*(enemy.currentPosition.y-this.currentPosition.y+this.towerParam.rectWidth);
            if (distance < (this.towerParam.attackRange*this.towerParam.attackRange)) {
                this.target = enemy
                // debug
                console.log(this.target)
                console.log(`this.target`)
                //
                return true
            }
            return false
    }

    public findTarget(){
        if (!this.target){
            if(this.target && !this.isEnemyInRange(this.target!)) {
                this.target = null;
            } else {
                this.engine.enemies?.forEach((enemy) => {
                    return this.isEnemyInRange(enemy)
                })
            }
            return false
        }
    }

    public findTargetVector(){
        // there is no spoon, Neo
        if (!this.target) {
            return false;
        }
        const xDistance = this.target.currentPosition.x-this.currentPosition.x;
        const yDistance = this.target.currentPosition.y-this.currentPosition.y;
        const distance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
        this.firingAngle = Math.atan2(yDistance, xDistance) + Math.PI / 2;
        this.firingX = this.currentPosition.x + this.towerParam.attackRange * xDistance / distance; //where turret ends and bullets start
        this.firingY = this.currentPosition.y + this.towerParam.attackRate * yDistance / distance;
    }

    public fire() {
        const projectile = new Projectile(
            this.engine,
            this.firingX!,
            this.firingY!,
            this.target!,
            this.towerParam.attackDamage,
            this.currentPosition
        )
        setInterval(() => {
            this.engine.projectiles?.push(projectile)
            projectile.move()
        }, this.towerParam.attackSpeed)
        
        // debug
        console.log(this.engine.projectiles)
        console.log(`this.engine.projectiles`)
        //
    }

    public shootToCoords(){}
}

export default Tower;