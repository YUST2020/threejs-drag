import * as THREE from "three";
export default class Obj {
    instance
    constructor(x = 0, y = 0, z = 0) {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.instance = new THREE.Mesh(geometry, material);
        this.instance.position.set(x,y,z);
    
        const wireframe = new THREE.WireframeGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const wireframeLine = new THREE.LineSegments(wireframe, lineMaterial);
        this.instance.add(wireframeLine);
        return this.instance
    }
}