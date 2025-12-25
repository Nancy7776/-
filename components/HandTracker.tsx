
import React, { useEffect, useRef } from 'react';
import { GestureType } from '../types';

interface HandTrackerProps {
  onGesture: (gesture: GestureType) => void;
  isActive: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGesture, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastGesture = useRef<GestureType>(GestureType.NONE);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  // Use a smaller buffer for faster response
  const gestureHistory = useRef<GestureType[]>([]);
  const HISTORY_SIZE = 3; 

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
      return;
    }

    const initHands = async () => {
        if (!(window as any).Hands) return;

        const hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1, 
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: any) => {
          let detectedGesture = GestureType.TREE;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Stable detection: Count extended fingers
            // 8: Index Tip, 6: Index PIP
            // 12: Middle Tip, 10: Middle PIP
            // 16: Ring Tip, 14: Ring PIP
            // 20: Pinky Tip, 18: Pinky PIP
            // If Tip is above PIP (smaller Y in screen coords), finger is extended
            
            let extendedFingers = 0;
            const fingerIndices = [8, 12, 16, 20];
            const pipIndices = [6, 10, 14, 18];
            
            for (let i = 0; i < fingerIndices.length; i++) {
              if (landmarks[fingerIndices[i]].y < landmarks[pipIndices[i]].y) {
                extendedFingers++;
              }
            }

            // Also check thumb (4: Tip, 2: CMC/MCP area) - simple horizontal check for extension
            // For right hand (flipped), thumb tip x < thumb base x means extended
            const thumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.05;
            if (thumbExtended) extendedFingers++;

            // If 3 or more fingers are out, consider it a PALM (TEXT)
            // Otherwise, it's a FIST (TREE)
            detectedGesture = extendedFingers >= 3 ? GestureType.TEXT : GestureType.TREE;
          } else {
            // Default to Tree when no hand is visible to keep the scene active
            detectedGesture = GestureType.TREE;
          }

          // Smooth with simple majority in a very small window
          gestureHistory.current.push(detectedGesture);
          if (gestureHistory.current.length > HISTORY_SIZE) {
            gestureHistory.current.shift();
          }

          const counts = gestureHistory.current.reduce((acc, g) => {
            acc[g] = (acc[g] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          let stabilized = lastGesture.current;
          if (counts[GestureType.TREE] > HISTORY_SIZE / 2) stabilized = GestureType.TREE;
          if (counts[GestureType.TEXT] > HISTORY_SIZE / 2) stabilized = GestureType.TEXT;

          if (stabilized !== lastGesture.current) {
            onGesture(stabilized);
            lastGesture.current = stabilized;
          }
        });

        handsRef.current = hands;

        if (videoRef.current) {
          const camera = new (window as any).Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && handsRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });
          cameraRef.current = camera;
          camera.start();
        }
    };

    initHands();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
    };
  }, [isActive, onGesture]);

  return (
    <div className={`fixed bottom-6 right-6 w-48 h-36 border-2 border-teal-500/30 rounded-2xl overflow-hidden transition-all duration-700 bg-black/90 backdrop-blur-xl shadow-2xl ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline />
      <div className="absolute top-2 left-3 flex items-center space-x-2">
         <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
         <span className="text-[9px] text-teal-400 font-bold uppercase tracking-[0.2em]">Live Lens</span>
      </div>
    </div>
  );
};

export default HandTracker;
