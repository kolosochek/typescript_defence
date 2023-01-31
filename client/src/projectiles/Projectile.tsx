import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";

export interface ProjectileI {
    engine: TDEngine,
    image: CanvasImageSource,
    projectileParams?: {
        projectileSpeed: number,
        targetX: twoDCoordinatesI["x"],
        targetY: twoDCoordinatesI["y"],
        rectCenterX: number,
        rectCenterY: number,
        width: number,
        height: number,
    }
}

class Projectile {
    constructor(
        public engine: ProjectileI['engine'],
        public image: ProjectileI['image'],
        public target: Enemy | null,
        public tower: Tower,
        public damage: TowerI['towerParam']['attackDamage'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public projectileParams: ProjectileI['projectileParams'] = {
            projectileSpeed: 0.1,
            targetX: 0,
            targetY: 0,
            rectCenterX: 0,
            rectCenterY: 0,
            width: 10,
            height: 10,
        },
        public distanceMoved = 0
    ) {
        this.projectileParams.rectCenterX = this.projectileParams.width / 2
        this.projectileParams.rectCenterY = this.projectileParams.height / 2
    }

    public draw() {
        this.engine.context.beginPath()
        if (this.image) {
            this.engine.context?.drawImage(this.image, this.currentPosition.x, this.currentPosition.y, this.projectileParams.width, this.projectileParams.height)
        } else {
            this.engine.context.strokeStyle = 'black';
            this.engine.context.strokeRect(
                this.currentPosition.x,
                this.currentPosition.y,
                this.projectileParams.width,
                this.projectileParams.height,
            );
            this.engine.context.stroke();
        }
        this.engine.context.closePath()
    }

    public move() {
        if (!this.target) {
            return;
        }
        // increment projectile moved distance by speed
        this.distanceMoved += this.projectileParams.projectileSpeed
        // vector projectile to the target and increment projectile 2d coords
        this.findTargetVector()

        // draw projectile 2d representation
        this.draw()

        // if projectile out of map borders, then delete it
        if (this.currentPosition.x > this.engine.map.mapParams.width) {
            this.destroy()
        }
        if (this.currentPosition.y > this.engine.map.mapParams.height) {
            this.destroy()
        }
    }

    public findTargetVector() {
        if (!this.target) {
            return;
        }
        //find unit vector
        const xDistance = this.target.currentPosition.x + this.projectileParams.rectCenterX - this.currentPosition.x;
        const yDistance = this.target.currentPosition.y + this.projectileParams.rectCenterY - this.currentPosition.y;
        const distanceToTarget = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

        if (distanceToTarget < this.distanceMoved) {
            // collision
            this.collision()
        } else {
            this.currentPosition.x = this.currentPosition.x + this.distanceMoved * xDistance / distanceToTarget;
            this.currentPosition.y = this.currentPosition.y + this.distanceMoved * yDistance / distanceToTarget;
        }
    }

    public collision() {
        this.destroy()
        if (this.target.hp > 0) {
            this.target.hp -= this.damage;
            // debug
            console.log(this.target.hp)
            console.log(`this.target.hp`)
            //
        } else {
            // target is dead
            const isTargetDead = true
            if(this.target) {
                this.target.destroy()
                // release tower target
                this.tower.target = null
                // release projectile target
                this.target = null
            }

        }
        //this.currentPosition.x = this.target.currentPosition.x + this.projectileParams.rectCenterX;
        //this.currentPosition.y = this.target.currentPosition.y + this.projectileParams.rectCenterY;
    }

    public destroy() {
        this.engine.projectiles = this.engine.projectiles.filter((projectile) => this !== projectile)
    }

}


export default Projectile