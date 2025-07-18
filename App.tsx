import React, { useState, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { generateCreativePackage, generateImage } from './services/geminiService';
import type { GeneratedContent, PipelineStage } from './types';

const App: React.FC = () => {
  const [stage, setStage] = useState<PipelineStage>('input');
  const [persona, setPersona] = useState<string>('');
  const [storyboard, setStoryboard] = useState<string>('');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  
  // Brand Promotion State
  const [isPromotingBrand, setIsPromotingBrand] = useState<boolean>(false);
  const [brandInfo, setBrandInfo] = useState<string>('');
  const [brandImage, setBrandImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    creativePackage: null,
    thumbnailUrl: null,
    videoFrameUrls: [],
  });
  
  const handleResetAll = useCallback(() => {
    setStage('input');
    setError(null);
    setGeneratedContent({ creativePackage: null, thumbnailUrl: null, videoFrameUrls: [] });
    setPersona('');
    setStoryboard('');
    
    // Reset brand promotion fields
    setIsPromotingBrand(false);
    setBrandInfo('');
    setBrandImage(null);

    // Find a default voice again on reset, or clear it
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.lang.includes('en') && v.name.includes('Google')) || availableVoices[0];
        setSelectedVoiceName(defaultVoice ? defaultVoice.name : '');
    } else {
        setSelectedVoiceName('');
    }
    window.speechSynthesis.cancel();
  }, []);

  const handleGenerateScript = useCallback(async () => {
    if (!persona || !storyboard) return;
    if (isPromotingBrand && !brandInfo) {
      setError("Please provide brand information to generate a promotional script.");
      setStage('error');
      return;
    }

    setStage('script_generating');
    setError(null);
    setGeneratedContent({ creativePackage: null, thumbnailUrl: null, videoFrameUrls: [] });

    try {
      const creativePkg = await generateCreativePackage(persona, storyboard, isPromotingBrand, brandInfo, brandImage);
      setGeneratedContent(prev => ({ ...prev, creativePackage: creativePkg }));
      setStage('script_approval');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(errorMessage);
      setStage('error');
    }
  }, [persona, storyboard, isPromotingBrand, brandInfo, brandImage]);

  const handleGenerateThumbnail = useCallback(async () => {
    if (!generatedContent.creativePackage) return;
    setStage('thumbnail_generating');
    setError(null);

    const prompt = generatedContent.creativePackage.thumbnail_prompt;
    const newThumbnailUrl = await generateImage(prompt);
    setGeneratedContent(prev => ({ ...prev, thumbnailUrl: newThumbnailUrl }));
    setStage('thumbnail_approval');

  }, [generatedContent.creativePackage]);

  const handleGenerateVideo = useCallback(async () => {
    if (!generatedContent.creativePackage) return;
    setStage('video_generating');
    setError(null);
    
    const imagePrompts = generatedContent.creativePackage.scenes.map(s => s.visual);
    const newVideoFrameUrls = await Promise.all(
        imagePrompts.map(prompt => generateImage(prompt))
    );
    
    if (newVideoFrameUrls.some(url => !url)) {
        const errorMessage = "A fallback image failed to load. Please check your connection and try again.";
        console.error(errorMessage);
        setError(errorMessage);
        setStage('error');
        return;
    }

    setGeneratedContent(prev => ({
        ...prev,
        videoFrameUrls: newVideoFrameUrls,
    }));
    setStage('complete');
  }, [generatedContent.creativePackage]);
  
  const handleRetry = () => {
    setError(null);
    if (stage === 'error') {
      if (generatedContent.thumbnailUrl) {
        setStage('thumbnail_approval');
      } else if (generatedContent.creativePackage) {
        setStage('script_approval');
      } else {
        setStage('input');
      }
    }
  };


  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-900 overflow-hidden">
      <InputPanel
        stage={stage}
        persona={persona}
        setPersona={setPersona}
        storyboard={storyboard}
        setStoryboard={setStoryboard}
        selectedVoiceName={selectedVoiceName}
        setSelectedVoiceName={setSelectedVoiceName}
        onGenerateScript={handleGenerateScript}
        onReset={handleResetAll}
        isPromotingBrand={isPromotingBrand}
        setIsPromotingBrand={setIsPromotingBrand}
        brandInfo={brandInfo}
        setBrandInfo={setBrandInfo}
        brandImage={brandImage}
        setBrandImage={setBrandImage}
      />
      <OutputPanel
        stage={stage}
        content={generatedContent}
        error={error}
        selectedVoiceName={selectedVoiceName}
        onRegenerateScript={handleGenerateScript}
        onApproveScript={handleGenerateThumbnail}
        onRegenerateThumbnail={handleGenerateThumbnail}
        onApproveThumbnail={handleGenerateVideo}
        onRetry={handleRetry}
        onReset={handleResetAll}
      />
    </div>
  );
};

export default App;