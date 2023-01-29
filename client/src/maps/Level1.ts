export const getMapParams = () => {
    const mapParams = {
        width: 600,
        height: 300,
        gridStep: 20,
        startX: 0,
        startY: 40,
        rightBorder: 0,
        bottomBorder: 220
    }
    mapParams.rightBorder = mapParams.width / 2

    return mapParams
}


const drawMap = (context:CanvasRenderingContext2D) => {
    const mapParams = getMapParams()
    // first line
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
    context.fillStyle = 'green'
    context.fill()
}

export default drawMap;