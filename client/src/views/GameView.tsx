import React from 'react';
import TDEngine from "../engine/TDEngine";
import {Game} from "../components/Game";
const engine = new TDEngine();
const GameView = () => {
    return (
        <Game engine={engine} />
    )
}

export default GameView;