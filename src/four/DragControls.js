import {
  EventDispatcher, // 事件分发器，用于处理事件
  Matrix4, // 矩阵4，用于进行矩阵变换
  Plane, // 平面，用于表示拖拽平面
  Raycaster, // 射线投射器，用于进行射线检测
  Vector2, // 二维向量，用于表示鼠标位置
  Vector3, // 三维向量，用于表示物体位置
} from "three";

let _plane = new Plane(); // 创建平面对象，用于表示拖拽平面
const _raycaster = new Raycaster(); // 创建射线投射器对象，用于进行射线检测

const _pointer = new Vector2(); // 创建二维向量对象，用于表示鼠标位置
const _offset = new Vector3(); // 创建三维向量对象，用于表示物体位置的偏移量
const _intersection = new Vector3(); // 创建三维向量对象，用于表示射线与平面的交点
const _worldPosition = new Vector3(); // 创建三维向量对象，用于表示物体的世界坐标
const _inverseMatrix = new Matrix4(); // 创建矩阵4对象，用于进行矩阵变换的逆矩阵

class DragControls extends EventDispatcher {
  constructor(_objects, _camera, _domElement, targetPlane) {
    super();

    _domElement.style.touchAction = "none"; // 禁用触摸滚动

    let _selected = null, // 当前选中的物体
      _hovered = null; // 当前悬停的物体

    const _intersections = []; // 射线与物体的交点数组

    const scope = this; // 保存DragControls实例的引用

    function activate() {
      _domElement.addEventListener("pointermove", onPointerMove); // 监听鼠标移动事件
      _domElement.addEventListener("pointerdown", onPointerDown); // 监听鼠标按下事件
      _domElement.addEventListener("pointerup", onPointerCancel); // 监听鼠标松开事件
      _domElement.addEventListener("pointerleave", onPointerCancel); // 监听鼠标离开事件
    }

    function deactivate() {
      _domElement.removeEventListener("pointermove", onPointerMove); // 移除鼠标移动事件监听
      _domElement.removeEventListener("pointerdown", onPointerDown); // 移除鼠标按下事件监听
      _domElement.removeEventListener("pointerup", onPointerCancel); // 移除鼠标松开事件监听
      _domElement.removeEventListener("pointerleave", onPointerCancel); // 移除鼠标离开事件监听

      _domElement.style.cursor = ""; // 恢复鼠标样式
    }

    function dispose() {
      deactivate(); // 停用DragControls
    }

    function getObjects() {
      return _objects; // 返回物体数组
    }

    function getRaycaster() {
      return _raycaster; // 返回射线投射器对象
    }

    // 处理鼠标移动事件
    function onPointerMove(event) {
      if (scope.enabled === false) return; // 如果DragControls被禁用，则直接返回

      updatePointer(event); // 更新鼠标位置

      _raycaster.setFromCamera(_pointer, _camera); // 根据鼠标位置和相机创建射线

      if (_selected) { // 如果有选中的物体
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) { // 射线与平面相交
          _selected.position.copy( // 更新选中物体的位置
            _intersection.sub(_offset).applyMatrix4(_inverseMatrix)
          );
        }

        scope.dispatchEvent({ type: "drag", object: _selected }); // 分发drag事件

        return; // 结束函数执行
      }

      // hover支持

      if (event.pointerType === "mouse" || event.pointerType === "pen") { // 如果是鼠标或者触摸笔事件
        _intersections.length = 0; // 清空射线与物体的交点数组

        _raycaster.setFromCamera(_pointer, _camera); // 根据鼠标位置和相机创建射线
        _raycaster.intersectObjects(_objects, true, _intersections); // 射线与物体进行相交检测

        if (_intersections.length > 0) { // 如果有相交的物体
          const object = _intersections[0].object; // 获取第一个相交的物体

          if (targetPlane) { // 如果有目标平面
            _plane = targetPlane; // 使用目标平面
          } else {
            _plane.setFromNormalAndCoplanarPoint( // 根据相机的朝向和物体的世界坐标创建平面
              _camera.getWorldDirection(_plane.normal),
              _worldPosition.setFromMatrixPosition(object.matrixWorld)
            );
          }

          if (_hovered !== object && _hovered !== null) { // 如果当前悬停的物体不是相交的物体且不为空
            scope.dispatchEvent({ type: "hoveroff", object: _hovered }); // 分发hoveroff事件

            _domElement.style.cursor = "auto"; // 恢复鼠标样式
            _hovered = null; // 清空当前悬停的物体
          }

          if (_hovered !== object) { // 如果当前悬停的物体不是相交的物体
            scope.dispatchEvent({ type: "hoveron", object: object }); // 分发hoveron事件

            _domElement.style.cursor = "pointer"; // 设置鼠标样式为指针
            _hovered = object; // 更新当前悬停的物体
          }
        } else {
          if (_hovered !== null) { // 如果当前悬停的物体不为空
            scope.dispatchEvent({ type: "hoveroff", object: _hovered }); // 分发hoveroff事件

            _domElement.style.cursor = "auto"; // 恢复鼠标样式
            _hovered = null; // 清空当前悬停的物体
          }
        }
      }
    }
    // 处理鼠标按下事件
    function onPointerDown(event) {
      if (scope.enabled === false) return; // 如果DragControls被禁用，则直接返回

      updatePointer(event); // 更新鼠标位置

      _intersections.length = 0; // 清空射线与物体的交点数组

      _raycaster.setFromCamera(_pointer, _camera); // 根据鼠标位置和相机创建射线

      _raycaster.intersectObjects(_objects, true, _intersections); // 射线与物体进行相交检测

      if (_intersections.length > 0) { // 如果有相交的物体
        _selected =
          scope.transformGroup === true
            ? _objects[0] // 如果transformGroup为true，则选中第一个物体
            : _intersections[0].object; // 否则选中第一个相交的物体
        if (targetPlane) { // 如果有目标平面
          _plane = targetPlane; // 使用目标平面
        } else {
          _plane.setFromNormalAndCoplanarPoint( // 根据相机的朝向和物体的世界坐标创建平面
            _camera.getWorldDirection(_plane.normal),
            _worldPosition.setFromMatrixPosition(_selected.matrixWorld)
          );
        }
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) { // 射线与平面相交
          _inverseMatrix.copy(_selected.parent.matrixWorld).invert(); // 复制选中物体的父级世界矩阵并求逆矩阵
          _offset
            .copy(_intersection)
            .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld)); // 计算偏移量
        }

        _domElement.style.cursor = "move"; // 设置鼠标样式为移动

        scope.dispatchEvent({ type: "dragstart", object: _selected }); // 分发dragstart事件
      }
    }
    function onPointerCancel() {
      if (scope.enabled === false) return; // 如果DragControls被禁用，则直接返回

      if (_selected) { // 如果有选中的物体
        scope.dispatchEvent({ type: "dragend", object: _selected }); // 分发dragend事件

        _selected = null; // 清空选中的物体
      }

      _domElement.style.cursor = _hovered ? "pointer" : "auto"; // 根据当前悬停的物体设置鼠标样式
    }

    function updatePointer(event) {
      const rect = _domElement.getBoundingClientRect(); // 获取dom元素的边界矩形

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // 计算鼠标在x轴上的归一化坐标
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1; // 计算鼠标在y轴上的归一化坐标
    }

    activate(); // 激活DragControls
    // API

    this.enabled = true;
    this.transformGroup = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getRaycaster = getRaycaster;
  }
}

export { DragControls };

