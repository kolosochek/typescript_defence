export interface MapI {

}
class Map {
    constructor(
        private _mapParams = {
            width: 600,
            height: 600,
            gridStep: 30,
            startX: 0,
            startY: 80,
            rightBorder: 0,
            bottomBorder: 280
        }
    ) {
        this._mapParams.rightBorder = this._mapParams.width / 2
    }
    public get mapParams(){
        return this._mapParams
    }


    public drawMap = (context:CanvasRenderingContext2D) => {
        const mapParams = this.mapParams

        context.beginPath()
        context.fillStyle = '#bdbdbd'
        // first right line
        context.rect(
            mapParams.startX,
            mapParams.startY,
            mapParams.width / 2,
            mapParams.gridStep)
        // turn to the bottom
        context.rect(
            mapParams.width / 2,
            mapParams.startY,
            mapParams.gridStep,
            mapParams.bottomBorder - mapParams.gridStep
        )
        // turn to the right
        context.rect(
            mapParams.width / 2,
            mapParams.bottomBorder + mapParams.gridStep,
            mapParams.width / 2,
            mapParams.gridStep
        )
        context.fill()
        context.closePath()
    }
}

export default Map