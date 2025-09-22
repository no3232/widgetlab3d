import * as THREE from 'three';
export function pickFirstIntersect(
x: number,
y: number,
dom: HTMLDivElement,
camera: THREE.PerspectiveCamera,
scene: THREE.Scene
) {
const rect = dom.getBoundingClientRect();
const ndc = new THREE.Vector2(
((x - rect.left) / rect.width) * 2 - 1,
-(((y - rect.top) / rect.height) * 2 - 1)
);
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(ndc, camera);
const objects: THREE.Object3D[] = [];
scene.traverse((o) => { if ((o as any).isMesh) objects.push(o); });
const hits = raycaster.intersectObjects(objects as any, true);
return hits[0]; // undefined if none
}