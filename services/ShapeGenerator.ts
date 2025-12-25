
import * as THREE from 'three';

export class ShapeGenerator {
  static getTreePoints(count: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const treeCount = Math.floor(count * 0.85);
    const trunkCount = Math.floor(count * 0.12);
    const starCount = count - treeCount - trunkCount;

    // 1. Tree Body: Three distinct frustum tiers
    for (let i = 0; i < treeCount; i++) {
      const randH = Math.random(); 
      let x, y, z;
      let radius;

      if (randH < 0.4) {
        const t = randH / 0.4;
        y = t * 3.5 - 5;
        radius = 5.0 - t * 1.5;
      } else if (randH < 0.75) {
        const t = (randH - 0.4) / 0.35;
        y = t * 3.5 - 1.5;
        radius = 3.5 - t * 1.5;
      } else {
        const t = (randH - 0.75) / 0.25;
        y = t * 3.5 + 2.0;
        radius = 2.0 - t * 2.0;
      }
      
      const angle = Math.random() * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.5;
      const r = Math.random() * radius + jitter;
      
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      
      points.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < trunkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.9;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = -5 - Math.random() * 2.5;
      points.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < starCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = Math.random() * 0.8;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = 6.0 + r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  static getTextPoints(text: string, count: number): THREE.Vector3[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    
    // Split text into three lines
    const lines = ["Merry", "Christmas", "Mr. Wei"];
    canvas.width = 1000;
    canvas.height = 1000;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw each line
    lines.forEach((line, index) => {
      ctx.fillText(line, 500, 350 + index * 160);
    });
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixelPoints: THREE.Vector3[] = [];
    
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4;
        if (imgData[index] > 128) {
          const px = (x - 500) * 0.025;
          const py = (500 - y) * 0.025;
          pixelPoints.push(new THREE.Vector3(px, py, (Math.random() - 0.5) * 0.4));
        }
      }
    }

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const p = pixelPoints[Math.floor(Math.random() * pixelPoints.length)] || new THREE.Vector3(0,0,0);
      points.push(p.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.1
      )));
    }
    return points;
  }
}
