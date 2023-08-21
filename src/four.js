import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DragControls } from "./DragControls";
import Obj from "./obj";

export default class Four {
  constructor(dom) {
    this.dom = dom; // 外围dom元素
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null; // 场景移动控制器
    this.transformControls = null;
    this.dragControls = null; // 拖拽控制器
    this.objs = []; // 场景内全部obj
    this.curObj = null; // 当前选中object

    this.init();
    this.initEvent();
    this.initDrag();
    this.animate();
  }

  init() {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfdf5e6); // 添加背景颜色

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.dom.clientWidth / this.dom.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(-10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    let ambient = new THREE.AmbientLight(0x444444, 3); // 添加光源  颜色和光照强度
    let axisHelper = new THREE.AxesHelper(600); // 添加辅助坐标系 参数位辅助坐标系的长度
    this.scene.add(ambient, axisHelper); // 向场景中添加光源 和 辅助坐标系

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 加入去除锯齿功能
    this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
    this.dom.appendChild(this.renderer.domElement);

    // 添加鼠标控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;

    // 添加变换控制器
    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControls.addEventListener("dragging-changed", (event) => {
      this.controls.enabled = !event.value;
      this.controls.enableZoom = !event.value;
    });
    this.scene.add(this.transformControls);

    // 添加地面
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0xf1f3f4 })
    );
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    // 放物体进来
    let pos = [[0,0,0],[10,0,0],[0,0,10]]
    for (let p of pos) {
      let obj = new Obj(...p)
      this.objs.push(obj)
      this.scene.add(obj);
    } 
  }

  initEvent() {
    // 初始化射线辅助器
    const raycaster = new THREE.Raycaster();
    // 鼠标控制对象
    const mouse = new THREE.Vector2();
    // 鼠标移动事件处理函数
    const onDocumentMouseMove = (event) => {
      // 得到鼠标相对于容器的坐标
      mouse.x = (event.clientX / this.dom.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / this.dom.clientHeight) * 2 + 1;
    };
    // 点击事件处理函数
    const onDocumentClick = (event) => {
      // 执行射线检测
      raycaster.setFromCamera(mouse, this.camera);
      let intersects = raycaster.intersectObjects(this.scene.children, true);
      // 判断是否成功
      if (intersects.length > 0) {
        // 选取第一个可拖拽物体并对其执行交互
        let object = intersects.find((val) => val.object.isObj)?.object;
        console.log("objects:", intersects, object);
        const batchSetBorderVisible = (children, show) => {
          for (let child of children) {
            if (child.isSelectBox) {
              child.visible = show;
            }
          }
        };
        if (this.curObj) {
            batchSetBorderVisible(this.curObj.children,false)
          }
        if (object) {
          batchSetBorderVisible(object.children,true)
          this.curObj = object
        } else {
          this.curObj = null
        }
      }
    };
    // 监听鼠标的移动事件
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    // 绑定点击事件
    document.addEventListener("click", onDocumentClick, false);
  }

  initDrag() {
    this.dragControls = new DragControls(
      this.objs,
      this.camera,
      this.renderer.domElement
    );
    this.dragControls.transformGroup = true;
    // 拖拽
    this.dragControls.addEventListener("dragstart", (e) => {
      console.log(e);
      this.controls.enabled = false;
      this.controls.enableZoom = false;
    });
    this.dragControls.addEventListener("dragend", (e) => {
      this.controls.enabled = true;
      this.controls.enableZoom = true;
    });
    this.dragControls.addEventListener("drag", function (e) {
      // 获取模型的边界框
      let boundingBox = new THREE.Box3().setFromObject(e.object);
      // 获取边界框的尺寸
      let size = new THREE.Vector3();
      boundingBox.getSize(size);
      e.object.position.y = size.y / 2;
    });
    // hover
    this.dragControls.addEventListener("hoveron", (e) => {
      if (e.object.isHoverBox) {
        e.object.visible = true
      }
    });
    this.dragControls.addEventListener("hoveroff", (e) => {
      if (e.object.isHoverBox) {
        e.object.visible = false
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }
}
