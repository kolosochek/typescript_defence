import React from 'react';
import TDEngine from "../engine/TDEngine";
import {Game} from "../components/Game";

const GameView = () => {
    return (
        <Game engine={new TDEngine()} />
    )
}

export default GameView;