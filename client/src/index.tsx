import React from 'react';
import ReactDOM from 'react-dom/client';
import { Game } from "./views/GameView";
import {TDEngine} from "./engine/TDEngine";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const engine = new TDEngine();

root.render(
    <Game engine={engine} />
)
