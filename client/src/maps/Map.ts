export interface MapI {

}
class Map {
    constructor(
        private _mapParams = {
            width: 600,
            height: 300,
            gridStep: 20,
            startX: 0,
            startY: 40,
            rightBorder: 0,
            bottomBorder: 220
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
        context.fillStyle = 'green'
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
            200
        )
        // turn to the right
        context.rect(
            mapParams.width / 2,
            200 + mapParams.gridStep,
            mapParams.width / 2,
            mapParams.gridStep
        )
        context.fill()
        context.closePath()
    }
}

export default Map