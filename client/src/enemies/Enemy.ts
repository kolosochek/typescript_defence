import {getMapParams} from "../maps/Level1";

class Enemy {
    constructor(
        public context: CanvasRenderingContext2D,
        public isMoving: boolean = false,
        public animationFrameId: number | null = null,
        public randomOffset = {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10),
        },
        public currentPosition = {
            x: 0,
            y: 0,
        },
        public enemyParams = {
            width: 6,
            height: 6,
            spaceBetweenEnemies: 15,
        },
        public mapParams = getMapParams(),
    ) {

    }

    public drawEnemy(initialPosition:Record<string,number> = {x:0, y:0}) {
        // set initial coords of enemy
        this.currentPosition.x = this.mapParams.startX + this.randomOffset.x + initialPosition.x
        this.currentPosition.y = this.mapParams.startY + this.randomOffset.y + initialPosition.y

        // draw a 2d representation
        this.context.beginPath()
        this.context.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.context.strokeStyle = 'red'
        this.context.stroke()
        this.context.closePath()
    }

    public moveRight() {
        this.animationFrameId = requestAnimationFrame(() => this.move())
        // increment x, y is constant
        this.currentPosition.x += 1

        // clear prev render
        this.context.fillRect(this.currentPosition.x - 2, this.currentPosition.y - 1 , this.enemyParams.width + 1, this.enemyParams.height + 2)

        // and place a new figure on canvas
        this.context.beginPath()
        this.context.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.context.strokeStyle = 'red'
        this.context.stroke()
        this.context.closePath()
    }

    public moveDown() {
        this.animationFrameId = requestAnimationFrame(() => this.move())
        // increment y, x is constant
        this.currentPosition.y += 1

        // clear prev render
        this.context.fillRect(this.currentPosition.x - 1, this.currentPosition.y - 2 , this.enemyParams.width + 2, this.enemyParams.height + 2)

        // and place a new figure on canvas
        this.context.beginPath()
        this.context.rect(this.currentPosition.x, this.currentPosition.y, this.enemyParams.width, this.enemyParams.height)
        this.context.strokeStyle = 'red'
        this.context.stroke()
        this.context.closePath()
    }

    public move() {
        if (!this.isMoving) {

        }

        // moving right and then
        if (this.currentPosition.x <= this.mapParams.rightBorder + this.randomOffset.x) {
            this.moveRight()
        } else {
            this.stop()
            // move down and then
            if (this.currentPosition.y <= this.mapParams.bottomBorder + this.randomOffset.y) {
                this.moveDown()
            } else {
                this.stop()
                // move right and then stop
                if (this.currentPosition.x <= this.mapParams.width + this.randomOffset.x) {
                    this.moveRight()
                } else {
                    this.stop()
                }
            }
        }


        setTimeout(() => {
            this.stop()
        }, 15000)
    }

    public stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId!)
        }
    }
}

export default Enemy;