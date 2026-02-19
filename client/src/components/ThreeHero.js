import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * ThreeHero – Vehicle-rental themed 3D animated background.
 * Floating cars, scooters, wheels, location pins, bicycles and keys
 * drift gently with mouse-reactive parallax.
 */
const ThreeHero = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let frameId;
    let renderer;
    const cleanupFns = [];

    try {

    /* ---- Renderer ---- */
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    /* ---- Scene & Camera ---- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 22);

    /* ---- Lights ---- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0x667eea, 0.5);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const warmLight = new THREE.PointLight(0xff9800, 0.4, 50);
    warmLight.position.set(-6, 5, 10);
    scene.add(warmLight);
    const accentLight = new THREE.PointLight(0x48bb78, 0.3, 40);
    accentLight.position.set(8, -3, 8);
    scene.add(accentLight);

    /* ---- Material factory ---- */
    const makeMat = (color, opacity) =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.25,
        roughness: 0.45,
        transparent: true,
        opacity,
      });

    const paletteColors = [0x667eea, 0xff9800, 0x48bb78, 0x764ba2, 0xf56565];

    /* ============ Shape Builders ============ */

    function buildCar(mat) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.65), mat));
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.32, 0.6), mat);
      cabin.position.set(-0.05, 0.36, 0);
      g.add(cabin);
      const wGeo = new THREE.TorusGeometry(0.13, 0.045, 8, 20);
      const wMat = mat.clone();
      wMat.opacity = Math.min(mat.opacity + 0.12, 0.55);
      for (const x of [-0.4, 0.4]) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(x, -0.22, 0.36);
        w.rotation.y = Math.PI / 2;
        g.add(w);
      }
      return g;
    }

    function buildScooter(mat) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.28), mat));
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), mat);
      stem.position.set(0.38, 0.35, 0);
      g.add(stem);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), mat);
      bar.position.set(0.38, 0.62, 0);
      bar.rotation.x = Math.PI / 2;
      g.add(bar);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.24), mat);
      seat.position.set(-0.1, 0.14, 0);
      g.add(seat);
      const wGeo = new THREE.TorusGeometry(0.1, 0.035, 8, 18);
      const wMat = mat.clone();
      wMat.opacity = Math.min(mat.opacity + 0.1, 0.5);
      for (const x of [-0.35, 0.35]) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(x, -0.12, 0);
        g.add(w);
      }
      return g;
    }

    function buildWheel(mat) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 14, 36), mat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), mat));
      const sMat = mat.clone();
      sMat.opacity = Math.min(mat.opacity + 0.08, 0.45);
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.52, 6), sMat);
        spoke.rotation.z = (Math.PI / 5) * i;
        g.add(spoke);
      }
      return g;
    }

    function buildPin(mat) {
      const g = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), mat);
      head.position.y = 0.38;
      g.add(head);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 14), mat);
      cone.rotation.x = Math.PI;
      g.add(cone);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.3, 28),
        new THREE.MeshBasicMaterial({ color: mat.color, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      );
      ring.position.y = -0.2;
      ring.rotation.x = -Math.PI / 2;
      g.add(ring);
      g.userData._ring = ring;
      return g;
    }

    function buildKey(mat) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 18), mat));
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.45, 0.025), mat);
      shaft.position.y = -0.38;
      g.add(shaft);
      for (const [dy, w] of [[-0.48, 0.1], [-0.55, 0.075]]) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, 0.025), mat);
        tooth.position.set(w / 2, dy, 0);
        g.add(tooth);
      }
      return g;
    }

    function buildBicycle(mat) {
      const g = new THREE.Group();
      const fMat = mat.clone();
      fMat.opacity = Math.min(mat.opacity + 0.05, 0.45);
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 6), fMat);
      b1.rotation.z = Math.PI / 6;
      b1.position.set(0, 0.1, 0);
      g.add(b1);
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 6), fMat);
      b2.rotation.z = -Math.PI / 4;
      b2.position.set(-0.1, 0.1, 0);
      g.add(b2);
      const wGeo = new THREE.TorusGeometry(0.16, 0.025, 8, 22);
      for (const x of [-0.3, 0.3]) {
        const w = new THREE.Mesh(wGeo, mat);
        w.position.set(x, -0.15, 0);
        g.add(w);
      }
      const hbar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), mat);
      hbar.position.set(0.3, 0.25, 0);
      hbar.rotation.x = Math.PI / 2;
      g.add(hbar);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), mat);
      seat.position.set(-0.15, 0.28, 0);
      g.add(seat);
      return g;
    }

    /* ---- Spawn objects (weighted) ---- */
    const builders = [
      { fn: buildCar, weight: 4 },
      { fn: buildScooter, weight: 4 },
      { fn: buildWheel, weight: 2 },
      { fn: buildPin, weight: 3 },
      { fn: buildKey, weight: 1 },
      { fn: buildBicycle, weight: 2 },
    ];
    const totalWeight = builders.reduce((s, b) => s + b.weight, 0);
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 22 : 45;
    const allObjects = [];

    for (let i = 0; i < count; i++) {
      let r = Math.random() * totalWeight;
      let bi = 0;
      for (let j = 0; j < builders.length; j++) {
        r -= builders[j].weight;
        if (r <= 0) { bi = j; break; }
      }

      const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      const opacity = 0.08 + Math.random() * 0.22;
      const mat = makeMat(color, opacity);

      const obj = builders[bi].fn(mat);
      const s = 0.35 + Math.random() * 0.75;
      obj.scale.set(s, s, s);
      obj.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10 - 5
      );
      obj.rotation.set(
        (Math.random() - 0.5) * 0.4,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3
      );
      obj.userData.driftX = (Math.random() - 0.5) * 0.003;
      obj.userData.driftY = (Math.random() - 0.5) * 0.002;
      obj.userData.rotSpeedX = (Math.random() - 0.5) * 0.003;
      obj.userData.rotSpeedY = (Math.random() - 0.5) * 0.005;
      obj.userData.floatOffset = Math.random() * Math.PI * 2;

      scene.add(obj);
      allObjects.push(obj);
    }

    /* ---- Subtle route connection lines ---- */
    const lineMat = new THREE.LineBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.04 });
    const routeLineMat = new THREE.LineDashedMaterial({
      color: 0x48bb78, transparent: true, opacity: 0.06, dashSize: 0.4, gapSize: 0.2,
    });
    for (let i = 0; i < Math.min(count, 18); i++) {
      const a = allObjects[i];
      const b = allObjects[(i + 7) % count];
      const geo = new THREE.BufferGeometry().setFromPoints([a.position.clone(), b.position.clone()]);
      const mat = i % 4 === 0 ? routeLineMat : lineMat;
      const line = new THREE.Line(geo, mat);
      if (mat === routeLineMat && line.computeLineDistances) line.computeLineDistances();
      scene.add(line);
    }

    /* ---- Mouse tracking ---- */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    cleanupFns.push(() => window.removeEventListener('mousemove', onMouse));

    /* ---- Resize ---- */
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);
    cleanupFns.push(() => window.removeEventListener('resize', onResize));

    /* ---- Animation loop ---- */
    const clock = new THREE.Clock();

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      allObjects.forEach((obj) => {
        obj.rotation.x += obj.userData.rotSpeedX;
        obj.rotation.y += obj.userData.rotSpeedY;
        obj.position.x += obj.userData.driftX;
        obj.position.y += obj.userData.driftY;
        obj.position.y += Math.sin(t * 0.4 + obj.userData.floatOffset) * 0.0008;

        if (obj.position.x > 18) obj.position.x = -18;
        if (obj.position.x < -18) obj.position.x = 18;
        if (obj.position.y > 10) obj.position.y = -10;
        if (obj.position.y < -10) obj.position.y = 10;

        if (obj.userData._ring) {
          const sc = 1 + Math.sin(t * 2.5 + obj.userData.floatOffset) * 0.35;
          obj.userData._ring.scale.set(sc, sc, 1);
          obj.userData._ring.material.opacity = 0.1 + Math.sin(t * 2.5 + obj.userData.floatOffset) * 0.06;
        }
      });

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.015;
      camera.position.y += (mouse.y * 0.8 + 1 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);

      dirLight.position.x = 5 + Math.sin(t * 0.3) * 2;
      warmLight.position.x = -6 + Math.cos(t * 0.35) * 3;
      accentLight.position.y = -3 + Math.sin(t * 0.25) * 2;

      renderer.render(scene, camera);
    };
    tick();

    } catch (err) {
      console.warn('ThreeHero init error:', err);
    }

    /* ---- Cleanup ---- */
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      cleanupFns.forEach((fn) => fn());
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
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
