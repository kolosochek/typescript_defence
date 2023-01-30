import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Projectile from "../projectiles/Projectile";
import enemy from "../enemies/Enemy";

export interface TowerI {
    engine: TDEngine
    towerParam: Record<string, number>
    attackSpeed: number,
    attackRate: number,
    attackDamage: number,
    attackRange: number,
    firingAngle: number,
    width: number,
    height: number,
    rectCenterX: number,
    rectCenterY: number,
    image: CanvasImageSource,
}

class Tower {
    public target?: Enemy | null;
    public firingX?: number;
    public firingY?: number;

    constructor(
        public engine: TowerI['engine'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public image?: TowerI['image'],
        public towerParam: TowerI['towerParam'] = {
            attackSpeed: 100,
            attackRate: 2000,
            attackDamage: 100,
            attackRange: 80,
            width: 20,
            height: 20,
            rectCenterX: 0,
            rectCenterY: 0,
            firingAngle: 0,
        },
    ) {
        this.towerParam.rectCenterX = this.towerParam.width / 2
        this.towerParam.rectCenterY = this.towerParam.height / 2
    }

    public drawTower() {
        this.engine.context?.beginPath()
        // draw tower range
        this.engine.context?.arc(
            this.currentPosition.x - this.towerParam.width / 2,
            this.currentPosition.y - this.towerParam.height / 2,
            this.towerParam.attackRange,
            0,
            360
        )
        this.engine.context?.stroke()
        this.engine.context!.strokeStyle = 'red'
        this.engine.context?.closePath()
        // save the context
        this.engine.context.save()
        // rotate the tower facing the enemy
        this.engine.context.translate(this.currentPosition.x - (this.towerParam.width / 2), this.currentPosition.y - (this.towerParam.height / 2));
        this.engine.context.rotate(this.towerParam.firingAngle)
        // draw tower object
        if (this.image) {
            this.engine.context?.drawImage(this.image, this.currentPosition.x, this.currentPosition.y)
        } else {
            this.engine.context?.strokeRect(
                0 - (this.towerParam.width / 2),
                0 - (this.towerParam.height / 2),
                //this.currentPosition.x,
                //this.currentPosition.y,
                this.towerParam.width,
                this.towerParam.height
            )
        }
        // restore the context
        this.engine.context.restore()
    }

    public isEnemyInRange(enemy: Enemy) {
        const distance = (enemy.currentPosition.x - this.currentPosition.x)
            * (enemy.currentPosition.x - this.currentPosition.x + this.towerParam.rectCenterX)
            + (enemy.currentPosition.y - this.currentPosition.y)
            * (enemy.currentPosition.y - this.currentPosition.y + this.towerParam.rectCenterY)
        if (distance < (this.towerParam.attackRange * this.towerParam.attackRange)) {
            this.target = enemy
            return true
        }
        return false
    }

    public findTarget() {
        if (!this.target) {
            if (this.target && !this.isEnemyInRange(this.target!)) {
                this.target = null;
            } else {
                this.engine.enemies?.forEach((enemy) => {
                    return this.isEnemyInRange(enemy)
                })
            }
        } else {
            if (this.target && !this.isEnemyInRange(this.target!)) {
                this.target = null;
            }
        }
    }

    public findTargetVector() {
        // there is no spoon, Neo
        if (!this.target) {
            return;
        }
        const xDistance = this.target.currentPosition.x - this.currentPosition.x;
        const yDistance = this.target.currentPosition.y - this.currentPosition.y;
        const distance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
        this.towerParam.firingAngle = Math.atan2(yDistance, xDistance) + Math.PI / 2; //* 180 / Math.PI
        this.firingX = this.currentPosition.x + this.towerParam.attackRange * xDistance / distance;
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
        this.engine.pushProjectile(projectile)
    }

    public shootToCoords() {
    }
}

export default Tower;