import * as THREE from "three";

export default class Arrow {
  object;
  options;
  constructor(x = 0, y = 0, z = 0, options = {}) {
    this.options = options;
    // 设置形状材质
    const geometry = new THREE.ConeGeometry( 0.25, 2, 4 );
    const material = new THREE.MeshMatcapMaterial({ color: 0xFFF44F });
    this.object = new THREE.Mesh(geometry, material);
  }
  getSize() {
    const boundingBox = new THREE.Box3().setFromObject(this.object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    return size;
  }
}
