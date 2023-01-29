import React from 'react';
import ReactDOM from 'react-dom/client';
import GameView from "./views/GameView";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <GameView />
)
