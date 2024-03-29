import { ITwoDCoordinates } from "../engine/TDEngine";
import { Enemy } from "../enemies/Enemy";
import { Tower, ITower } from "../towers/Tower";

export interface IProjectile {
  image: CanvasImageSource;
}

export class Projectile {
  constructor(
    public target: Enemy | null,
    public tower: Tower,
    public damage: ITower["towerParams"]["attackDamage"],
    public currentPosition: ITwoDCoordinates = {
      x: 0,
      y: 0,
    },
    public distanceMoved = 0,
    public renderParams = {
      currentFrame: 0,
      isAnimateImpact: false,
    },
  ) {
    this.tower.projectileParams.rectCenterX =
      this.tower.projectileParams?.dimensions[this.tower.upgradeLevel]
        .projectileWidth / 2;
    this.tower.projectileParams.rectCenterY =
      this.tower.projectileParams?.dimensions[this.tower.upgradeLevel]
        .projectileHeight / 2;
    this.currentPosition = {
      x: Math.floor(this.tower.towerParams.fireFromCoords!.x),
      y: Math.floor(this.tower.towerParams.fireFromCoords!.y),
    };
  }

  public getNextFrameIndex(
    limit: number = this.tower.projectileParams.projectileFrameLimit,
  ) {
    if (this.renderParams.currentFrame < limit - 1) {
      this.renderParams.currentFrame += 1;
    } else {
      this.renderParams.currentFrame = 0;
    }
    return this.renderParams.currentFrame;
  }

  public getNextImpactFrameIndex(
    limit: number = this.tower.projectileParams.impactFrameLimit,
  ) {
    if (this.renderParams.currentFrame < limit - 1) {
      this.renderParams.currentFrame += 1;
    } else {
      this.renderParams.currentFrame = 0;
      this.destroy();
    }
    return this.renderParams.currentFrame;
  }

  public draw() {
    this.tower.engine.context!.projectile!.beginPath();
    if (!this.renderParams.isAnimateImpact) {
      const canvas = (
        this.tower.engine.towerSprites[this.tower.type]!.canvasArr?.projectile![
          this.tower.upgradeLevel
        ] as HTMLCanvasElement[]
      )[this.getNextFrameIndex()]!;
      // get current frame to rotate projectile image and draw it in main projectile context
      const context = (
        this.tower.engine.towerSprites[this.tower.type]!.canvasContextArr
          ?.projectile[this.tower.upgradeLevel]! as CanvasRenderingContext2D[]
      )[this.tower.projectileParams.projectileFrameLimit]!;
      // find rectangle diagonal
      const canvasHypot = Math.ceil(
        Math.hypot(
          this.tower.engine.predefinedTowerParams[this.tower.type]
            ?.projectileParams?.dimensions[this.tower.upgradeLevel]
            .projectileWidth!,
          this.tower.engine.predefinedTowerParams[this.tower.type]
            ?.projectileParams?.dimensions[this.tower.upgradeLevel]
            .projectileHeight!,
        ),
      );
      // rotate frame
      context.save();
      context.clearRect(0, 0, canvasHypot, canvasHypot);
      context.beginPath();
      context.translate(canvasHypot / 2, canvasHypot / 2);
      context.rotate(this.tower.towerParams.firingAngle! - 1);
      context.drawImage(canvas, -canvasHypot / 2, -canvasHypot / 2);
      context.closePath();
      context.restore();
      // and draw it
      this.tower.engine.context!.projectile!.drawImage(
        (
          this.tower.engine.towerSprites[this.tower.type]!.canvasArr
            ?.projectile![this.tower.upgradeLevel] as HTMLCanvasElement[]
        )[this.tower.projectileParams.projectileFrameLimit]!,
        Math.ceil(this.currentPosition.x),
        Math.ceil(this.currentPosition.y),
      );
    } else if (this.renderParams.isAnimateImpact) {
      // impact
      this.tower.engine.context!.projectile!.drawImage(
        (
          this.tower.engine.towerSprites[this.tower.type]!.canvasArr?.impact![
            this.tower.upgradeLevel
          ] as HTMLCanvasElement[]
        )[this.getNextImpactFrameIndex()]! as HTMLCanvasElement,
        Math.ceil(this.currentPosition.x),
        Math.ceil(this.currentPosition.y),
      );
    }
    this.tower.engine.context!.projectile!.closePath();
  }

  public move() {
    if (!this.target) {
      this.destroy();
    }
    // increment projectile moved distance by speed
    this.distanceMoved += this.tower.projectileParams.projectileSpeed;
    // vector projectile to the target and increment projectile 2d coords
    this.findTargetVector();
  }

  public findTargetVector() {
    if (!this.target) {
      return;
    }
    // find unit vector
    const xDistance =
      this.target.currentPosition.x +
      this.target.enemyParams.rectCenterX! -
      this.currentPosition.x -
      this.tower.projectileParams.dimensions[this.tower.upgradeLevel]
        .projectileWidth;
    const yDistance =
      this.target.currentPosition.y +
      this.target.enemyParams.rectCenterY! -
      this.currentPosition.y -
      this.tower.projectileParams.dimensions[this.tower.upgradeLevel]
        .projectileHeight;
    const distanceToTarget = Math.hypot(xDistance, yDistance);

    if (distanceToTarget < this.distanceMoved) {
      // collision
      this.collision();
    } else {
      this.currentPosition.x = Math.floor(
        this.currentPosition.x +
          (this.distanceMoved * xDistance) / distanceToTarget,
      );
      this.currentPosition.y = Math.floor(
        this.currentPosition.y +
          (this.distanceMoved * yDistance) / distanceToTarget,
      );
    }
  }

  public isEnemyInSplashRange(enemy: Enemy) {
    const xDistance =
      this.currentPosition.x -
      this.tower.projectileParams.dimensions[this.tower.upgradeLevel]
        .projectileWidth /
        2 -
      (enemy.currentPosition.x + enemy.enemyParams.width! / 2);
    const yDistance =
      this.currentPosition.y -
      this.tower.projectileParams.dimensions[this.tower.upgradeLevel]
        .projectileHeight /
        2 -
      (enemy.currentPosition.y + enemy.enemyParams.height! / 2);
    if (
      Math.hypot(xDistance, yDistance) <
      this.tower.projectileParams.attackModifierRange!
    ) {
      return true;
    }
    return false;
  }

  public collision() {
    // animate impact
    this.renderParams.isAnimateImpact = true;
    if (
      this.target!.enemyParams.hp > 0 &&
      this.tower.engine.enemies!.indexOf(this.target!) > -1
    ) {
      this.target!.enemyParams.hp -= this.damage;
      this.damage = 0;
      // apply attack modifier
      if (this.tower.projectileParams.attackModifier) {
        if (this.tower.projectileParams.attackModifier === "slow") {
          if (this.target!.enemyParams!.modifiedSlowTimer) {
            clearTimeout(this.target?.enemyParams?.modifiedSlowTimer!);
            this.target!.enemyParams!.modifiedSlowTimer = null;
          }
          if (!this.target?.enemyParams?.isModified) {
            const slowCoefficient =
              this.tower.engine.waveGenerator?.waveParams?.waveType === "boss"
                ? this.target!.enemyParams!.speed! * 0.15
                : this.target!.enemyParams!.speed! *
                  0.2 *
                  (this.tower.upgradeLevel + 1);
            this.target!.enemyParams.isModified = true;
            this.target!.enemyParams.attackModifier = "slow";
            this.target!.enemyParams!.speed! -= slowCoefficient;
          }
          this.target!.enemyParams!.modifiedSlowTimer = setTimeout(() => {
            // clear timer
            this.target!.enemyParams!.modifiedSlowTimer = null;
            clearTimeout(this.target?.enemyParams?.modifiedSlowTimer!);
            // restore enemy movement speed
            this.target!.enemyParams!.speed =
              this.target?.enemyParams?.initialSpeed;
            // restore enemy isModified state to false
            this.target!.enemyParams.isModified = false;
          }, this.tower.projectileParams.attackModifierTimeout);
        } else if (this.tower.projectileParams.attackModifier === "splash") {
          // check for enemies in projectile splash range
          this.tower.engine.enemies?.forEach((enemy) => {
            if (this.isEnemyInSplashRange(enemy)) {
              if (enemy !== this.target) {
                enemy.enemyParams.hp -= this.tower.towerParams.attackDamage;
                if (enemy.enemyParams.hp <= 0) {
                  // target is dead
                  enemy.renderParams!.currentFrame = 0;
                  enemy.renderParams!.isAnimateDeath = true;
                  enemy.destroy();
                }
              }
              // destroy projectile
              this.destroy();
            }
          });
        } else if (this.tower.projectileParams.attackModifier === "shock") {
          // stop enemy
          if (
            this.tower.engine.waveGenerator?.waveParams?.waveType === "boss"
          ) {
            // can't stop teh boss
          } else {
            this.target!.enemyParams.isModified = true;
            this.target!.enemyParams.attackModifier = "shock";
            // but can stop any other wave type
            this.target!.enemyParams!.speed! = 0;
            this.target!.enemyParams!.modifiedShockTimer = setTimeout(() => {
              // clear timer
              this.target!.enemyParams!.modifiedShockTimer = null;
              clearTimeout(this.target?.enemyParams?.modifiedShockTimer!);
              // restore enemy movement speed
              this.target!.enemyParams!.speed =
                this.target?.enemyParams?.initialSpeed;
              // restore enemy isModified state to false
              this.target!.enemyParams.isModified = false;
            }, this.tower.projectileParams.attackModifierTimeout);
          }
        } else if (this.tower.projectileParams.attackModifier === "poison") {
          this.target!.enemyParams.isModified = true;
          this.target!.enemyParams.attackModifier = "poison";
          if (!this.target?.enemyParams?.modifiedPoisonDPSInterval) {
            this.target!.enemyParams.modifiedPoisonDPSInterval = setInterval(
              () => {
                // do periodical damage
                this.target!.enemyParams.hp -=
                  this.tower.projectileParams.attackModifierDPS!;
                if (this.target!.enemyParams.hp <= 0) {
                  // target is dead
                  this.target!.renderParams!.currentFrame = 0;
                  this.target!.renderParams!.isAnimateDeath = true;
                  this.target!.destroy();
                  clearTimeout(
                    this.target?.enemyParams?.modifiedPoisonDuration!,
                  );
                  clearTimeout(
                    this.target?.enemyParams?.modifiedPoisonDPSInterval!,
                  );
                  this.target!.enemyParams!.modifiedPoisonDuration = null;
                  this.target!.enemyParams!.modifiedPoisonDPSInterval = null;
                }
              },
              500,
            );
          }
          // destroy projectile
          this.destroy();
          // but can stop any other wave type
          this.target!.enemyParams!.modifiedPoisonDuration = setTimeout(() => {
            // clear timer
            clearTimeout(this.target?.enemyParams?.modifiedPoisonDuration!);
            clearTimeout(this.target?.enemyParams?.modifiedPoisonDPSInterval!);
            this.target!.enemyParams!.modifiedPoisonDuration = null;
            this.target!.enemyParams!.modifiedPoisonDPSInterval = null;

            // restore enemy isModified state to false
            this.target!.enemyParams.isModified = false;
          }, this.tower.projectileParams.attackModifierTimeout);
        } else if (this.tower.projectileParams.attackModifier === "spell") {
          this.tower.engine.castRandomSpell(this.target);
          this.destroy();
        }
      }
    }

    if (
      this.target!.enemyParams.hp <= 0 &&
      this.tower.engine.enemies!.indexOf(this.target!) > -1
    ) {
      // target is dead
      this.target!.renderParams!.currentFrame = 0;
      this.target!.renderParams!.isAnimateDeath = true;
      // destroy projectile
      this.destroy();
      // release tower target
      this.tower.target = null;
      // destroy projectile target
      this.target?.destroy();
    } else if (this.target!.enemyParams.hp <= 0) {
      this.tower.target = null;
    }
  }

  public destroy() {
    if (!this.tower.engine.projectiles?.length) return;
    this.tower.engine.projectiles = this.tower.engine.projectiles!.filter(
      (projectile) => this !== projectile,
    );
  }
}
