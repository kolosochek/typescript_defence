import TDEngine, {twoDCoordinatesI} from "../engine/TDEngine";
import Enemy from "../enemies/Enemy";
import {TowerI} from "../towers/Tower";

interface ProjectileI {
    engine: TDEngine,
}
class Projectile {
    constructor(
        public engine: ProjectileI['engine'],
        public targetX: twoDCoordinatesI['x'],
        public targetY: twoDCoordinatesI['y'],
        public target: Enemy,
        public damage: TowerI['towerParam']['attackDamage'],
        public currentPosition: twoDCoordinatesI = {
            x: 0,
            y: 0,
        },
    ) {

    }

    public move(){
        // debug
        console.log(`new projectile`)
        //
        this.engine.context?.beginPath();
        this.engine.context?.strokeRect(
            this.currentPosition.x + 1,
            this.currentPosition.y + 1,
            5,
            5,
            );
        if(this.engine.context){
            this.engine.context.strokeStyle = 'red';
            this.engine.context?.stroke();
        }
    }

}


export default Projectile