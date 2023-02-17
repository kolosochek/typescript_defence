import TDEngine, { ITwoDCoordinates, TEnemyName } from "../engine/TDEngine";

export type TEnemyType = "regular" | "slow" | "fast" | "boss" | "firebug";
export interface IEnemy {
  engine: TDEngine;
  sprite?: Record<string, CanvasImageSource[]>[];
  spriteCanvas?: Record<string, HTMLCanvasElement[]>[];
  enemyParams: {
    type?: TEnemyName;
    width?: number;
    height?: number;
    spaceBetweenEnemies?: number;
    speed?: number;
    bounty?: number;
    rectCenterX?: number;
    rectCenterY?: number;
    strokeStyle?: string;
    hp: number;
    maxHp?: number;
  };
  renderParams: {
    currentFrame: number;
    isAnimateDeath: boolean;
    framesPerSprite: number;
  };
  currentStage: number;
}

class Enemy {
  constructor(
    public engine: IEnemy["engine"],
    public enemyParams: IEnemy["enemyParams"] = {
      type: "firebug",
      width: 20,
      height: 20,
      spaceBetweenEnemies: 35,
      speed: 0.65,
      bounty: 5,
      strokeStyle: "red",
      rectCenterX: 0,
      rectCenterY: 0,
      hp: 100,
      maxHp: 0,
    },
    public renderParams: IEnemy["renderParams"] = {
      currentFrame: 0,
      isAnimateDeath: false,
      framesPerSprite: 8,
    },
    public currentStage: IEnemy["currentStage"] = 0,
    public currentPosition: ITwoDCoordinates = {
      x: 0,
      y: 0,
    },
    public randomOffset = {
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 15) + 1,
    },
  ) {
    this.enemyParams.rectCenterX = this.enemyParams?.width! / 2;
    this.enemyParams.rectCenterY = this.enemyParams?.height! / 2;
    this.enemyParams.maxHp = this.enemyParams.hp;
    this.renderParams.currentFrame = 0;
  }

  public drawHpBar() {
    const hpLeft = this.enemyParams.hp / this.enemyParams.maxHp!;
    this.engine.enemyContext?.beginPath();
    if (hpLeft > 0.65) {
      this.engine.enemyContext!.fillStyle = "green";
    } else if (hpLeft > 0.35) {
      this.engine.enemyContext!.fillStyle = "orange";
    } else {
      this.engine.enemyContext!.fillStyle = "red";
    }
    this.engine.enemyContext?.fillRect(
      this.currentPosition.x,
      this.currentPosition.y - 5,
      this.enemyParams.width! * (this.enemyParams.hp / this.enemyParams.maxHp!),
      4,
    );
    this.engine.enemyContext?.closePath();
  }

  public drawEnemyWithSprite(
    enemySprite: CanvasImageSource,
    context: CanvasRenderingContext2D = this.engine.enemyContext!,
  ) {
    context.beginPath();
    context.drawImage(
      enemySprite,
      this.currentPosition.x,
      this.currentPosition.y,
      this.enemyParams.width!,
      this.enemyParams.height!,
    );
    context.closePath();
  }

  public getNextFrameIndex(limit: number = this.renderParams.framesPerSprite) {
    if (this.renderParams.currentFrame < limit - 1) {
      this.renderParams.currentFrame += 1;
    } else {
      if (this.renderParams.isAnimateDeath) {
        return limit - 1;
      }
      this.renderParams.currentFrame = 0;
    }
    return this.renderParams.currentFrame;
  }

  public draw(context: CanvasRenderingContext2D, isDrawHpBar: boolean) {
    if (isDrawHpBar) {
      // hp bar
      this.drawHpBar();
    }
    // enemy 2d representation
    // enemy is alive, draw movement animation
    if (!this.renderParams.isAnimateDeath) {
      this.drawEnemyWithSprite(
        this.engine.enemySprites[this.enemyParams.type!]!.canvasArr![
          this.engine.map?.stageArr.at(this.currentStage)!.direction!
        ]![this.getNextFrameIndex()],
        context,
      );
      // enemy is dead? draw death animation
    } else {
      this.drawEnemyWithSprite(
        this.engine.enemySprites[this.enemyParams.type!]!.canvasArr![
          `${this.engine.map?.stageArr.at(this.currentStage)!.direction!}Dead`
        ]![
          this.getNextFrameIndex(
            this.engine.enemySprites[this.enemyParams.type!]
              ?.deathFramesPerSprite,
          )
        ],
        context,
      );
    }
  }

  public initialSetEnemy(initialPosition: ITwoDCoordinates = { x: 0, y: 0 }) {
    // set initial coords of enemy
    this.currentPosition.x =
      this.engine.map?.stageArr.at(0)?.limit.x! +
      // this.randomOffset.x +
      initialPosition.x;
    this.currentPosition.y =
      this.engine.map?.stageArr.at(0)?.limit.y! +
      // this.randomOffset.y +
      initialPosition.y;
  }

  public moveRight() {
    // increment x, y is constant
    this.currentPosition.x += this.enemyParams.speed!;
  }

  public moveLeft() {
    // increment y, x is constant
    this.currentPosition.x -= this.enemyParams.speed!;
  }

  public moveDown() {
    // increment y, x is constant
    this.currentPosition.y += this.enemyParams.speed!;
  }

  public moveUp() {
    // increment y, x is constant
    this.currentPosition.y -= this.enemyParams.speed!;
  }

  // enemy movement logic
  public move() {
    const getStage = () => {
      return this.engine.map?.stageArr.at(this.currentStage);
    };
    const currentStage = getStage();
    if (!currentStage) return;
    switch (currentStage.direction) {
      case "start": {
        this.currentStage += 1;
        break;
      }
      case "right": {
        if (
          this.currentPosition.x <=
          currentStage.limit.x - this.engine.map!.mapParams.gridStep // + this.randomOffset.x
        ) {
          this.moveRight();
        } else {
          if (this.currentStage + 1 !== this.engine.map?.stageArr?.length) {
            this.currentStage += 1;
          }
        }
        break;
      }
      case "left": {
        if (
          this.currentPosition.x >= currentStage.limit.x // + this.randomOffset.x
        ) {
          this.moveLeft();
        } else {
          if (this.currentStage + 1 !== this.engine.map?.stageArr?.length) {
            this.currentStage += 1;
          }
        }
        break;
      }
      case "down": {
        if (
          this.currentPosition.y <=
          currentStage.limit.y - this.engine.map!.mapParams.gridStep // + this.randomOffset.y
        ) {
          this.moveDown();
        } else {
          if (this.currentStage + 1 !== this.engine.map?.stageArr?.length) {
            this.currentStage += 1;
          }
        }
        break;
      }
      case "up": {
        if (
          this.currentPosition.y + this.engine.map!.mapParams.gridStep >=
          currentStage.limit.y // + this.randomOffset.y
        ) {
          this.moveUp();
        } else {
          if (this.currentStage + 1 !== this.engine.map?.stageArr?.length) {
            this.currentStage += 1;
          }
        }
        break;
      }
      case "end": {
        const prevStage = this.engine.map?.stageArr[this.currentStage - 1]!;
        switch (prevStage.direction) {
          case "left": {
            if (
              this.currentPosition.x + this.enemyParams.width! >=
              currentStage.limit.x // + this.randomOffset.x
            ) {
              this.moveLeft();
            } else {
              // end of map
              this.destroy();
              // decrement life quantity
              this.engine.lives -= 1;
            }
            break;
          }
          case "down": {
            if (
              this.currentPosition.x + this.enemyParams.width! <=
              currentStage.limit.x // + this.randomOffset.x
            ) {
              this.moveDown();
            } else {
              // end of map
              this.destroy();
              // decrement life quantity
              this.engine.lives -= 1;
            }
            break;
          }
        }
      }
    }
  }

  public destroy() {
    // pop en enemy
    this.engine.enemies = this.engine.enemies?.filter(
      (enemy: Enemy) => this !== enemy,
    );

    // push enemy to dead enemies
    this.engine.deadEnemies!.push(this);

    // release tower target
    for (const tower of this.engine.towers!) {
      if (tower.target === this) {
        tower.target = null;
      }
    }

    this.engine.score += 1;
    this.engine.money += this.enemyParams.bounty!;
  }
}

export default Enemy;
