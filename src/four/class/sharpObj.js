import Obj from "./obj";
import * as THREE from "three";
export default class SharpObj extends Obj {
  constructor() {
    super(...arguments);
    let geometry = new THREE.BoxGeometry(2, 2, 2);
    this.object.geometry = geometry;
    super.initBoundingBox();
    super.initDrag();
  }
  drag(e) {
    // e.object.position.x = 0
  }
}
