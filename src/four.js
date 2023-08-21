import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DashLinesBoxTool } from "./boxLine";
import Obj from './obj'

export default class Four {
  constructor(dom) {
    this.dom = dom;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ball = null;
    this.controls = null;
    this.transformControls = null

    this.init();
    this.initEvent()
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
    this.camera.position.set(10, 10, 10);
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

    this.ball = new Obj()
    this.scene.add(this.ball);

    // 添加变换控制器
    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    // this.transformControls.attach(this.ball);
    this.transformControls.addEventListener("dragging-changed", (event) => {
      this.controls.enabled = !event.value;
      this.controls.enableZoom = !event.value;
    });
    this.scene.add(this.transformControls);
    // 边框
    const lineSegments = DashLinesBoxTool.createDashLinesBoxWithObject(
      this.ball,
      "#ff0000",
      0.1,
      0.1
    );
    this.ball.add(lineSegments);
  }

  initEvent() {
     // 初始化射线辅助器
     const raycaster = new THREE.Raycaster();
     // 鼠标控制对象
     const mouse = new THREE.Vector2();
     // 鼠标移动事件处理函数
     const onDocumentMouseMove = (event) => {
       // 得到鼠标相对于容器的坐标
       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
     }
     // 点击事件处理函数
     const onDocumentClick = (event) => {
       console.log(mouse);
       // 执行射线检测
       raycaster.setFromCamera(mouse, this.camera);
       let intersects = raycaster.intersectObjects(this.scene.children, true);
       // 判断是否成功
       if (intersects.length > 0) {
         // 选取第一个物体并对其执行交互
         let object = intersects.find(val => val.object.type === 'Mesh')?.object;
         console.log("objects:", intersects, object);
         this.transformControls.detach()
         const batchSetBorderVisible = (children, show) => {
          for (let child of children) {
            if (child.name === 'border-outer') {
              child.visible = show
            }
          }
         }
         if (object) {
          this.transformControls.attach(object)
          this.transformControls.visible = true
          batchSetBorderVisible(object.children, true)
         } else {
          this.transformControls.visible = false
          batchSetBorderVisible(this.ball.children, false)
         }
       }
     };
     // 监听鼠标的移动事件
     document.addEventListener("mousemove", onDocumentMouseMove, false);
     // 绑定点击事件
     document.addEventListener("click", onDocumentClick, false);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }
}

