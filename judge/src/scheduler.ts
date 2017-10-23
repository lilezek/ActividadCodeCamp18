import fs = require("fs");
import { spawn } from "child_process";
import { config } from "./config";
import { mapList, mapName } from "./maplist";
import { AsyncArray } from "ts-modern-async/lib";
import { Game, registerFinishedGame } from "./games";
import { FunnelPriorityArray } from "./utils";

interface GameInProgress {
  game: () => Promise<Game>;
  id: number;
}

export const HighPriorityQueue: AsyncArray<GameInProgress> = new AsyncArray();
export const LowPriorityQueue: AsyncArray<GameInProgress> = new AsyncArray();

async function consumeGamesLoop(queues: AsyncArray<GameInProgress>[]) {
  const gameQueue = new FunnelPriorityArray(queues);
  let broken = false;
  function breakLoop() {
    broken = true;
  }
  setTimeout(async () => {
    while (!broken) {
      const g = await gameQueue.consume();
      console.log("Calculating game " + g.id + ".");
      const gameResult = await g.game();
      console.log("Finished game " + gameResult.id + ".");
      fs.renameSync(config.gameInProgressPath + "/" + g.id + ".replay", config.gameFinishedPath + "/" + g.id + ".replay");
      fs.renameSync(config.gameInProgressPath + "/replay." + g.id + ".html", config.htmlPath + "/" + g.id + ".html");
      fs.writeFileSync(config.htmlPath + "/" + g.id + ".html", fs.readFileSync(config.htmlPath + "/" + g.id + ".html").toString().replace(/\.\.\/\.\.\/ants\/linux/g, ""));
      registerFinishedGame(gameResult);
    }
  }, 0);
  return breakLoop;
}

export const stopLoop = consumeGamesLoop([HighPriorityQueue, LowPriorityQueue]);
