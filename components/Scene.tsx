
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GestureType } from '../types';
import { ShapeGenerator } from '../services/ShapeGenerator';

interface SceneProps {
  gesture: GestureType;
}

const PARTICLE_COUNT = 16000;
const RIBBON_COUNT = 400; // Even fewer for a cleaner look
const LIGHT_COUNT = 250;
const SNOW_COUNT = 800;

const Scene: React.FC<SceneProps> = ({ gesture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  
  const shapes = useRef<{ [key in GestureType]: THREE.Vector3[] }>({
    [GestureType.NONE]: ShapeGenerator.getTreePoints(PARTICLE_COUNT),
    [GestureType.TREE]: ShapeGenerator.getTreePoints(PARTICLE_COUNT),
    [GestureType.TEXT]: ShapeGenerator.getTextPoints("Merry Christmas Mr. Wei", PARTICLE_COUNT),
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 10;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    
    const initialTree = shapes.current[GestureType.TREE];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = initialTree[i];
        positions[i*3] = p.x;
        positions[i*3+1] = p.y;
        positions[i*3+2] = p.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    }));
    scene.add(points);

    const lightGeo = new THREE.BufferGeometry();
    const lightPos = new Float32Array(LIGHT_COUNT * 3);
    const lightCol = new Float32Array(LIGHT_COUNT * 3);
    const lightPalette = [0xff1111, 0xffff44, 0x11ffff, 0xff44ff, 0xffffff].map(c => new THREE.Color(c));
    for (let i = 0; i < LIGHT_COUNT; i++) {
        const c = lightPalette[Math.floor(Math.random() * lightPalette.length)];
        lightCol[i*3] = c.r;
        lightCol[i*3+1] = c.g;
        lightCol[i*3+2] = c.b;
    }
    lightGeo.setAttribute('position', new THREE.BufferAttribute(lightPos, 3));
    lightGeo.setAttribute('color', new THREE.BufferAttribute(lightCol, 3));
    const lightsMesh = new THREE.Points(lightGeo, new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
    scene.add(lightsMesh);

    const ribbonGeo = new THREE.BufferGeometry();
    const ribbonPos = new Float32Array(RIBBON_COUNT * 3);
    const ribbonCol = new Float32Array(RIBBON_COUNT * 3);
    for (let i = 0; i < RIBBON_COUNT; i++) {
        ribbonCol[i*3] = 1.0;
        ribbonCol[i*3+1] = 0.9;
        ribbonCol[i*3+2] = 0.3;
    }
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPos, 3));
    ribbonGeo.setAttribute('color', new THREE.BufferAttribute(ribbonCol, 3));
    const ribbonMesh = new THREE.Points(ribbonGeo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
    scene.add(ribbonMesh);

    const snowGeo = new THREE.BufferGeometry();
    const snowPos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
        snowPos[i*3] = (Math.random() - 0.5) * 120;
        snowPos[i*3+1] = Math.random() * 120 - 60;
        snowPos[i*3+2] = (Math.random() - 0.5) * 120;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    scene.add(new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.25 })));

    let time = 0;
    const animate = () => {
      time += 0.015;
      
      const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = points.geometry.attributes.color as THREE.BufferAttribute;
      const targetShape = shapes.current[gesture] || shapes.current[GestureType.TREE];
      const isTree = (gesture === GestureType.TREE || gesture === GestureType.NONE);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const target = targetShape[i] || new THREE.Vector3(0, 0, 0);
        
        const dx = target.x - posAttr.array[i*3];
        const dy = target.y - posAttr.array[i*3+1];
        const dz = target.z - posAttr.array[i*3+2];
        const distSq = dx*dx + dy*dy + dz*dz;
        
        const morphBase = distSq > 4 ? 0.12 : 0.06;
        const drift = distSq > 0.5 ? (Math.random() - 0.5) * 0.15 : 0;

        let swayX = 0;
        let swayZ = 0;
        if (isTree && i < PARTICLE_COUNT * 0.85) { 
            const h = (target.y + 5) / 11;
            swayX = Math.sin(time + target.y * 0.5) * 0.2 * h;
            swayZ = Math.cos(time * 0.7 + target.y * 0.5) * 0.15 * h;
        }

        posAttr.array[i * 3] += (target.x + swayX + drift - posAttr.array[i * 3]) * morphBase;
        posAttr.array[i * 3 + 1] += (target.y + drift - posAttr.array[i * 3 + 1]) * morphBase;
        posAttr.array[i * 3 + 2] += (target.z + swayZ + drift - posAttr.array[i * 3 + 2]) * morphBase;

        if (gesture === GestureType.TEXT) {
            colAttr.array[i * 3] += (1.0 - colAttr.array[i * 3]) * 0.08;
            colAttr.array[i * 3 + 1] += (0.85 - colAttr.array[i * 3 + 1]) * 0.08;
            colAttr.array[i * 3 + 2] += (0.4 - colAttr.array[i * 3 + 2]) * 0.08;
        } else {
            if (i >= PARTICLE_COUNT * 0.97) { // Star
                colAttr.array[i * 3] += (1.0 - colAttr.array[i * 3]) * 0.08;
                colAttr.array[i * 3 + 1] += (0.9 - colAttr.array[i * 3 + 1]) * 0.08;
                colAttr.array[i * 3 + 2] += (0.2 - colAttr.array[i * 3 + 2]) * 0.08;
            } else if (i >= PARTICLE_COUNT * 0.85) { // Trunk
                colAttr.array[i * 3] += (0.35 - colAttr.array[i * 3]) * 0.08;
                colAttr.array[i * 3 + 1] += (0.15 - colAttr.array[i * 3 + 1]) * 0.08;
                colAttr.array[i * 3 + 2] += (0.05 - colAttr.array[i * 3 + 2]) * 0.08;
            } else { // Body Blue-Green
                colAttr.array[i * 3] += (0.0 - colAttr.array[i * 3]) * 0.08;
                colAttr.array[i * 3 + 1] += (0.75 - colAttr.array[i * 3 + 1]) * 0.08;
                colAttr.array[i * 3 + 2] += (0.65 - colAttr.array[i * 3 + 2]) * 0.08;
            }
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      const rPosAttr = ribbonMesh.geometry.attributes.position as THREE.BufferAttribute;
      if (isTree) {
          ribbonMesh.material.opacity += (0.8 - ribbonMesh.material.opacity) * 0.04;
          for (let i = 0; i < RIBBON_COUNT; i++) {
            const ratio = i / RIBBON_COUNT;
            const h = ratio * 16 - 8;
            const r = (1.0 - ratio) * 7.5 + Math.sin(time + i * 0.05) * 0.4;
            const angle = time * 2.5 + ratio * Math.PI * 10;
            rPosAttr.array[i * 3] = Math.cos(angle) * r;
            rPosAttr.array[i * 3 + 1] = h;
            rPosAttr.array[i * 3 + 2] = Math.sin(angle) * r;
          }
      } else {
          ribbonMesh.material.opacity *= 0.92; 
          for (let i = 0; i < RIBBON_COUNT; i++) {
              rPosAttr.array[i*3] *= 1.05;
              rPosAttr.array[i*3+1] += 0.12;
              rPosAttr.array[i*3+2] *= 1.05;
          }
      }
      rPosAttr.needsUpdate = true;

      const lPosAttr = lightsMesh.geometry.attributes.position as THREE.BufferAttribute;
      if (isTree) {
          lightsMesh.visible = true;
          lightsMesh.material.opacity = 0.4 + Math.abs(Math.sin(time * 1.5)) * 0.6;
          for (let i = 0; i < LIGHT_COUNT; i++) {
              const baseIdx = Math.floor((i / LIGHT_COUNT) * PARTICLE_COUNT * 0.85);
              lPosAttr.array[i*3] = posAttr.array[baseIdx * 3];
              lPosAttr.array[i*3+1] = posAttr.array[baseIdx * 3 + 1];
              lPosAttr.array[i*3+2] = posAttr.array[baseIdx * 3 + 2];
          }
      } else {
          lightsMesh.visible = false;
      }
      lPosAttr.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        containerRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [gesture]);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black cursor-grab active:cursor-grabbing" />;
};

export default Scene;
