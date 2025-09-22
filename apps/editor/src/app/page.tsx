"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isMesh } from "@widgetlab/three-utils";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current!;
    if (!el) return;

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111214);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(3, 3, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // 캔버스가 컨테이너 전체를 채우도록
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const canvas = renderer.domElement;

    // Light / Grid
    const light = new THREE.DirectionalLight(0xffffff, 1.6);
    light.position.set(4, 6, 3);
    scene.add(light);

    const grid = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    scene.add(grid);

    // Boxes
    const makeBox = (id: string, x: number) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          color: 0x6ea8fe,
          metalness: 0.2,
          roughness: 0.6,
        })
      );
      m.position.set(x, 0.5, 0);

      m.userData.id = id;
      scene.add(m);
      return m;
    };
    makeBox("box-a", -1.5);
    makeBox("box-b", 1.5);

    // Helper
    const helper = new THREE.BoxHelper(new THREE.Object3D(), 0xffcc00);
    helper.visible = false;
    scene.add(helper);
    const showHelper = (obj: THREE.Object3D | null) => {
      if (!obj) {
        helper.visible = false;
        return;
      }
      helper.setFromObject(obj);
      helper.visible = true;
    };

    // Picking
    const raycaster = new THREE.Raycaster();
    const toNDC = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect(); // 캔버스 기준!
      return new THREE.Vector2(
        ((cx - r.left) / r.width) * 2 - 1,
        -(((cy - r.top) / r.height) * 2 - 1)
      );
    };
    const pick = (cx: number, cy: number) => {
      const ndc = toNDC(cx, cy);
      raycaster.setFromCamera(ndc, camera);
      const meshes: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (isMesh(o)) meshes.push(o);
      });
      const hits = raycaster.intersectObjects(meshes, true);
      return hits[0];
    };

    // Drag plane
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = (cx: number, cy: number) => {
      const ndc = toNDC(cx, cy);
      raycaster.setFromCamera(ndc, camera);
      const pt = new THREE.Vector3();
      return raycaster.ray.intersectPlane(dragPlane, pt) ? pt : null;
    };

    // Drag state
    let dragging = false;
    let target: THREE.Object3D | null = null;
    const offset = new THREE.Vector3();
    const snap1 = (v: number) => Math.round(v / 1) * 1;

    // Pointer events on the CANVAS (중요)
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId); // 캔버스에 캡처
      const hit = pick(e.clientX, e.clientY);
      if (!hit) {
        target = null;
        showHelper(null);
        return;
      }

      target = hit.object;
      showHelper(target);

      // 평면을 클릭 지점 높이에 맞춤 (y = hit.point.y)
      dragPlane.set(new THREE.Vector3(0, 1, 0), -hit.point.y);

      const p0 = planeHit(e.clientX, e.clientY);
      if (!p0) {
        target = null;
        return;
      }
      offset.copy(target.position).sub(p0);
      dragging = true;
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging || !target) return;
      const p = planeHit(e.clientX, e.clientY);
      if (!p) return;
      const next = new THREE.Vector3().copy(p).add(offset);
      if (e.shiftKey) {
        next.x = snap1(next.x);
        next.z = snap1(next.z);
      }
      target.position.set(next.x, target.position.y, next.z);
      showHelper(target);
    };

    const onUp = (e: PointerEvent) => {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      dragging = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);

    // Resize & render
    const resize = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
    };
    let raf = 0;
    const frame = () => {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      renderer.dispose();
      el.removeChild(canvas);
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen select-none" />;
}
