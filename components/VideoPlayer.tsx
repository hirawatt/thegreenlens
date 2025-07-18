import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Scene } from '../types';
import { Icon } from './icons';
import Spinner from './Spinner';

interface VideoPlayerProps {
  title: string | null;
  scenes: Scene[];
  frameUrls: string[];
  selectedVoiceName: string;
}

const animationClasses = ['ken-burns-1', 'ken-burns-2', 'ken-burns-3', 'ken-burns-4'];
const getRandomAnimation = () => animationClasses[Math.floor(Math.random() * animationClasses.length)];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, scenes, frameUrls, selectedVoiceName }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // State for two image slots to enable cross-fading and animation
  const [imageSlot, setImageSlot] = useState<'A' | 'B'>('A');
  const [imageA, setImageA] = useState({ src: '', key: 0, animClass: '' });
  const [imageB, setImageB] = useState({ src: '', key: 0, animClass: '' });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopPlayback = useCallback(() => {
    if(window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playScene = useCallback((index: number) => {
    if (index >= scenes.length) {
      setIsPlaying(false);
      setIsFinished(true);
      return;
    }
    
    setCurrentSceneIndex(index);
    const frameUrl = frameUrls[index];
    const animClass = getRandomAnimation();

    // Load the next image into the inactive slot and switch slots to trigger the fade animation
    if (imageSlot === 'A') {
      setImageB({ src: frameUrl, key: imageB.key + 1, animClass });
      setImageSlot('B');
    } else {
      setImageA({ src: frameUrl, key: imageA.key + 1, animClass });
      setImageSlot('A');
    }

    const allVoices = window.speechSynthesis.getVoices();
    const selectedVoice = allVoices.find(v => v.name === selectedVoiceName);
    
    const utterance = new SpeechSynthesisUtterance(scenes[index].dialogue);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onend = () => {
      // A small delay for a smoother transition between scenes
      setTimeout(() => playScene(index + 1), 300);
    };
    utterance.onerror = (event) => {
        console.error('SpeechSynthesis Error', event);
        stopPlayback();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [scenes, frameUrls, stopPlayback, selectedVoiceName, imageSlot, imageA.key, imageB.key]);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      if (isFinished) {
        setIsFinished(false);
        // Restart from beginning, re-initializing the first frame
         if (frameUrls.length > 0) {
            const animClass = getRandomAnimation();
            setImageA({ src: frameUrls[0], key: imageA.key + 1, animClass });
            setImageB({ src: '', key: imageB.key + 1, animClass: '' });
            setImageSlot('A');
            playScene(0);
        }
      } else {
        // Resume playback (restarts current scene's speech and animation)
        playScene(currentSceneIndex);
      }
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);
  
  // Reset when content changes, setting up the initial frame
  useEffect(() => {
    stopPlayback();
    setCurrentSceneIndex(0);
    setIsFinished(false);
    if (frameUrls.length > 0) {
      const animClass = getRandomAnimation();
      setImageA({ src: frameUrls[0], key: 1, animClass });
      setImageB({ src: '', key: 0, animClass: '' });
      setImageSlot('A');
    } else {
      // Clear images if there are no frames
      setImageA({ src: '', key: 0, animClass: '' });
      setImageB({ src: '', key: 0, animClass: '' });
    }
  }, [scenes, frameUrls, stopPlayback]);

  if (!scenes.length || !frameUrls.length) {
    return (
      <div className="aspect-[9/16] w-full max-w-xs mx-auto bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-400 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto mb-4 text-slate-600"><path d="M12 3.1c.91 0 1.76.22 2.53.6L12 7.18 9.47 3.7c.77-.38 1.62-.6 2.53-.6ZM9.95 2.45a12.03 12.03 0 0 0-3.8 2.33l1.83 3.05A10.038 10.038 0 0 1 9.95 2.45Zm4.1 0c1.03.62 1.94 1.43 2.69 2.38l-1.87 3.03c-.53-.68-1.15-1.27-1.82-1.78ZM4.13 6.18a12.035 12.035 0 0 0-1.8 3.55h4.12c-.1-.53-.15-1.09-.15-1.66 0-.6.06-1.19.17-1.76L4.13 6.18Zm15.74 0-2.34 3.77c.11.57.17 1.16.17 1.76 0 .57-.05 1.13-.15 1.66h4.12c-.4-1.48-1.12-2.83-2.14-3.95l.17-.2Z" /><path fillRule="evenodd" d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21ZM3.18 12a8.96 8.96 0 0 1 .4-2.45h3.04c-.1.8-.12 1.63-.12 2.45 0 .82.02 1.65.12 2.45H3.58a8.96 8.96 0 0 1-.4-2.45Zm4.14 3.55h4.28V20.1a8.967 8.967 0 0 1-4.28-4.55Zm4.4-4.55V3.9a8.967 8.967 0 0 1 4.28 4.55h-4.28Zm5.88 0h3.04a8.96 8.96 0 0 1-.4 2.45c.08.8.12 1.63.12 2.45s-.04 1.65-.12 2.45h-3.04c.1-.8.12-1.63.12-2.45s-.04-1.65-.12-2.45Z" clipRule="evenodd" /></svg>
          <h3 className="text-xl font-semibold">Video Output</h3>
          <p>Your generated climate video will appear here.</p>
        </div>
      </div>
    );
  }

  const currentDialogue = scenes[currentSceneIndex]?.dialogue || '';

  return (
    <div className="w-full flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-4 truncate text-slate-100 self-start">{title || 'Untitled Video'}</h3>
        <div className="aspect-[9/16] w-full max-w-xs bg-black rounded-lg overflow-hidden relative group">
          {/* Two image slots for cross-fading */}
          <img 
            key={imageA.key}
            src={imageA.src}
            alt="Scene A"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imageSlot === 'A' ? 'opacity-100' : 'opacity-0'} ${imageA.animClass}`}
          />
          <img 
            key={imageB.key}
            src={imageB.src}
            alt="Scene B"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imageSlot === 'B' ? 'opacity-100' : 'opacity-0'} ${imageB.animClass}`}
          />
          
          {(imageA.src || imageB.src) ? null : (
             <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Spinner label={`Loading frame...`} />
             </div>
          )}

          {/* Overlay & Caption */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
            <p className="text-white text-lg lg:text-xl font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {currentDialogue}
            </p>
          </div>
          
          {/* Play/Pause Button */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all transform active:scale-90"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              >
              <Icon type={isPlaying ? 'pause' : 'play'} className="w-8 h-8" style={{ marginLeft: isPlaying ? 0 : '4px' }}/>
              </button>
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;