import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";

export interface EnemyI {
    engine: TDEngine,
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
            speed: 1.5
        },
        public randomOffset = {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10) + 1,
        },
    ) {
    }

    public drawEnemy(initialPosition: Record<string, number> = {x: 0, y: 0}) {
        // set initial coords of enemy
        this.currentPosition.x = this.engine.map?.mapParams.startX! + this.randomOffset.x + initialPosition.x
        this.currentPosition.y = this.engine.map?.mapParams.startY! + this.randomOffset.y + initialPosition.y

        // draw a 2d representation
        this.engine.context!.beginPath()
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.strokeStyle = 'red'
        this.engine.context!.stroke()
        this.engine.context!.closePath()
    }

    public moveRight() {
        // increment x, y is constant
        this.currentPosition.x += 1 * this.enemyParams.speed

        // clear prev render
        this.engine.context!.fillRect(this.currentPosition.x - 2, this.currentPosition.y - 1, this.enemyParams.width + 1, this.enemyParams.height + 2)

        // and place a new figure on canvas
        this.engine.context!.beginPath()
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.strokeStyle = 'red'
        this.engine.context!.stroke()
        this.engine.context!.closePath()

        return this.currentPosition
    }

    public moveDown() {
        // increment y, x is constant
        this.currentPosition.y += 1 * this.enemyParams.speed

        // clear prev render
        this.engine.context!.fillRect(this.currentPosition.x - 1, this.currentPosition.y - 2, this.enemyParams.width + 2, this.enemyParams.height + 1)

        // and place a new figure on canvas
        this.engine.context!.beginPath()
        this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.engine.context!.strokeStyle = 'red'
        this.engine.context!.stroke()
        this.engine.context!.closePath()

        return this.currentPosition
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
                    // @ts-ignore
                    delete(this)
                }
            }
        }

        // return enemy instance current position {x: number, y: number}
        return this.currentPosition
    }

}

export default Enemy;