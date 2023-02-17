import TDEngine, {
  ITwoDCoordinates,
  TTowerSpriteElements,
  TTowerSpriteTypes,
} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import Projectile, { IProjectile } from "../projectiles/Projectile";

export interface ITower {
  engine: TDEngine;
  type: TTowerSpriteTypes;
  upgradeLevel: 0 | 1 | 2;
  towerParams: {
    attackRate: number;
    attackDamage: number;
    attackRange: number;
    width: number;
    height: number;
    rectCenterX: number;
    rectCenterY: number;
    strokeStyle: string;
    firingAngle: number;
    prevFiringAngle?: number;
    fireFromCoords: ITwoDCoordinates;
    price?: number;
  };
  projectileParams: {
    acceleration: number;
    projectileSpeed: number;
    targetX: number;
    targetY: number;
    rectCenterX: number;
    rectCenterY: number;
    width: number;
    height: number;
    projectileHitAlive: number;
    frameLimit: number;
  };
  image: CanvasImageSource;
  attackIntervalTimer: NodeJS.Timer | null;
}

class Tower {
  public target?: Enemy | null;

  public isCanFire? = false;

  constructor(
    public engine: ITower["engine"],
    public type: ITower["type"],
    public upgradeLevel: ITower["upgradeLevel"] = 0,
    public currentPosition: ITwoDCoordinates = {
      x: 0,
      y: 0,
    },
    public towerParams: ITower["towerParams"] = {
      attackRate: 1000,
      attackDamage: 30,
      attackRange: 120,
      width: 64,
      height: 128,
      rectCenterX: 0,
      rectCenterY: 0,
      strokeStyle: "red",
      firingAngle: 0,
      prevFiringAngle: 0,
      fireFromCoords: { x: 0, y: 0 },
      price: 15,
    },
    public projectileParams: ITower["projectileParams"] = {
      acceleration: 1.2,
      projectileSpeed: 0.1,
      targetX: 0,
      targetY: 0,
      rectCenterX: 0,
      rectCenterY: 0,
      width: 10,
      height: 10,
      projectileHitAlive: 100,
      frameLimit: 3,
    },
    public renderParams = {
      cannonWeaponArr: "levelOneWeapon",
      cannonProjectileArr: "levelOneProjectile",
      cannonOffset: { x: 0, y: 0 },
      cannonFrameLimit: 6,
      cannonCurrentFrame: 0,
      isCannonAnimate: false,
    },
    public attackIntervalTimer: ITower["attackIntervalTimer"] = null,
  ) {
    this.towerParams.rectCenterX = this.towerParams.width / 2;
    this.towerParams.rectCenterY = this.towerParams.height / 2;

    // set proper render weapon array
    this.renderParams.cannonWeaponArr =
      this.upgradeLevel === 0
        ? "levelOneWeapon"
        : this.upgradeLevel === 1
        ? "levelTwoWeapon"
        : "levelThreeWeapon";

    // set proper render projectile array
    this.renderParams.cannonProjectileArr =
      this.upgradeLevel === 0
        ? "levelOneProjectile"
        : this.upgradeLevel === 1
        ? "levelTwoProjectile"
        : "levelThreeProjectile";

    // predefine render params to each tower
    switch (this.type) {
      case "one": {
        switch (this.upgradeLevel) {
          case 0: {
            this.renderParams.cannonOffset.x = 0;
            this.renderParams.cannonOffset.y = 8;
            break;
          }
          case 1: {
            this.renderParams.cannonOffset.x = 0;
            this.renderParams.cannonOffset.y = 18;
            break;
          }
          case 2: {
            this.renderParams.cannonOffset.x = 0;
            this.renderParams.cannonOffset.y = 24;
            break;
          }
        }
        break;
      }
    }
  }

  public getNextCannonFrame() {
    if (this.renderParams.isCannonAnimate) {
      if (
        this.renderParams.cannonCurrentFrame <
        this.renderParams.cannonFrameLimit - 1
      ) {
        this.renderParams.cannonCurrentFrame += 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
    return this.renderParams.cannonCurrentFrame;
  }

  public drawBase(context: CanvasRenderingContext2D) {
    // tower base
    context.beginPath();
    context.drawImage(
      this.engine.towerSprites[this.type]!.canvasArr?.base![this.upgradeLevel]!,
      this.currentPosition.x - this.towerParams.width,
      this.currentPosition.y - this.towerParams.height,
      this.towerParams.width,
      this.towerParams.height,
    );
    context.closePath();
  }

  public drawCannon(context: CanvasRenderingContext2D) {
    // tower cannon
    context.save();
    context.beginPath();
    context.translate(
      this.currentPosition.x -
        this.towerParams.rectCenterX +
        this.renderParams.cannonOffset.x,
      this.currentPosition.y -
        this.towerParams.rectCenterY -
        this.renderParams.cannonOffset.y,
    );
    context.rotate(this.towerParams.firingAngle - 1);
    context.drawImage(
      this.engine.towerSprites[this.type]!.canvasArr?.[
        this.renderParams.cannonWeaponArr as TTowerSpriteElements
      ]![this.renderParams.isCannonAnimate ? this.getNextCannonFrame() : 0]!,
      -this.towerParams.rectCenterX,
      -this.towerParams.rectCenterY + this.projectileParams.width,
    );
    context.closePath();
    context.restore();
    // set new firing angle
    this.towerParams.prevFiringAngle = this.towerParams.firingAngle;
    // set new firing point
    this.towerParams.fireFromCoords = {
      x:
        this.currentPosition.x -
        this.towerParams.rectCenterX -
        this.projectileParams.width,
      y:
        this.currentPosition.y -
        this.towerParams.rectCenterY -
        this.projectileParams.height,
    };
  }

  public drawDraft() {
    // draw tower range
    if (this.engine.isCanBuild) {
      this.engine.draftTower?.drawTowerRange();
    }
    // tower base
    this.drawBase(this.engine.buildContext!);
    // tower cannon
    this.drawCannon(this.engine.buildContext!);
  }

  public draw() {
    // draw tower object
    // tower base
    this.drawBase(this.engine.towerContext!);
    // tower cannon
    this.drawCannon(this.engine.cannonContext!);
  }

  public setAttackInterval = () => {
    if (this.attackIntervalTimer) return;
    // clear memory
    clearInterval(this.attackIntervalTimer!);
    this.attackIntervalTimer = null;
    // initial fire
    this.isCanFire = true;
    // then set attack interval
    this.attackIntervalTimer = setInterval(() => {
      this.renderParams.cannonCurrentFrame = 0;
      this.renderParams.isCannonAnimate = true;
      this.isCanFire = true;
    }, this.towerParams.attackRate);
  };

  public drawTowerRange() {
    this.engine.buildContext?.beginPath();
    this.engine.buildContext!.lineWidth = 0.5;
    this.engine.buildContext?.setLineDash([10, 15]);
    this.engine.buildContext!.strokeStyle = this.towerParams.strokeStyle;
    // draw tower range
    this.engine.buildContext?.arc(
      this.currentPosition.x - this.towerParams.width / 2,
      this.currentPosition.y - this.towerParams.height / 2,
      this.towerParams.attackRange,
      0,
      360,
    );
    this.engine.buildContext?.stroke();
    this.engine.buildContext?.closePath();
  }

  public isEnemyInRange(enemy: Enemy) {
    if (enemy.currentPosition.x + enemy.enemyParams.width! < 0) return false;
    const xDistance =
      enemy.currentPosition.x -
      this.currentPosition.x +
      enemy.enemyParams.width!;
    const yDistance =
      enemy.currentPosition.y -
      this.currentPosition.y +
      enemy.enemyParams.height!;
    if (Math.hypot(xDistance, yDistance) < this.towerParams.attackRange) {
      this.target = enemy;
      if (!this.attackIntervalTimer) {
        this.setAttackInterval();
      }
      return true;
    }
    return false;
  }

  public findTarget() {
    if (!this.engine.enemies!.length) return;
    if (!this.target) {
      this.engine.enemies?.forEach((enemy) => {
        // check range only for closest enemies
        if (
          Math.abs(enemy.currentPosition.x - this.currentPosition.x) <
            this.towerParams.attackRange &&
          Math.abs(enemy.currentPosition.y - this.currentPosition.y) <
            this.towerParams.attackRange
        ) {
          return this.isEnemyInRange(enemy);
        }
        return false;
      });
    } else {
      if (!this.isEnemyInRange(this.target)) {
        this.target = null;
        this.renderParams.isCannonAnimate = false;
        clearInterval(this.attackIntervalTimer!);
        this.attackIntervalTimer = null;
      }
    }
  }

  public findTargetAngle() {
    // there is no spoon, Neo
    if (!this.target) return;
    const xDistance =
      this.target.currentPosition.x -
      this.currentPosition.x +
      this.target.enemyParams.rectCenterX!;
    const yDistance =
      this.target.currentPosition.y -
      this.currentPosition.y +
      this.target.enemyParams.rectCenterY!;
    this.towerParams.firingAngle =
      Math.atan2(yDistance, xDistance) + Math.PI - Math.PI / 4;
    // this.towerParams.firingAngle = Math.floor(
    //  Math.atan2(yDistance, xDistance) + Math.PI,
    // ); // Math.atan2(yDistance, xDistance) + Math.PI;
  }

  public fire() {
    if (this.isCanFire && this.target) {
      this.engine.projectiles = [
        ...this.engine.projectiles!,
        new Projectile(
          this.target!,
          this,
          this.towerParams.attackDamage,
          this.towerParams.fireFromCoords,
        ),
      ];

      this.isCanFire = false;
    }
  }

  public destroy() {
    this.engine.towers = this.engine.towers!.filter((tower) => this !== tower);
  }
}

export default Tower;
