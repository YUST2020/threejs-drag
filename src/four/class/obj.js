import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { DragControls } from "../DragControls";
import Arrow from "./arrow";
export default class Obj {
  object;
  dragControls;
  options;
  constructor(x = 0, y = 0, z = 0, options = {}) {
    this.options = options;
    // 设置形状材质
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshMatcapMaterial({ color: 0xff0000 });
    this.object = new THREE.Mesh(geometry, material);

    const size = this.getSize();
    // 抵消误差
    this.object.position.set(x + size.x / 2, y + size.y / 2, z + size.z / 2);

    // 3d标签
    // const positionDiv = document.createElement("div");
    // Object.assign(positionDiv.style, {
    //   backgroundColor: "#888888",
    //   height: size.x + "px",
    //   width: size.z + "px",
    //   pointerEvents: "none",
    // });
    // const posObject = new CSS3DObject(positionDiv);
    // posObject.position.set(-size.x, -size.y / 2, 0);
    // posObject.rotation.x = Math.PI / 2;
    // this.object.add(posObject);

    // 初始化底部箭头
    const showBottomArrow = () => {};
    this.object.showBottomArrow = showBottomArrow;

    // 标识为可拖拽物体
    this.object.isObj = true;

    this.initBoundingBox();
    this.initDrag();
  }
  getSize() {
    const boundingBox = new THREE.Box3().setFromObject(this.object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    return size;
  }
  // 初始化hover和select的包围框
  initBoundingBox() {
    // 二次生成时对之前的先进行移除
    const removeList = [];
    for (let i of this.object.children) {
      if (i.isHoverBox || i.isSelectBox) {
        removeList.push(i);
      }
    }
    for (let i of removeList) {
      this.object.remove(i);
    }

    let cloneObj = this.object.clone();
    cloneObj.position.set(0, 0, 0);
    // 包围盒
    const boundingBox = new THREE.Box3().setFromObject(cloneObj);
    // hover时触发的
    let hoverBoxHelper = new THREE.Box3Helper(boundingBox, 0x00eeff);
    hoverBoxHelper.visible = false;
    hoverBoxHelper.isHoverBox = true;
    this.object.add(hoverBoxHelper);
    // 选中时触发的
    let selectBoxHelper = new THREE.Box3Helper(boundingBox, 0x1890ff);
    selectBoxHelper.visible = false;
    selectBoxHelper.isSelectBox = true;
    this.object.add(selectBoxHelper);
  }
  initDrag() {
    // 重复调用判定
    this.dragControls?.deactivate();
    this.arrowX && this.options.scene.remove(this.arrowX);
    this.arrowZ && this.options.scene.remove(this.arrowZ);

    const size = this.getSize();
    // z方向拖拽箭头
    const { object: arrowZ } = new Arrow();
    arrowZ.position.copy(this.object.position);
    arrowZ.rotation.x = Math.PI / 2;
    arrowZ.position.z += size.z + 0.5;
    arrowZ.isZDirection = true;
    this.options.scene.add(arrowZ);
    // x方向拖拽箭头
    const { object: arrowX } = new Arrow();
    arrowX.position.copy(this.object.position);
    arrowX.rotation.z = -Math.PI / 2;
    arrowX.position.x += size.x + 0.5;
    arrowX.isXDirection = true;
    this.options.scene.add(arrowX);

    // 生成物体运动的平面
    const plane = new THREE.Plane();
    const normal = new THREE.Vector3(0, 1, 0); // x-z平面的法线向量
    const point = new THREE.Vector3(0, 0, 0); // 经过平面的点
    plane.setFromNormalAndCoplanarPoint(normal, point);
    // 此处第4个参数为修改源码添加的自定义参数，用于指定物体只能在某一个平面上运动
    this.dragControls = new DragControls(
      [this.object, arrowZ, arrowX],
      this.options.camera,
      this.options.renderer.domElement,
      plane,
      true
    );
    this.dragControls.transformGroup = true;
    let xInit = null;
    let zInit = null;
    // 拖拽事件监听
    this.dragControls.addEventListener("dragstart", (e) => {
      console.log("dragStart", e.intersections);
      if (e.intersections[0]?.object?.isXDirection) {
        zInit = this.object.position.z;
      }
      if (e.intersections[0]?.object?.isZDirection) {
        xInit = this.object.position.x;
      }
      this.options.controls.enabled = false;
      this.options.controls.enableZoom = false;
      typeof this.dragStart === "function" && this.dragStart(e);
    });
    this.dragControls.addEventListener("dragend", (e) => {
      this.options.controls.enabled = true;
      this.options.controls.enableZoom = true;
      xInit = null;
      zInit = null;
      typeof this.dragEnd === "function" && this.dragEnd(e);
    });
    this.dragControls.addEventListener("drag", (e) => {
      if (typeof xInit === "number") {
        e.object.position.x = xInit;
        arrowX.position.x = xInit + size.x + 0.5
        arrowZ.position.x = xInit
      }
      if (typeof zInit === "number") {
        e.object.position.z = zInit;
        arrowX.position.z = zInit
        arrowZ.position.z = zInit + size.x + 0.5
      }
      //arrowX.position.copy(e.object.position);
      // arrowX.position.x += size.x + 0.5;
      // arrowZ.position.copy(e.object.position);
      // arrowZ.position.z += size.z + 0.5;

      typeof this.drag === "function" && this.drag(e);
    });
    // hover
    this.dragControls.addEventListener("hoveron", (e) => {
      if (e.object.isHoverBox) {
        e.object.visible = true;
      }
      typeof this.hoverOn === "function" && this.hoverOn(e);
    });
    this.dragControls.addEventListener("hoveroff", (e) => {
      if (e.object.isHoverBox) {
        e.object.visible = false;
      }
      typeof this.hoverOff === "function" && this.hoverOff(e);
    });
    this.arrowX = arrowX;
    this.arrowZ = arrowZ;
  }
}
