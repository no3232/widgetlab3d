import * as THREE from "three";

export function isMesh(o: THREE.Object3D): o is THREE.Mesh {
  return (o as any).isMesh === true;
}

export function isGroup(o: THREE.Object3D): o is THREE.Group {
  return (o as any).isGroup === true;
}

export function isCamera(o: THREE.Object3D): o is THREE.Camera {
  return (o as any).isCamera === true;
}

export function isLight(o: THREE.Object3D): o is THREE.Light {
  return (o as any).isLight === true;
}

export function isMeshStandardMaterial(
  o: unknown
): o is THREE.MeshStandardMaterial {
  return (o as any).isMeshStandardMaterial === true;
}
