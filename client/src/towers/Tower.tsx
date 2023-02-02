import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Projectile, {ProjectileI} from "../projectiles/Projectile";

export interface TowerI {
    engine: TDEngine
    towerParams: {
        attackRate: number,
        attackDamage: number,
        attackRange: number,
        width: number,
        height: number,
        rectCenterX: number,
        rectCenterY: number,
        strokeStyle: string,
        firingAngle: number,
        firingX: number,
        firingY: number,
        price?: number,
    },
    projectileParams: {
        projectileSpeed: number,
        targetX: number,
        targetY: number,
        rectCenterX: number,
        rectCenterY: number,
        width: number,
        height: number,
        projectileHitAlive: number,
    },
    image: CanvasImageSource,
    attackIntervalTimer: NodeJS.Timer | null
}

class Tower {
    public target?: Enemy | null;
    public isCanFire? = false;

    constructor(
        public engine: TowerI['engine'],
        public image?: TowerI['image'],
        public projectileImage?: ProjectileI['image'],
        public projectileHitImage?: ProjectileI['image'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public towerParams: TowerI['towerParams'] = {
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
            price: 15,
        },
        public projectileParams: TowerI['projectileParams'] = {
            projectileSpeed: 0.1,
            targetX: 0,
            targetY: 0,
            rectCenterX: 0,
            rectCenterY: 0,
            width: 10,
            height: 10,
            projectileHitAlive: 100,
        },
        public attackIntervalTimer: TowerI['attackIntervalTimer'] = null
    ) {
        this.towerParams.rectCenterX = this.towerParams.width / 2
        this.towerParams.rectCenterY = this.towerParams.height / 2


    }

    public draw() {
        // save the context
        this.engine.context.save()
        this.engine.context?.beginPath()
        // draw tower object
        if (this.image) {
            this.engine.context.translate(this.currentPosition.x - this.towerParams.rectCenterX, this.currentPosition.y - this.towerParams.rectCenterY);
            this.engine.context.rotate(this.towerParams.firingAngle)
            //this.engine.context?.drawImage(this.image, this.currentPosition.x - this.towerParams.width, this.currentPosition.y - this.towerParams.height, this.towerParams.width, this.towerParams.height)
            this.engine.context?.drawImage(this.image, -this.towerParams.rectCenterX, -this.towerParams.rectCenterY, this.towerParams.width, this.towerParams.height)
        } else {
            this.engine.context.translate(this.currentPosition.x - this.towerParams.rectCenterX, this.currentPosition.y - this.towerParams.rectCenterY);
            this.engine.context.rotate(this.towerParams.firingAngle)
            this.engine.context.strokeStyle = this.towerParams.strokeStyle
            this.engine.context?.strokeRect(
                0 - this.towerParams.rectCenterX,
                0 - this.towerParams.rectCenterY,
                this.towerParams.width,
                this.towerParams.height
            )
        }
        this.engine.context.closePath()
        // restore the context
        this.engine.context.restore()
    }

    public setAttackInterval = () => {
        // initial build fire
        this.isCanFire = true;
        // then set attack interval
        this.attackIntervalTimer = setInterval(() => {
            this.isCanFire = true;
        }, this.towerParams.attackRate)
    }

    public drawTowerRange() {
        this.engine.context?.beginPath()
        this.engine.context.lineWidth = 0.75
        this.engine.context.setLineDash([5, 15])
        this.engine.context!.strokeStyle = '#000'
        // draw tower range
        this.engine.context?.arc(
            this.currentPosition.x - this.towerParams.width / 2,
            this.currentPosition.y - this.towerParams.height / 2,
            this.towerParams.attackRange,
            0,
            360
        )
        this.engine.context?.stroke()
        this.engine.context?.closePath()
    }

    public drawTower() {
        // draw tower 2d representation
        this.draw()
        // draw tower range
        this.drawTowerRange()
    }

    public isEnemyInRange(enemy: Enemy) {
        const distance = (enemy.currentPosition.x - this.currentPosition.x + this.towerParams.width)
            * (enemy.currentPosition.x - this.currentPosition.x + this.towerParams.width)
            + (enemy.currentPosition.y - this.currentPosition.y + this.towerParams.height)
            * (enemy.currentPosition.y - this.currentPosition.y + this.towerParams.height)
        if (distance < (this.towerParams.attackRange * this.towerParams.attackRange)) {
            this.target = enemy
            return true
        }
        return false
    }

    public findTarget() {
        if (!this.target) {
            this.engine.enemies?.forEach((enemy) => {
                return this.isEnemyInRange(enemy)
            })
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
        this.towerParams.firingAngle = Math.atan2(yDistance, xDistance) + Math.PI; //* 180 / Math.PI
        // shoot projectiles from sides of the tower
        const distance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
        this.towerParams.firingX = this.currentPosition.x + this.towerParams.attackRange * xDistance / distance;
        this.towerParams.firingY = this.currentPosition.y + this.towerParams.attackRate * yDistance / distance;
    }

    public fire() {
        const fireFromCoordinates = {
            //x: this.towerParams.firingX,
            //y: this.towerParams.firingY,
            x: this.currentPosition.x - this.towerParams.rectCenterX,
            y: this.currentPosition.y - this.towerParams.rectCenterY,
        }
        if (this.isCanFire && this.target) {
            this.engine.projectiles = [
                ...this.engine.projectiles,
                new Projectile(
                    this.engine,
                    this.projectileImage,
                    this.target!,
                    this,
                    this.towerParams.attackDamage,
                    fireFromCoordinates
                )]

            this.isCanFire = false;
        }
    }

    public draftBuildTower() {
        if (this.engine.isCanBuild) {
            this.draw()
            this.drawTowerRange()
        }
    }

    public destroy() {
        this.engine.towers.filter(tower => this !== tower)
    }
}

export default Tower;