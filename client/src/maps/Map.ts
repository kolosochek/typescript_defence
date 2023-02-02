import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";


export interface MapI {
    mapParams: {
        width: number,
        height: number,
        gridStep: number,
        startX: number,
        startY: number,
        rightBorder: number,
        bottomBorder: number,
        mapTilesArr: twoDCoordinatesI[],
        tileCenter: number,
        closestTile: twoDCoordinatesI,
    }
}

class Map {
    constructor(
        public engine: TDEngine,
        public mapParams: MapI['mapParams'] = {
            width: 600,
            height: 600,
            gridStep: 30,
            startX: 0,
            startY: 90,
            rightBorder: 0,
            bottomBorder: 300,
            mapTilesArr: [{x: 0, y: 0}],
            tileCenter: 0,
            closestTile: {x: 0, y: 0},
        }
    ) {
        this.mapParams.tileCenter = this.mapParams.gridStep / 2
        this.mapParams.rightBorder = this.mapParams.width / 2

        // fill mapTilesArr
        for (let x = 0; x <= this.mapParams.width; x += this.mapParams.gridStep) {
            for (let y = 0; y <= this.mapParams.height; y += this.mapParams.gridStep) {
                this.mapParams.mapTilesArr.push({x: x, y: y})
            }
        }

        // pop tiles which is occupied by map path
        // first stage
        for (let x = 0; x <= this.mapParams.rightBorder; x += this.mapParams.gridStep){
            this.mapParams.mapTilesArr = this.mapParams.mapTilesArr.filter(tile => tile.x !== x || tile.y !== this.mapParams.startY)
        }
        // second stage
        for (let y = this.mapParams.startY; y <= this.mapParams.bottomBorder; y += this.mapParams.gridStep){
            this.mapParams.mapTilesArr = this.mapParams.mapTilesArr.filter(tile => tile.x !== this.mapParams.rightBorder || tile.y !== y)
        }
        // third stage
        for (let x = this.mapParams.rightBorder; x <= this.mapParams.width; x += this.mapParams.gridStep){
            this.mapParams.mapTilesArr = this.mapParams.mapTilesArr.filter(tile => tile.x !== x || tile.y !== this.mapParams.bottomBorder + this.mapParams.gridStep)
        }

        // debug
        console.log(`this.mapParams.mapTilesArr`)
        console.log(this.mapParams.mapTilesArr)
        console.log(`this.mapParams.mapTilesArr.length`)
        console.log(this.mapParams.mapTilesArr.length)
        //
    }


    public drawMap = () => {

        this.engine.context.beginPath()
        this.engine.context.fillStyle = '#bdbdbd'
        // first right line
        this.engine.context.rect(
            this.mapParams.startX,
            this.mapParams.startY,
            this.mapParams.width / 2,
            this.mapParams.gridStep)
        // turn to the bottom
        this.engine.context.rect(
            this.mapParams.width / 2,
            this.mapParams.startY,
            this.mapParams.gridStep,
            this.mapParams.bottomBorder - this.mapParams.gridStep
        )
        // turn to the right
        this.engine.context.rect(
            this.mapParams.width / 2,
            this.mapParams.bottomBorder + this.mapParams.gridStep,
            this.mapParams.width / 2,
            this.mapParams.gridStep
        )
        this.engine.context.fill()
        this.engine.context.closePath()
    }

    public drawGrid() {
        if (this.engine.isShowGrid) {
            this.engine.context.beginPath()
            this.engine.context.setLineDash([])
            for (let x = 0; x <= this.mapParams.width; x += this.mapParams.gridStep) {
                this.engine.context.moveTo(0.5 + x + this.mapParams.gridStep, 0);
                this.engine.context.lineTo(0.5 + x + this.mapParams.gridStep, this.mapParams.height + this.mapParams.gridStep);
            }
            for (let y = 0; y <= this.mapParams.height; y += this.mapParams.gridStep) {
                this.engine.context.moveTo(0, y + this.mapParams.gridStep);
                this.engine.context.lineTo(this.mapParams.width + this.mapParams.gridStep, y + this.mapParams.gridStep);
            }
            this.engine.context.strokeStyle = "black";
            this.engine.context.stroke();
            this.engine.context.closePath()
        }
    }
}

export default Map