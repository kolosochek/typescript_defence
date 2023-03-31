import { useEffect, useRef, useState } from "react";
import { CircularProgress, Box, createTheme, Grid } from "@mui/material";
import { shallow } from "zustand/shallow";
import { ThemeProvider } from "@mui/material/styles";
import { TDEngine } from "../engine/TDEngine";
import GameUi from "../components/GameUI/GameUI";
import { useGameStore } from "../store";
import { SideMenu } from "../components/SideMenu/SideMenu";
import { BuildMenu } from "../components/BuildMenu/BuildMenu";
import { GameMenu } from "../components/GameMenu/GameMenu";

// mui theme
const theme = createTheme({
    components: {
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: "#ffae70",
                    fontFamily: "'Press Start 2P', cursive",
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#000000",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.7em",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: "#000000",
                    fontFamily: "'Press Start 2P', cursive",
                    fontSize: "0.75em",
                },
            },
        },
    },
});

export interface IGameProps {
    engine?: TDEngine;
}

export const Game = ({ engine = new TDEngine() }: IGameProps) => {
    // game window ref
    const gameWindow = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!engine.isInitialized);
    const [isGameStarted, setIsGameStarted] = useGameStore(
        (state) => [state.isGameStarted, state.updateIsGameStarted],
        shallow,
    );

    useEffect(() => {
        // engine init
        if (!engine.isInitialized) {
            engine
                .init(gameWindow.current!)
                .then(() => {
                    engine.map?.drawMap();
                    engine.map?.drawMapDecorations();

                    // add hotkey listeners
                    engine.addDocumentEventListeners();

                    // debug
                    console.log(`engine`);
                    console.log(engine);
                    //

                    // set engine init flag to true
                    engine.isInitialized = true;
                    setIsLoading(false);
                })
                .catch((error) => {
                    throw new Error(
                        `Can't initialize teh engine, reason: ${error.reason ?? error}`,
                    );
                });
        }
    }, []);

    useEffect(() => {
        if (engine.isInitialized) {
            // game start
            if (isGameStarted) {
                engine.gameStart();
            } else {
                engine.gameStop();
            }
        }
        // componentWillUnmount
        return () => {
            if (engine.isInitialized) {
                if (isGameStarted) {
                    // pause teh game
                    engine.gameStop();
                }
                // remove event listeners
                // engine.removeDocumentEventListeners();
            }
        };
    }, [isGameStarted]);

    return (
        <ThemeProvider theme={theme}>
            {isLoading && (
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{ w: "100%", h: "100%" }}
                >
                    <CircularProgress />
                </Grid>
            )}
            <Box
                sx={{
                    position: "relative",
                    width: `${engine.map?.mapParams?.width}px`,
                    height: `${engine.map?.mapParams?.height}px`,
                    "& .b-game-window": {
                        position: "absolute",
                        display: !isLoading ? "flex" : "none",
                    },
                    overflow: "hidden",
                }}
            >
                <Box className="b-game-window" id="gameWindow" ref={gameWindow} />
                {!isLoading && (
                    <>
                        <GameUi engine={engine} />
                        <SideMenu engine={engine} />
                        <BuildMenu engine={engine} />
                        <GameMenu engine={engine} />
                    </>
                )}
            </Box>
        </ThemeProvider>
    );
};
