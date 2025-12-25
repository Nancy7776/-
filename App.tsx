
import React, { useState, useCallback, useEffect } from 'react';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import { GestureType } from './types';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureType>(GestureType.NONE);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleGesture = useCallback((newGesture: GestureType) => {
    setGesture(newGesture);
  }, []);

  const toggleCamera = () => setIsCameraOn(prev => !prev);
  const toggleMute = () => setIsMuted(prev => !prev);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2021/11/24/audio_3324e94119.mp3?filename=jingle-bells-15964.mp3'); 
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
    }
    
    const playAudio = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
        });
      }
    };

    if (!isMuted) {
      playAudio();
    } else {
      audioRef.current.pause();
    }

    // Add listeners to document to unlock audio on first interaction
    const unlockAudio = () => {
      if (audioRef.current && !isMuted && audioRef.current.paused) {
        playAudio();
      }
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [isMuted]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D Particle Scene */}
      <Scene gesture={gesture} />

      {/* UI Overlay */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between pointer-events-none">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="pointer-events-auto">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text serif-artistic tracking-tight drop-shadow-2xl">
              Merry Christmas
            </h1>
            <p className="text-white/40 text-[9px] md:text-[11px] mt-2 font-mono tracking-[0.5em] uppercase">
              By James Lord Pierpont
            </p>
          </div>
          
          <div className="flex items-center space-x-4 pointer-events-auto bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-full border border-white/5 shadow-2xl">
            <button 
              onClick={toggleCamera} 
              className={`flex items-center space-x-2 transition-all ${isCameraOn ? 'text-teal-400' : 'text-gray-500 hover:text-white'}`}
            >
              <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">{isCameraOn ? 'ACTIVE' : 'CAMERA'}</span>
              <div className={`w-3 h-3 rounded-full ${isCameraOn ? 'bg-teal-400 animate-pulse' : 'bg-gray-700'}`}></div>
            </button>
            
            <div className="w-[1px] h-4 bg-white/10"></div>

            <button 
              onClick={toggleMute} 
              className={`p-1 transition-all ${!isMuted ? 'text-yellow-400' : 'text-gray-600 hover:text-white'}`}
            >
              {!isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Footer: Lowered for mobile and using distinct hand/fist icons */}
        <footer className="flex flex-col items-center pb-8 md:pb-12">
          <div className="bg-black/70 backdrop-blur-3xl border border-white/10 p-2 rounded-full flex items-center space-x-2 pointer-events-auto shadow-2xl">
             {/* Open Hand -> Greeting Text */}
             <div className={`p-4 md:p-6 rounded-full transition-all flex items-center justify-center ${gesture === GestureType.TEXT ? 'bg-white/20 text-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] ring-1 ring-white/50' : 'text-white/30'}`}>
                {/* Palm SVG */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                  <path d="M14 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
             </div>

             {/* Closed Hand -> Christmas Tree */}
             <div className={`p-4 md:p-6 rounded-full transition-all flex items-center justify-center ${gesture === GestureType.TREE || gesture === GestureType.NONE ? 'bg-teal-500/30 text-teal-400 scale-110 shadow-[0_0_20px_rgba(45,212,191,0.3)] ring-1 ring-teal-500/50' : 'text-white/30'}`}>
                {/* Fist SVG */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
                  <path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
                  <path d="M10 10.5V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  <path d="M6 9h12v4H6z" fill="currentColor" fillOpacity="0.1" stroke="none" />
                </svg>
             </div>
          </div>
          
          <div className="flex flex-col items-center mt-8">
            <div className="text-white/20 text-[10px] md:text-[12px] tracking-[1em] uppercase font-light italic serif-artistic">
              Merry Christmas Mr. Wei
            </div>
            <div className="mt-3 text-[8px] text-white/5 tracking-[0.4em] uppercase">
               Ultra-Responsive Gesture Engine
            </div>
          </div>
        </footer>
      </div>

      {/* Hand Recognition */}
      <HandTracker onGesture={handleGesture} isActive={isCameraOn} />
    </div>
  );
};

export default App;
