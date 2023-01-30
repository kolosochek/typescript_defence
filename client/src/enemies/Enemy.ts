import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";

export interface EnemyI {
    engine: TDEngine,
    enemyParams: {
        width: number,
        height: number,
        spaceBetweenEnemies: number,
        speed: number,
        bounty: number,
        strokeStyle: string
    }
}

class Enemy {
    constructor(
        public engine: EnemyI['engine'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public enemyParams = {
            width: 6,
            height: 6,
            spaceBetweenEnemies: 15,
            speed: 1,
            bounty: 5,
            strokeStyle: 'red'
        },
        public randomOffset = {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10) + 1,
        },
        public hp = 100,
    ) {
    }

    public drawEnemy(initialPosition: Record<string, number> = {x: 0, y: 0}) {
        // set initial coords of enemy
        this.currentPosition.x = this.engine.map?.mapParams.startX! + this.randomOffset.x + initialPosition.x
        this.currentPosition.y = this.engine.map?.mapParams.startY! + this.randomOffset.y + initialPosition.y

        // draw a 2d representation
        this.engine.context!.beginPath()
        this.engine.context!.strokeStyle = this.enemyParams.strokeStyle
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.stroke()
        this.engine.context!.closePath()
    }

    public moveRight() {
        // increment x, y is constant
        this.currentPosition.x += this.enemyParams.speed

        // and place a new figure on canvas
        this.engine.context!.beginPath()
        this.engine.context!.strokeStyle = this.enemyParams.strokeStyle
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.stroke()
        this.engine.context!.closePath()
    }

    public moveDown() {
        // increment y, x is constant
        this.currentPosition.y += this.enemyParams.speed

        // and place a new figure on canvas
        this.engine.context!.beginPath()
        this.engine.context!.strokeStyle = this.enemyParams.strokeStyle
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.stroke()
        this.engine.context!.closePath()
    }

    // enemy movement logic
    public move() {
        // moving right and then
        if (this.currentPosition.x <= this.engine.map?.mapParams.rightBorder! + this.randomOffset.x) {
            this.moveRight()
        } else {
            // move down and then
            if (this.currentPosition.y <= this.engine.map?.mapParams.bottomBorder! + this.randomOffset.x) {
                this.moveDown()
            } else {
                // move right and then stop
                if (this.currentPosition.x <= this.engine.map?.mapParams.width! + this.randomOffset.x) {
                    this.moveRight()
                } else {
                    // delete enemies that are out of map borders
                    this.destroy()
                    // decrement life quantity
                    this.engine.lives -= 1;
                }
            }
        }
    }

    public destroy() {
        this.engine.enemies = this.engine.enemies.filter((enemy) => this !== enemy)
    }
}

export default Enemy;