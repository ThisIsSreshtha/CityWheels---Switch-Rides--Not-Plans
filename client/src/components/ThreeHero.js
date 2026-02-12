import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * ThreeHero – animated 3D particle / vehicle-themed background
 * Renders floating geometric shapes (wheels, roads, city outlines)
 * that react to mouse movement. Lightweight: ~200 objects max.
 */
const ThreeHero = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* ---- Renderer ---- */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    /* ---- Scene & Camera ---- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 18);

    /* ---- Lights ---- */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x667eea, 1.4, 50);
    pointLight.position.set(5, 8, 10);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xff9800, 0.8, 50);
    pointLight2.position.set(-6, -4, 8);
    scene.add(pointLight2);

    /* ---- Materials ---- */
    const matPrimary = new THREE.MeshStandardMaterial({
      color: 0x667eea,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.7,
    });
    const matAccent = new THREE.MeshStandardMaterial({
      color: 0xff9800,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.6,
    });
    const matPurple = new THREE.MeshStandardMaterial({
      color: 0x764ba2,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.5,
    });

    /* ---- Geometries ---- */
    const geoTorus = new THREE.TorusGeometry(0.6, 0.2, 16, 40);   // wheels
    const geoBox = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const geoSphere = new THREE.SphereGeometry(0.4, 24, 24);
    const geoOcta = new THREE.OctahedronGeometry(0.5);
    const geoCyl = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16); // road poles

    const geos = [geoTorus, geoBox, geoSphere, geoOcta, geoCyl];
    const mats = [matPrimary, matAccent, matPurple];

    /* ---- Create meshes ---- */
    const meshes = [];
    const count = Math.min(window.innerWidth > 768 ? 60 : 30, 60);

    for (let i = 0; i < count; i++) {
      const geo = geos[Math.floor(Math.random() * geos.length)];
      const mat = mats[Math.floor(Math.random() * mats.length)].clone();
      mat.opacity = 0.15 + Math.random() * 0.45;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12 - 4
      );
      const s = 0.3 + Math.random() * 0.9;
      mesh.scale.set(s, s, s);
      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.003,
        speedY: (Math.random() - 0.5) * 0.003,
        rotX: (Math.random() - 0.5) * 0.008,
        rotY: (Math.random() - 0.5) * 0.008,
      };
      scene.add(mesh);
      meshes.push(mesh);
    }

    /* ---- Connecting lines (road network feel) ---- */
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.08,
    });
    const lineGroup = new THREE.Group();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const a = meshes[i];
      const b = meshes[(i + 7) % count];
      const pts = [a.position.clone(), b.position.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      lineGroup.add(new THREE.Line(geo, lineMat));
    }
    scene.add(lineGroup);

    /* ---- Mouse tracking ---- */
    const mouse = { x: 0, y: 0 };
    const handleMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    /* ---- Resize handler ---- */
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    /* ---- Animate ---- */
    let frameId;
    const clock = new THREE.Clock();

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      meshes.forEach((m) => {
        m.rotation.x += m.userData.rotX;
        m.rotation.y += m.userData.rotY;
        m.position.x += m.userData.speedX;
        m.position.y += m.userData.speedY;
        // gentle float
        m.position.y += Math.sin(t + m.position.x) * 0.0008;

        // wrap around
        if (m.position.x > 16) m.position.x = -16;
        if (m.position.x < -16) m.position.x = 16;
        if (m.position.y > 10) m.position.y = -10;
        if (m.position.y < -10) m.position.y = 10;
      });

      // camera follows mouse gently
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 1.0 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // subtle point-light movement
      pointLight.position.x = 5 + Math.sin(t * 0.5) * 3;
      pointLight.position.y = 8 + Math.cos(t * 0.3) * 2;
      pointLight2.position.x = -6 + Math.cos(t * 0.4) * 3;

      renderer.render(scene, camera);
    };
    tick();

    /* ---- Cleanup ---- */
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeHero;
