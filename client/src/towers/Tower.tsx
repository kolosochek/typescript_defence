import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Projectile, {ProjectileI} from "../projectiles/Projectile";
import enemy from "../enemies/Enemy";

export interface TowerI {
    engine: TDEngine
    towerParam: {
        projectileSpeed: number,
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
    }
    image: CanvasImageSource,
}

class Tower {
    public target?: Enemy | null;
    public isCanFire? = false;

    constructor(
        public engine: TowerI['engine'],
        public image?: TowerI['image'],
        public projectileImage?: ProjectileI['image'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public towerParam: TowerI['towerParam'] = {
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
            price: 15,
        },
    ) {
        this.towerParam.rectCenterX = this.towerParam.width / 2
        this.towerParam.rectCenterY = this.towerParam.height / 2

        setInterval(() => {
            this.isCanFire = true;
        }, this.towerParam.attackRate)
    }

    public draw(){
        // save the context
        this.engine.context.save()
        this.engine.context?.beginPath()
        // draw tower object
        if (this.image) {
            this.engine.context.translate(this.currentPosition.x - this.towerParam.rectCenterX, this.currentPosition.y - this.towerParam.rectCenterY);
            this.engine.context.rotate(this.towerParam.firingAngle)
            //this.engine.context?.drawImage(this.image, this.currentPosition.x - this.towerParam.width, this.currentPosition.y - this.towerParam.height, this.towerParam.width, this.towerParam.height)
            this.engine.context?.drawImage(this.image, -this.towerParam.rectCenterX, -this.towerParam.rectCenterY, this.towerParam.width, this.towerParam.height)
        } else {
            this.engine.context.translate(this.currentPosition.x - this.towerParam.rectCenterX, this.currentPosition.y - this.towerParam.rectCenterY);
            this.engine.context.rotate(this.towerParam.firingAngle)
            this.engine.context.strokeStyle = this.towerParam.strokeStyle
            this.engine.context?.strokeRect(
                0 - this.towerParam.rectCenterX,
                0 - this.towerParam.rectCenterY,
                this.towerParam.width,
                this.towerParam.height
            )
        }
        this.engine.context.closePath()
        // restore the context
        this.engine.context.restore()
    }

    public drawTowerRange(){
        this.engine.context?.beginPath()
        this.engine.context!.strokeStyle = 'red'
        // draw tower range
        this.engine.context?.arc(
            this.currentPosition.x - this.towerParam.width / 2,
            this.currentPosition.y - this.towerParam.height / 2,
            this.towerParam.attackRange,
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
        const distance = (enemy.currentPosition.x - this.currentPosition.x + this.towerParam.width)
            * (enemy.currentPosition.x - this.currentPosition.x + this.towerParam.width)
            + (enemy.currentPosition.y - this.currentPosition.y + this.towerParam.height)
            * (enemy.currentPosition.y - this.currentPosition.y + this.towerParam.height)
        if (distance < (this.towerParam.attackRange * this.towerParam.attackRange)) {
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
            // highlight the target
            this.target.enemyParams.strokeStyle = 'yellow'
            if (this.target && !this.isEnemyInRange(this.target!)) {
                this.target.enemyParams.strokeStyle = 'red'
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
        this.towerParam.firingAngle = Math.atan2(yDistance, xDistance) + Math.PI; //* 180 / Math.PI
        // shoot projectiles from sides of the tower
        const distance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
        this.towerParam.firingX = this.currentPosition.x + this.towerParam.attackRange * xDistance / distance;
        this.towerParam.firingY = this.currentPosition.y + this.towerParam.attackRate * yDistance / distance;
    }

    public fire() {
        const fireFromCoordinates = {
            //x: this.towerParam.firingX,
            //y: this.towerParam.firingY,
            x: this.currentPosition.x - this.towerParam.rectCenterX,
            y: this.currentPosition.y - this.towerParam.rectCenterY,
        }
        if (this.isCanFire && this.target) {
            this.engine.projectiles = [
                ...this.engine.projectiles,
                new Projectile(
                    this.engine,
                    this.projectileImage,
                    this.target!,
                    this,
                    this.towerParam.attackDamage,
                    fireFromCoordinates
                )]

            this.isCanFire = false;
        }
    }

    public draftBuildTower(){
        if(this.engine.isCanBuild) {
            this.draw()
            this.drawTowerRange()
        }
    }

    public destroy(){
        this.engine.towers.filter(tower => this !== tower)
    }
}

export default Tower;