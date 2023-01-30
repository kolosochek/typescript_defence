import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import Enemy, {EnemyI} from "../enemies/Enemy";
import Tower, {TowerI} from "../towers/Tower";
import TDEngine from "../engine/TDEngine";
import Game from "../components/Game";
import Map from "../maps/Map";

const GameView = () => {
    const engine = new TDEngine()
    // set new map
    engine.map = new Map()
    // fill towers array
    engine.towers = [
        new Tower(engine, {x: 300, y: 80},  )
    ]

    return (
        <Game engine={engine}/>
    )
}

export default GameView;