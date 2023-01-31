import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";

export interface EnemyI {
    engine: TDEngine,
    image: CanvasImageSource,
    enemyParams: {
        width: number,
        height: number,
        spaceBetweenEnemies: number,
        speed: number,
        bounty: number,
        rectCenterX: number,
        rectCenterY: number,
        strokeStyle: string
    }
}

class Enemy {
    constructor(
        public engine: EnemyI['engine'],
        public image?: EnemyI['image'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
        public enemyParams = {
            width: 20,
            height: 20,
            spaceBetweenEnemies: 35,
            speed: 0.62,
            bounty: 5,
            strokeStyle: 'red',
            rectCenterX: 0,
            rectCenterY: 0,
        },
        public randomOffset = {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10) + 1,
        },
        public hp = 100,
    ) {
        this.enemyParams.rectCenterX = this.enemyParams.width / 2
        this.enemyParams.rectCenterY = this.enemyParams.height / 2
    }

    public draw() {
        if (this.image) {
            this.engine.context!.beginPath()
            this.engine.context?.drawImage(this.image, this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
            this.engine.context!.closePath()
        } else {
            // and place a new figure on canvas
            this.engine.context!.beginPath()
            this.engine.context!.strokeStyle = this.enemyParams.strokeStyle
            this.engine.context!.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
            this.engine.context!.stroke()
            this.engine.context!.closePath()
        }
    }

    public drawEnemy(initialPosition: twoDCoordinatesI = {x: 0, y: 0}) {
        // set initial coords of enemy
        this.currentPosition.x = this.engine.map?.mapParams.startX! + this.randomOffset.x + initialPosition.x
        this.currentPosition.y = this.engine.map?.mapParams.startY! + this.randomOffset.y + initialPosition.y
        // draw enemy
        this.draw()
    }

    public moveRight() {
        // increment x, y is constant
        this.currentPosition.x += this.enemyParams.speed
        // draw enemy
        this.draw()
    }

    public moveDown() {
        // increment y, x is constant
        this.currentPosition.y += this.enemyParams.speed
        // draw enemy
        this.draw()
    }

    // enemy movement logic
    public move() {
        // moving right and then
        if (this.currentPosition.x <= this.engine.map?.mapParams.rightBorder! + this.randomOffset.x) {
            this.moveRight()
        } else {
            // move down and then
            if (this.currentPosition.y <= (this.engine.map?.mapParams.bottomBorder! + this.engine.map.mapParams.gridStep + this.randomOffset.x)) {
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
        this.engine.score += 1
        this.engine.money += this.enemyParams.bounty
    }
}

export default Enemy;