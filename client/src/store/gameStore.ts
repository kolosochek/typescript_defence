import { create } from "zustand";
import { ITDEngine } from "../engine/TDEngine";
import { ITower } from "../towers/Tower";
import { IWaveGenerator } from "../waveGenerator/waveGenerator";

export interface IGameStore {
  isGameMenuOpen: ITDEngine["boolean"];
  isGameStarted: ITDEngine["boolean"];
  isSideMenuOpen: ITDEngine["boolean"];
  isBuildMenuOpen: ITDEngine["boolean"];
  isGameOver: ITDEngine["boolean"];
  selectedTower: ITDEngine["selectedTower"];
  lives: ITDEngine["lives"];
  mana: ITDEngine["mana"];
  money: ITDEngine["money"];
  score: ITDEngine["score"];
  enemiesLeft: ITDEngine["enemiesLeft"];
  countdown: IWaveGenerator["waveCountdown"];
  waveNumber: IWaveGenerator["waveParams"]["currentWave"];
  waveType: IWaveGenerator["waveParams"]["waveType"];
  constructionProgress: ITower["renderParams"]["constructionProgressPercent"];
  UIMessage: string;
}
export type TGameAction = {
  updateIsGameMenuOpen: (bool: IGameStore["isGameMenuOpen"]) => void;
  updateIsGameStarted: (bool: IGameStore["isGameStarted"]) => void;
  updateIsSideMenuOpen: (bool: IGameStore["isSideMenuOpen"]) => void;
  updateIsBuildMenuOpen: (bool: IGameStore["isBuildMenuOpen"]) => void;
  updateIsGameOver: (bool: IGameStore["isGameOver"]) => void;
  updateSelectedTower: (tower: IGameStore["selectedTower"]) => void;
  updateLives: (lives: IGameStore["lives"]) => void;
  updateMana: (mana: IGameStore["mana"]) => void;
  updateMoney: (money: IGameStore["money"]) => void;
  updateScore: (score: IGameStore["score"]) => void;
  updateEnemiesLeft: (enemiesLeft: IGameStore["enemiesLeft"]) => void;
  updateCountdown: (countdown: IGameStore["countdown"]) => void;
  updateWaveNumber: (waveNumber: IGameStore["waveNumber"]) => void;
  updateConstructionProgress: (
    constructionProgress: IGameStore["constructionProgress"],
  ) => void;
  updateWaveType: (waveType: IGameStore["waveType"]) => void;
  updateUIMessage: (UIMessage: IGameStore["UIMessage"]) => void;
};

export const useGameStore = create<IGameStore & TGameAction>()((set) => ({
  isGameMenuOpen: true,
  updateIsGameMenuOpen: (isGameMenuOpen) =>
    set(() => ({ isGameMenuOpen: isGameMenuOpen })),
  isBuildMenuOpen: true,
  updateIsBuildMenuOpen: (isBuildMenuOpen) =>
    set(() => ({ isBuildMenuOpen: isBuildMenuOpen })),
  isGameStarted: false,
  updateIsGameStarted: (isGameStarted) =>
    set(() => ({ isGameStarted: isGameStarted })),
  isSideMenuOpen: false,
  updateIsSideMenuOpen: (isSideMenuOpen) =>
    set(() => ({ isSideMenuOpen: isSideMenuOpen })),
  isGameOver: false,
  updateIsGameOver: (isGameOver) => set(() => ({ isGameOver: isGameOver })),
  selectedTower: null,
  updateSelectedTower: (selectedTower) =>
    set(() => ({ selectedTower: selectedTower })),
  lives: 0,
  updateLives: (lives) => set(() => ({ lives: lives })),
  mana: 100,
  updateMana: (mana) => set(() => ({ mana: mana })),
  money: 0,
  updateMoney: (money) => set(() => ({ money: money })),
  score: 0,
  updateScore: (score) => set(() => ({ score: score })),
  enemiesLeft: 0,
  updateEnemiesLeft: (enemiesLeft) => set(() => ({ enemiesLeft: enemiesLeft })),
  countdown: 0,
  updateCountdown: (countdown) => set(() => ({ countdown: countdown })),
  waveNumber: 0,
  updateWaveNumber: (waveNumber) => set(() => ({ waveNumber: waveNumber })),
  constructionProgress: 0,
  updateConstructionProgress: (constructionProgress) =>
    set(() => ({ constructionProgress: constructionProgress })),
  waveType: "regular",
  updateWaveType: (waveType) => set(() => ({ waveType: waveType })),
  UIMessage: "",
  updateUIMessage: (UIMessage) => set(() => ({ UIMessage: UIMessage })),
}));
