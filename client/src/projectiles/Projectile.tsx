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
            width: 1,
            height: 1,
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
            this.destroy()
        }
        if (this.currentPosition.y > this.engine.map.mapParams.height) {
            this.destroy()
        }
    }

    public findTargetVector() {
        //find unit vector
        const xDistance = this.target.currentPosition.x + this.projectileParams.rectCenterX - this.currentPosition.x;
        const yDistance = this.target.currentPosition.y + this.projectileParams.rectCenterY - this.currentPosition.y;
        const distanceToTarget = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

        if (distanceToTarget < this.distanceMoved) {
            // collision
            // debug
            console.log(this.target.hp)
            console.log(`this.target.hp`)
            //
            if (this.target.hp > 0) {
                this.target.hp -= this.damage;
            } else {
                // release tower target
                this.tower.target = null
                // target is dead
                this.target.destroy()
                // increment score when enemy died(is destroyed)
                this.engine.score += 1;
                // increment money due to target bounty
                this.engine.money += this.target.enemyParams.bounty
            }
            this.destroy()
            //this.currentPosition.x = this.target.currentPosition.x + this.projectileParams.rectCenterX;
            //this.currentPosition.y = this.target.currentPosition.y + this.projectileParams.rectCenterY;
        } else {
            this.currentPosition.x = this.currentPosition.x + this.distanceMoved * xDistance / distanceToTarget;
            this.currentPosition.y = this.currentPosition.y + this.distanceMoved * yDistance / distanceToTarget;
        }
    }

    public destroy() {
        this.engine.projectiles = this.engine.projectiles.filter((projectile) => this !== projectile)
    }

}


export default Projectile