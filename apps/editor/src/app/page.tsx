"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { add } from "@widgetlab/wasm-layout";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1) WASM 초기화 & 테스트 호출
    (async () => {
      const result = add(2, 3);
      console.log("[WASM] add(2,3)=", result); // 5가 뜨면 성공
    })();

    // 2) Three.js Hello Cube
    const el = containerRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111214);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(1.8, 1.2, 2.2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6ea8fe,
      metalness: 0.2,
      roughness: 0.6,
    });
    const cube = new THREE.Mesh(geo, mat);
    scene.add(cube);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.05, 1.05),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
    );
    scene.add(frame);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const resize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(size, size, false);
      renderer.domElement.style.width = `${size}px`;
      renderer.domElement.style.height = `${size}px`;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    const onFrame = () => {
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.005;
      frame.rotation.copy(cube.rotation);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(onFrame);
    };

    let raf = requestAnimationFrame(onFrame);
    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
