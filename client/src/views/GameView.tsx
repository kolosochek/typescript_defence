import React from 'react';
import TDEngine from "../engine/TDEngine";
import Game from "../components/Game";
import Map from "../maps/Map";

const GameView = () => {
    const engine = new TDEngine()

    // set new map
    engine.map = new Map(engine)

    return (
        <Game engine={engine} />
    )
}

export default GameView;