import * as THREE from "three";
export default class Obj {
  instance;
  constructor(x = 0, y = 0, z = 0) {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.instance = new THREE.Mesh(geometry, material);

    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframeLine = new THREE.LineSegments(wireframe, lineMaterial);
    this.instance.add(wireframeLine);

    // 设置包围框

    // hover时触发的
    let hoverBoundingBox = new THREE.Box3().setFromObject(this.instance);
    let hoverBoxHelper = new THREE.Box3Helper(hoverBoundingBox, 0x00eeff);
    hoverBoxHelper.visible = false
    hoverBoxHelper.isHoverBox = true
    this.instance.add(hoverBoxHelper);
    // 选中时触发的
    let selectBoundingBox = new THREE.Box3().setFromObject(this.instance);
    let selectBoxHelper = new THREE.Box3Helper(selectBoundingBox, 0x1890ff);
    selectBoxHelper.visible = false;
    selectBoxHelper.isSelectBox = true
    this.instance.add(selectBoxHelper);

    // 获取size 用来抵消误差
    this.size = new THREE.Vector3();
    hoverBoundingBox.getSize(this.size);
    this.instance.position.set(
      x + this.size.x / 2,
      y + this.size.y / 2,
      z + this.size.z / 2
    );

    // 标识为可拖拽物体
    this.instance.isObj = true;
    return this.instance;
  }
}
