import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";

interface ProjectileI {
    engine: TDEngine,
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
        public target: Enemy,
        public tower: Tower,
        public damage: TowerI['towerParam']['attackDamage'] = 30,
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public projectileParams: ProjectileI['projectileParams'] = {
            projectileSpeed: 0.05,
            targetX: 0,
            targetY: 0,
            rectCenterX: 0,
            rectCenterY: 0,
            width: 2,
            height: 2,
        },
        public distanceMoved = 0
    ) {
        this.projectileParams.rectCenterX = this.projectileParams.width / 2
        this.projectileParams.rectCenterY = this.projectileParams.height / 2
    }

    public move() {
        // increment projectile moved distance by speed
        this.distanceMoved += this.projectileParams.projectileSpeed
        // vector projectile to the target and increment projectile 2d coords
        this.findTargetVector()

        // render projectile
        this.engine.context.beginPath()
        this.engine.context.strokeStyle = 'black';
        this.engine.context.strokeRect(
            this.currentPosition.x,
            this.currentPosition.y,
            this.projectileParams.width,
            this.projectileParams.height,
        );
        this.engine.context.stroke();
        this.engine.context.closePath()

        // if projectile out of map borders, then delete it
        if (this.currentPosition.x > this.engine.map.mapParams.width) {
            // @ts-ignore
            delete(this)
        }
        if (this.currentPosition.y > this.engine.map.mapParams.height) {
            // @ts-ignore
            delete(this)
        }
    }

    public findTargetVector() {
        //find unit vector
        const xDistance = this.target.currentPosition.x + this.projectileParams.rectCenterX - this.currentPosition.x;
        const yDistance = this.target.currentPosition.y + this.projectileParams.rectCenterY - this.currentPosition.y;
        const distanceToTarget = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

        if (distanceToTarget < this.distanceMoved) {
            // collision
            if (this.target.hp > 0){
                this.target.hp -= this.damage;
                this.destroy()
            } else {
                // target is dead
                //delete(this.target)
            }
            this.currentPosition.x = this.target.currentPosition.x + this.projectileParams.rectCenterX;
            this.currentPosition.y = this.target.currentPosition.y + this.projectileParams.rectCenterY;
        } else {
            this.currentPosition.x = this.currentPosition.x + this.distanceMoved * xDistance / distanceToTarget;
            this.currentPosition.y = this.currentPosition.y + this.distanceMoved * yDistance / distanceToTarget;
        }
    }

    public destroy(){
        // @ts-ignore
        delete(this)
    }

}


export default Projectile