import * as THREE from "three";
export class DragPlane {
  plane = new THREE.Plane();
  constructor(public normal = new THREE.Vector3(0, 1, 0)) {}
  setFromPointNormal(point: THREE.Vector3, normal = this.normal) {
    this.plane.setFromNormalAndCoplanarPoint(normal, point);
  }
  intersect(mouse: THREE.Vector2, dom: HTMLDivElement, camera: THREE.Camera) {
    const rect = dom.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((mouse.x - rect.left) / rect.width) * 2 - 1,
      -(((mouse.y - rect.top) / rect.height) * 2 - 1)
    );
    const ray = new THREE.Ray();
    ray.origin.copy((camera as any).position);
    ray.direction
      .set(ndc.x, ndc.y, 0.5)
      .unproject(camera as any)
      .sub((camera as any).position)
      .normalize();
    const pt = new THREE.Vector3();
    ray.intersectPlane(this.plane, pt);
    return pt;
  }
}
