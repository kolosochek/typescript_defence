import {useEffect, useRef, useState} from "react";
import {
    CircularProgress,
    Box,
    createTheme,
    Grid,
    CssBaseline,
} from "@mui/material";
import {shallow} from "zustand/shallow";
import {ThemeProvider} from "@mui/material/styles";
import {ColorDict, TDEngine} from "../../engine/TDEngine";
import cursorPointer from "../../assets/UI/cursorPointer.png";
import {GameUi} from "../../components/GameUI/GameUI";
import {useGameStore} from "../../store";
import {SideMenu} from "../../components/SideMenu/SideMenu";
import {BuildMenu} from "../../components/BuildMenu/BuildMenu";
import {GameMenu} from "../../components/GameMenu/GameMenu";
import {UiMessage} from "../../components/UIMessage/UIMessage";
import grassBg from "../../assets/UI/grassBg.png";

// mui theme
export const gameTheme = createTheme({
    components: {
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    color: ColorDict.sandColor,
                    fontFamily: "'Press Start 2P', cursive",
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: ColorDict.fontColor,
                    fontFamily: "'Press Start 2P', cursive",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: ColorDict.fontColor,
                    fontFamily: "'Press Start 2P', cursive",
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: `
      fontFamily: "'Press Start 2P', cursive"
      `,
        },
    },
});

export interface IGameProps {
    engine: TDEngine;
}

export const Game = ({engine = new TDEngine()}: IGameProps) => {
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

                    // set engine init flag to true
                    engine.isInitialized = true;
                    setIsLoading(false);

                    // debug
                    console.log(`engine`);
                    console.log(engine);
                    //
                })
                .catch((error) => {
                    throw new Error(
                        `Can't initialize teh engine, reason: ${error.reason ?? error}`,
                    );
                });
        }
        // componentWillUnmount
        return () => {
            // remove event listeners
            engine.removeDocumentEventListeners();
            engine.gameStop();
            cancelAnimationFrame(engine.animationFrameId);
            // reload the engine
            engine.reload();
        };
    }, []);

    useEffect(() => {
        if (engine.isInitialized) {
            if (engine.towers?.length) {
                engine.towers.forEach((tower) => {
                    tower.drawBase();
                });
            }
            // game start
            if (isGameStarted) {
                engine.gameStart();
            } else {
                engine.gameStop();
            }
        }
        if (engine?.waveGenerator?.isInitialized) {
            // add hotkey listeners
            engine.addDocumentEventListeners();
        }
    }, [isGameStarted]);

    return (
        <Box component="main" sx={{flexGrow: 1, display: "flex"}}>
            <ThemeProvider theme={gameTheme}>
                <CssBaseline/>
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        cursor: `url("${cursorPointer}"), auto`,
                        position: "relative",
                        background: `url("${grassBg}") 0 0 repeat`,
                        "& .b-game-window": {
                            top: 0,
                            left: 0,
                            position: "absolute",
                            display: !isLoading ? "flex" : "none",
                        },
                        "& p": {
                            fontSize: "0.7em",
                        },
                        "& button": {
                            fontSize: "0.75em",
                        },
                    }}
                >
                    {!isLoading && <GameUi engine={engine}/>}
                    <Box className="b-game-window" id="gameWindow" ref={gameWindow}/>
                    {isLoading ? (
                        <CircularProgress/>
                    ) : (
                        <Box
                            sx={{
                                position: "relative",
                                width: `100%`,
                                height: `100%`,
                                overflow: "hidden",
                            }}
                        >
                            <SideMenu engine={engine}/>
                            <BuildMenu engine={engine}/>
                            <GameMenu engine={engine}/>
                            <UiMessage engine={engine}/>
                        </Box>
                    )}
                </Grid>
            </ThemeProvider>
        </Box>
    );
};
