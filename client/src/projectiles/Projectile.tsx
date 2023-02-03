import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";

export interface ProjectileI {
    engine: TDEngine,
    image: CanvasImageSource,
}

class Projectile {
    constructor(
        public engine: ProjectileI['engine'],
        public image: ProjectileI['image'],
        public target: Enemy | null,
        public tower: Tower,
        public damage: TowerI['towerParams']['attackDamage'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public distanceMoved = 0
    ) {
        this.tower.projectileParams.rectCenterX = this.tower.projectileParams.width / 2
        this.tower.projectileParams.rectCenterY = this.tower.projectileParams.height / 2
    }

    public draw() {
        this.engine.context.beginPath()
        if (this.image) {
            this.engine.context?.drawImage(this.image, this.currentPosition.x, this.currentPosition.y, this.tower.projectileParams.width, this.tower.projectileParams.height)
        } else {
            this.engine.context.strokeStyle = 'black';
            this.engine.context.strokeRect(
                this.currentPosition.x,
                this.currentPosition.y,
                this.tower.projectileParams.width,
                this.tower.projectileParams.height,
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
        this.distanceMoved += this.tower.projectileParams.projectileSpeed
        // vector projectile to the target and increment projectile 2d coords
        this.findTargetVector()

        // draw projectile 2d representation
        this.draw()

        // if projectile out of map borders, then delete it
        if ((this.currentPosition.x > this.engine.map.mapParams.width) || (this.currentPosition.y > this.engine.map.mapParams.height)) {
            this.destroy()
        }
    }

    public findTargetVector() {
        if (!this.target) {
            return;
        }
        //find unit vector
        const xDistance = this.target.currentPosition.x + this.tower.projectileParams.rectCenterX - this.currentPosition.x;
        const yDistance = this.target.currentPosition.y + this.tower.projectileParams.rectCenterY - this.currentPosition.y;
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
        this.image = this.tower.projectileHitImage
        this.draw()
        // set remove projectileHitImage
        setInterval(() => {
            this.destroy()
        }, this.tower.projectileParams.projectileHitAlive)
        if ((this.target.enemyParams.hp) > 0 && (this.engine.enemies.indexOf(this.target) > -1)) {
            // debug
            this.target.enemyParams.hp -= this.damage;
            this.damage = 0;
        } else if((this.target.enemyParams.hp <= 0) && (this.engine.enemies.indexOf(this.target) > -1) ) {
            // target is dead
            // release tower target
            this.engine.projectiles.filter(projectile => this.target === projectile.target)
            this.tower.target = null
            // destroy projectile target
            this.target.destroy()
        } else if(this.target.enemyParams.hp <= 0){
            this.tower.target = null
        }
        //this.currentPosition.x = this.target.currentPosition.x + this.projectileParams.rectCenterX;
        //this.currentPosition.y = this.target.currentPosition.y + this.projectileParams.rectCenterY;
    }

    public destroy() {
        this.engine.projectiles = this.engine.projectiles.filter((projectile) => this !== projectile)
    }

}


export default Projectile