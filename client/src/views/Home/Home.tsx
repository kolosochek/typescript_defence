import {
  Typography,
  Link,
  Box,
  ThemeProvider,
  Grid,
  CircularProgress,
  CssBaseline,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import cursorPointer from "../../assets/UI/cursorPointer.png";
import cursorHand from "../../assets/UI/cursorHand.png";
import {
  ColorDict,
  TDEngine,
  TEnemyType,
  TSpellTypes,
  TTowerTypes,
} from "../../engine/TDEngine";
import { gameTheme } from "../Game/Game";
import grassBg from "../../assets/UI/grassBg.png";
import {ApplicationRoutes} from "../../index";
import {TowerImage} from "../../components/TowerImage/TowerImage";
import {SpellImage} from "../../components/SpellImage/SpellImage";
import {EnemyImage} from "../../components/EnemyImage/EnemyImage";

export interface IHome {
  engine: TDEngine;
}

export function Home({ engine }: IHome) {
  const gameWindow = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (engine.towers?.length) {
      engine.towers.forEach((tower) => {
        tower.drawBase();
      });
    }
  });

  useEffect(() => {
    // engine init
    window.onload = () => {
      if (!engine.isInitialized) {
        // set engine params
        engine.isDemo = true;
        // init teh engine
        engine
          .init(gameWindow.current!)
          .then(() => {
            engine.map?.drawMap();
            engine.map?.drawMapDecorations();

            // set engine init flag to true
            engine.isInitialized = true;
            setIsLoading(false);

            // start demo stage
            engine.startDemo();

            // debug
            console.log(`document.body.clientHeight`);
            console.log(document.body.clientHeight);
            //

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
    };
    // componentWillUnmount
    return () => {
      // reload teh engine
      engine.gameStop();
      cancelAnimationFrame(engine.animationFrameId);
      engine.reload();
    };
  }, []);

  return (
    <ThemeProvider theme={gameTheme}>
      <CssBaseline />
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          cursor: `url("${cursorPointer}"), auto`,
          position: "relative",
          background: `url("${!isLoading ? grassBg : ""}") 0 0 repeat`,
          "& .b-game-window": {
            position: "absolute",
            top: 0,
            left: 0,
            justifyContent: "center",
            width: "100%",
            height: "100%",
            zIndex: 1,
            display: !isLoading ? "flex" : "none",
          },
          "& .b-home-page-wrapper": {
            position: "relative",
            zIndex: 10,
          },
          "& .b-loader-wrapper": {
            position: "fixed",
            display: "flex",
            width: "100%",
            height: "100%",
            zIndex: 100,
            left: 0,
            top: 0,
            background: ColorDict.shadowColor,
            opacity: 0.75,
          },
          "& .b-text-background": {
            border: `4px solid ${ColorDict.borderColor}`,
            borderRadius: "8px",
            background: ColorDict.sandColor,
            padding: "32px 32px 64px 32px",
          },
          "& .b-tower-image-wrapper": {
            position: "relative",
            top: "32px",
          },
          "& h2, & h3, & h4, & a": {
            textShadow: `4px 4px ${ColorDict.fontColor}`,
              fontFamily: "'Press Start 2P', cursive",
          },
          "& h4": {
            color: ColorDict.sandColor,
          },
        }}
      >
        <>
          <Box className="b-game-window" id="gameWindow" ref={gameWindow} />
          {isLoading && (
            <Grid
              className="b-loader-wrapper"
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress />
            </Grid>
          )}
          <Box
            className="b-home-page-wrapper"
            sx={{
              "& a:hover": {
                cursor: `url("${cursorHand}"), auto`,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                position: "relative",
                minHeight: "1152px",
                maxWidth: "1920px",
                margin: "0 auto",

                "& > a": {
                  color: ColorDict.sandColor,
                  textAlign: "center",
                  marginBottom: "60px",
                },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  textAlign: "center",
                  fontSize: "5rem",
                  margin: "160px 0 180px",
                  color: "#DFE0E7",
                }}
              >
                Tower Defense
              </Typography>
              <Link
                variant="h4"
                color={ColorDict.sandColor}
                component={RouterLink}
                to={ApplicationRoutes.game}
              >Play</Link>
              <Link
                variant="h4"
                href="#rules"
                color={ColorDict.sandColor}
                onClick={() => scrollToElement("rules")}
              >
                Game rules
              </Link>
              <Link
                variant="h4"
                href="#howtoplay"
                color={ColorDict.sandColor}
                onClick={() => scrollToElement("howtoplay")}
              >
                How to play
              </Link>
            </Box>
            <Box
              sx={{
                padding: "152px 300px 100px",
                maxWidth: "1920px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              id="rules"
            >
              <>
                <Typography
                  variant="h3"
                  sx={{
                    padding: "0 0 100px",
                    color: "#FFC08B",
                    textAlign: "center",
                  }}
                >
                  How to play
                </Typography>
                <Box className="b-text-background">
                  <Typography
                    variant="h5"
                    sx={{
                      textAlign: "left",
                    }}
                  >
                      Tower defense game. The goal of the game is to stop the monsters,
                      by building towers and casting spells. For the kill
                      monsters the player receives money that can be spent on
                      improving towers improving existing ones.
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    padding: "60px 0 60px 128px",
                    textAlign: "left",
                  }}
                >
                    There are several types of towers:
                </Typography>
                <Box className="b-text-background">
                  {Object.entries(engine.predefinedTowerParams).map((tower) => {
                    const towerType = tower[0] as TTowerTypes;
                    return (
                      <Box
                        key={`b-tower-${towerType}-image-wrapper`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          margin: "0 0 60px",
                        }}
                      >
                        <TowerImage
                          engine={engine}
                          towerType={towerType}
                        />
                        <Typography
                          variant="h5"
                          sx={{
                            margin: "26px 0 0 60px",
                            textAlign: "left",
                          }}
                        >
                          {`${tower[1].towerParams?.description}`}
                        </Typography>
                      </Box>
                    );
                  })}
                  <Typography
                    variant="h5"
                    sx={{
                      padding: "0 0 60px",
                      textAlign: "left",
                    }}
                  >
                      Each tower has three upgrade levels. Upgrade Time
                      tower depends on the current level of the tower. More advanced
                      towers take longer to upgrade. During the upgrade, the tower cannot
                      Attack.
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TowerImage
                      engine={engine}
                      towerType="three"
                      upgradeLevel={0}
                    />
                    <Typography
                      variant="h5"
                      sx={{
                        margin: "0 80px",
                      }}
                    >
                      -&gt;
                    </Typography>
                    <TowerImage
                      engine={engine}
                      towerType="three"
                      upgradeLevel={1}
                    />
                    <Typography
                      variant="h5"
                      sx={{
                        margin: "0 80px",
                      }}
                    >
                      -&gt;
                    </Typography>
                    <TowerImage
                      engine={engine}
                      towerType="three"
                      upgradeLevel={2}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    padding: "60px 0 60px 128px",
                    textAlign: "left",
                  }}
                >
                    Several types of spells:
                </Typography>
                <Box className="b-text-background">
                  {Object.entries(engine.predefinedSpellParams).map((spell) => {
                    const spellType = spell[0] as TSpellTypes;
                    return (
                      <Box
                        sx={{ display: "flex" }}
                        key={`b-spell-${spellType}-image-wrapper`}
                      >
                        <SpellImage
                          engine={engine}
                          spellType={spellType}
                        />
                        <Typography
                          variant="h5"
                          sx={{
                            margin: "26px 0 0 60px",
                            textAlign: "left",
                          }}
                        >
                          {`${engine.predefinedSpellParams[spellType]?.spell.description}`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    padding: "60px 0 60px 128px",
                    textAlign: "left",
                  }}
                >
                    Several types of enemies:
                </Typography>
                <Box className="b-text-background">
                  {Object.entries(engine.enemySprites).map((enemy) => {
                    const enemyType = enemy[0] as TEnemyType;
                    return (
                      <Box
                        sx={{ display: "flex" }}
                        key={`b-enemy-${enemyType}-image-wrapper`}
                      >
                        <EnemyImage
                          engine={engine}
                          enemyType={enemyType}
                        />
                        <Typography
                          variant="h5"
                          sx={{
                            margin: "26px 0 0 60px",
                            textAlign: "left",
                          }}
                        >
                          {`${engine.enemySprites[enemyType]?.description}`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: "center",
                    margin: "60px 0 60px 128px",
                  }}
                >
                  Game rules:
                </Typography>
                <Box className="b-text-background" sx={{
                    "& h5": {
                        padding: "0 0 40px",
                        textAlign: "left",
                    }
                }} id="howtoplay">
                    <Typography
                        variant="h5"
                    >
                        1. Build and upgrade towers. Combo tower special attacks.
                    </Typography>
                    <Typography
                        variant="h5"
                    >
                        2. Cast spells and watch your mana. Try to slow down enemies, no to kill 'em.
                    </Typography>
                    <Typography
                        variant="h5"
                    >
                        3. Clear trees and stones in good spots, like road corners, so towers can cover more area.
                    </Typography>
                    <Typography
                        variant="h5"
                    >
                        4. Don't give up!
                    </Typography>
                  <Typography
                    variant="h5"
                  >
                      After the start of the game, after a while, they will start walking on the map
                      enemies. You need to build towers that will attack enemies and
                      prevent them from reaching the end of the map.
                  </Typography>
                  <Typography
                    variant="h5"
                  >
                      The game consists of several waves or rounds. After the murder
                      all enemies in the current wave, after a short pause,
                      the next round begins, in which more enemies, they
                      more health and they move around the map faster.
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      textAlign: "left",
                    }}
                  >
                      With each new round, the player also receives more gold
                      for killing enemies. When the enemy reaches the end of the road,
                      the player takes one life. Once all lives
                      end - the game is over.
                  </Typography>
                </Box>
                <Link
                  variant="h4"
                  component={RouterLink}
                  to={ApplicationRoutes.game}
                  sx={{
                    textAlign: "center",
                    margin: "64px 0 32px",
                    color: ColorDict.sandColor,
                    textDecorationColor: "rgba(255, 192, 139, 0.4)",
                  }}
                >
                  Play
                </Link>
              </>
            </Box>
          </Box>
        </>
      </Grid>
    </ThemeProvider>
  );
}
