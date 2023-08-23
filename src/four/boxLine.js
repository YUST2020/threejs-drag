import {
    BufferGeometry,
    Float32BufferAttribute,
    LineSegments,
    LineDashedMaterial,
    Box3,
    Vector3 
} from 'three'
   
  /**
   * 画 Box 虚线工具
   */
  export class DashLinesBoxTool{
   
      constructor(){}
   
      /**
       * 根据长宽高 创建虚线框
       * @param {Object} width
       * @param {Object} height
       * @param {Object} depth
       * @param {Object} color
       * @param {Object} dashSize
       * @param {Object} gapSize
       */
      static createDashLinesBox(width, height, depth,color=0x0000ff,dashSize=1,gapSize=1){
          const geometryBox = DashLinesBoxTool.getBoxGeometry( width, height, depth );
          const lineSegments = new LineSegments( geometryBox, new LineDashedMaterial( {  color,  dashSize,  gapSize } ) );
          lineSegments.computeLineDistances();
          lineSegments.name = 'border-outer'
          lineSegments.visible = false
          return lineSegments
      }
   
      /**
       * 根据几何体 object 创建虚线框
       * @param {Object} object
       * @param {Object} color
       * @param {Object} dashSize
       * @param {Object} gapSize
       */
      static createDashLinesBoxWithObject(object, color=0x0000ff,dashSize=1,gapSize=1){
          var v3Size = DashLinesBoxTool.getObjectBoxSize(object)
          return DashLinesBoxTool.createDashLinesBox(v3Size.x,v3Size.y,v3Size.z,color,dashSize,gapSize)
      }
   
      /**
       * 根据 Object 计算几何长宽高, 并 Vector3 形式返回
       * @param {Object} object
       */
      static getObjectBoxSize(object){
          const box3 = new Box3()
          box3.expandByObject(object)
          const v3 = new Vector3()
          box3.getSize(v3)
   
          console.log("v3 ", v3)
          return v3
      }
   
      /**
       * 根据长宽高生产对应线框点集
       * @param {Object} width
       * @param {Object} height
       * @param {Object} depth
       */
      static getBoxGeometry( width, height, depth ) {
   
          width = width * 0.5,
          height = height * 0.5,
          depth = depth * 0.5;
   
          const geometry = new BufferGeometry();
          const position = [];
   
          // 创建虚线点
          position.push(
              - width, - height, - depth,
              - width, height, - depth,
   
              - width, height, - depth,
              width, height, - depth,
   
              width, height, - depth,
              width, - height, - depth,
   
              width, - height, - depth,
              - width, - height, - depth,
   
              - width, - height, depth,
              - width, height, depth,
   
              - width, height, depth,
              width, height, depth,
   
              width, height, depth,
              width, - height, depth,
   
              width, - height, depth,
              - width, - height, depth,
   
              - width, - height, - depth,
              - width, - height, depth,
   
              - width, height, - depth,
              - width, height, depth,
   
              width, height, - depth,
              width, height, depth,
   
              width, - height, - depth,
              width, - height, depth
           );
   
          geometry.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );
   
          return geometry;
   
      }
  }