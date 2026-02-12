import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        // Create animated gradient mesh
        const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x4f46e5) }, // Indigo
                color2: { value: new THREE.Color(0x06b6d4) }, // Cyan
                color3: { value: new THREE.Color(0x8b5cf6) }, // Purple
            },
            vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Wave animation
          float elevation = sin(pos.x * 0.5 + time * 0.5) * 0.3;
          elevation += sin(pos.y * 0.3 + time * 0.3) * 0.3;
          pos.z = elevation;
          
          vElevation = elevation;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Create dynamic gradient
          float mixValue = vUv.y + sin(vUv.x * 3.0 + time * 0.2) * 0.2;
          vec3 color = mix(color1, color2, mixValue);
          color = mix(color, color3, vUv.x * 0.5 + vElevation * 0.5);
          
          // Add some variation
          color += vec3(sin(vUv.x * 10.0 + time) * 0.02);
          
          gl_FragColor = vec4(color, 0.08); // Very subtle opacity
        }
      `,
            transparent: true,
            side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Particle system for extra depth
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 100;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x4f46e5,
            size: 0.05,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Update time uniform
            material.uniforms.time.value += 0.01;

            // Rotate mesh slightly
            mesh.rotation.x = Math.sin(material.uniforms.time.value * 0.1) * 0.1;
            mesh.rotation.y = Math.cos(material.uniforms.time.value * 0.1) * 0.1;

            // Animate particles
            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            geometry.dispose();
            material.dispose();
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.4,
            }}
        />
    );
};

export default ThreeBackground;
