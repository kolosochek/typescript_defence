import React, { useState } from "react";
import { Box, MenuItem, MenuList } from "@mui/material";
import { shallow } from "zustand/shallow";
import { useGameStore } from "../../store";
import { TDEngine } from "../../engine/TDEngine";
import wispAnimation from "../../assets/UI/wispAnimation.gif";
import cursorHand from "../../assets/UI/cursorHand.png";

interface IGameMenu {
  engine: TDEngine;
}
export const GameMenu = ({ engine }: IGameMenu) => {
  const isGameMenuOpen = useGameStore((state) => state.isGameMenuOpen, shallow);
  const setIsGameMenuOpen = useGameStore(
    (state) => state.updateIsGameMenuOpen,
    shallow,
  );
  const setIsBuildMenuOpen = useGameStore(
    (state) => state.updateIsBuildMenuOpen,
    shallow,
  );
  const isGameStarted = useGameStore((state) => state.isGameStarted, shallow);
  const setIsGameStarted = useGameStore(
    (state) => state.updateIsGameStarted,
    shallow,
  );
  const isGameOver = useGameStore((state) => state.isGameOver, shallow);
  const isFullscreen = useGameStore((state) => state.isFullscreen, shallow);
  const setIsFullscreen = useGameStore((state) => state.updateIsFullscreen, shallow);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(
    engine.isSoundEnabled,
  );

  return (
    <Box
      className="b-game-menu-wrapper"
      sx={{
        display: isGameMenuOpen ? "flex" : "none",
        position: "absolute",
        zIndex: 100,
        top: 0,
        width: "100%",
        height: "100%",
        background: `url("${engine.map?.grassBackrgroundCanvas?.toDataURL()}") repeat`,
        justifyContent: "center",
      }}
    >
      <Box
        className="b-game-menu"
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <MenuList
          className="b-game-menu-content"
          sx={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Press Start 2P', cursive",
            "& > li": {
              paddingLeft: "36px",
            },
            "& > li:hover": {
              background: `url("${wispAnimation}") 0 0 no-repeat`,
              cursor: `url("${cursorHand}"), auto`,
            },
          }}
        >
          <MenuItem
            className="b-game-menu-item"
            onClick={() => {
              if (!isGameStarted) {
                engine.gameStart();
              }
              setIsGameMenuOpen(false);
              setIsBuildMenuOpen(true);
            }}
            disabled={!isGameStarted && isGameOver}
          >
            {isGameStarted ? "Resume" : "Start"} game
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (isGameStarted) {
                engine.gameStop();
              }
              setIsGameMenuOpen(false);
            }}
            disabled={!isGameStarted || isGameOver}
          >
            Pause game
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (engine.waveGenerator?.isInitialized) {
                engine.gameRestart();
                setIsGameMenuOpen(false);
                setIsGameStarted(true);
              }
            }}
            disabled={!engine.waveGenerator?.isInitialized}
          >
            Restart game
          </MenuItem>
          <MenuItem
            onClick={() => {
              engine.isSoundEnabled = false;
              if (isSoundEnabled) {
                setIsSoundEnabled(false);
                engine.sound?.soundArr?.gameStart?.pause();
              } else {
                setIsSoundEnabled(true);
                engine.sound?.soundArr?.gameStart?.play();
              }
              setIsGameMenuOpen(false);
            }}
            disabled={!isGameStarted}
          >
            {isSoundEnabled ? "Disable" : "Enable"} music
          </MenuItem>
        </MenuList>
      </Box>
    </Box>
  );
};
