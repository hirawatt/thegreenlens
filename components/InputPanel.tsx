import React, { useState, useEffect } from 'react';
import { Icon } from './icons';
import type { PersonaFormData, PipelineStage, StoryFormData } from '../types';
import { generatePersonaFromForm, generateRandomPersona, generateStoryFromForm, generateStoryFromLatestNews } from '../services/geminiService';
import { samples } from '../data/samples';

interface InputPanelProps {
  stage: PipelineStage;
  persona: string;
  setPersona: (value: string) => void;
  storyboard: string;
  setStoryboard: (value: string) => void;
  selectedVoiceName: string;
  setSelectedVoiceName: (value: string) => void;
  onGenerateScript: () => void;
  onReset: () => void;
  isPromotingBrand: boolean;
  setIsPromotingBrand: (value: boolean) => void;
  brandInfo: string;
  setBrandInfo: (value: string) => void;
  brandImage: string | null;
  setBrandImage: (value: string | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = (props) => {
  const { 
      stage, persona, setPersona, storyboard, setStoryboard, selectedVoiceName, setSelectedVoiceName, onGenerateScript, onReset,
      isPromotingBrand, setIsPromotingBrand, brandInfo, setBrandInfo, brandImage, setBrandImage 
  } = props;
  
  const [personaMode, setPersonaMode] = useState<'manual' | 'form' | 'random'>('manual');
  const [personaFormData, setPersonaFormData] = useState<PersonaFormData>({ age: '', gender: '', location: '', interests: '', profession: '' });
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [personaError, setPersonaError] = useState<string | null>(null);

  const [storyMode, setStoryMode] = useState<'manual' | 'form' | 'latest_news'>('manual');
  const [storyFormData, setStoryFormData] = useState<StoryFormData>({ topic: '', location: '', tone: '' });
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingLatestNews, setIsGeneratingLatestNews] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const isLocked = stage !== 'input';
  const isGenerating = isGeneratingPersona || isGeneratingStory || isGeneratingLatestNews;
  const formFieldStyles = "w-full p-2 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed";

  useEffect(() => {
    const loadVoices = () => {
        // Filter for Indian voices
        const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('-IN'));
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            // Check if the currently selected voice is still in the list
            const isSelectedVoiceAvailable = availableVoices.some(v => v.name === selectedVoiceName);
            if (!isSelectedVoiceAvailable || !selectedVoiceName) {
                // Set a default Indian voice if current selection is invalid or not set
                const defaultVoice = availableVoices.find(v => v.lang === 'en-IN') || availableVoices[0];
                if (defaultVoice) {
                    setSelectedVoiceName(defaultVoice.name);
                }
            }
        } else {
            // Handle case with no Indian voices
            setVoices([]);
            setSelectedVoiceName('');
        }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    };
  }, []); // Intentionally empty to run once on mount


  const handlePersonaFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonaFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    const sample = samples.find(s => s.title === selectedTitle);
    if (sample) {
      setPersona(sample.persona);
      setStoryboard(sample.storyboard);
    }
    e.target.value = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setBrandImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setBrandImage(null);
    }
  };

  const handleGeneratePersonaFromForm = async () => {
    setIsGeneratingPersona(true);
    setPersonaError(null);
    try {
      const generatedPersona = await generatePersonaFromForm(personaFormData);
      setPersona(generatedPersona);
      setPersonaMode('manual'); // Switch to manual to show the result
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleGenerateRandomPersona = async () => {
    setIsGeneratingPersona(true);
    setPersonaError(null);
    try {
      const generatedPersona = await generateRandomPersona();
      setPersona(generatedPersona);
      setPersonaMode('manual'); // Switch to manual to show the result
    } catch (err) {
      setPersonaError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleGenerateStoryFromForm = async () => {
    setIsGeneratingStory(true);
    setStoryError(null);
    try {
      const generatedStory = await generateStoryFromForm(storyFormData);
      setStoryboard(generatedStory);
      setStoryMode('manual'); // Switch to manual to show the result
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleGenerateLatestNews = async () => {
    setIsGeneratingLatestNews(true);
    setStoryError(null);
    try {
      const generatedStory = await generateStoryFromLatestNews();
      setStoryboard(generatedStory);
      setStoryMode('manual'); // Switch to manual to show the result
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingLatestNews(false);
    }
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; }> = ({ active, onClick, children, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {children}
    </button>
  );

  const ageRanges = ["", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  const genders = ["", "Any", "Female", "Male", "Non-binary"];
  const locations = ["", "Any", "Urban", "Suburban", "Rural"];
  const professions = ["", "Any", "Technology", "Healthcare", "Creative Arts", "Business/Finance", "Education", "Student", "Trades/Manual Labor"];
  const storyTopics = ["", "Renewable Energy", "Deforestation", "Climate Policy", "Plastic Pollution", "Fast Fashion", "Sustainable Agriculture", "Water Scarcity", "Biodiversity Loss"];
  const storyTones = ["", "Educational", "Inspirational", "Urgent", "Hopeful", "Action-Oriented", "Serious"];

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 p-6 bg-slate-800/50 border-r border-slate-700/50 flex flex-col gap-6">
      <div className="flex-grow flex flex-col gap-6 overflow-y-auto pr-2 -mr-2">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-emerald-400"><path d="M11.999 1.5c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10Zm3.51 6.23c.36.36.36.95 0 1.31l-6.23 6.23c-.36.36-.95.36-1.31 0l-2.73-2.73c-.36-.36-.36-.95 0-1.31s.95-.36 1.31 0l2.07 2.07 5.57-5.57c.36-.36.95-.36 1.3 0Z" clipRule="evenodd" /><path d="M16.22 17.29c.36.36.95.36 1.31 0l2.43-2.43c.36-.36.36-.95 0-1.31s-.95-.36-1.31 0l-1.77 1.77-1.1-1.1c-.36-.36-.95-.36-1.31 0s-.36.95 0 1.31l1.75 1.75Z" /></svg>
          Climate Content Creator
        </h2>

        <div>
           <label htmlFor="example-select" className="text-sm font-medium text-slate-300 mb-2 block">Quick Start</label>
            <select
                id="example-select"
                onChange={handleExampleSelect}
                disabled={isLocked || isGenerating}
                className={formFieldStyles}
                defaultValue=""
            >
                <option value="" disabled>Load a climate example...</option>
                {samples.map(sample => (
                    <option key={sample.title} value={sample.title}>
                        {sample.title}
                    </option>
                ))}
            </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="persona" className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Icon type="audience" className="w-5 h-5"/>
              Audience Persona
            </label>
            <div className="flex items-center gap-1">
                <TabButton onClick={() => setPersonaMode('manual')} active={personaMode === 'manual'} disabled={isLocked || isGenerating}>Manual</TabButton>
                <TabButton onClick={() => setPersonaMode('form')} active={personaMode === 'form'} disabled={isLocked || isGenerating}>Form</TabButton>
                <TabButton onClick={() => setPersonaMode('random')} active={personaMode === 'random'} disabled={isLocked || isGenerating}>Random</TabButton>
            </div>
          </div>
          
          {personaMode === 'manual' && (
            <textarea
              id="persona"
              rows={4}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className={`${formFieldStyles} min-h-[108px]`}
              placeholder="e.g., A suburban parent concerned about their children's future, who gets information from community groups and social media."
              disabled={isLocked || isGenerating}
            />
          )}

          {personaMode === 'form' && (
            <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-md flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-slate-400">Age Range</label>
                    <select name="age" value={personaFormData.age} onChange={handlePersonaFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                        {ageRanges.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Gender</label>
                    <select name="gender" value={personaFormData.gender} onChange={handlePersonaFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Location</label>
                    <select name="location" value={personaFormData.location} onChange={handlePersonaFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Profession</label>
                    <select name="profession" value={personaFormData.profession} onChange={handlePersonaFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                        {professions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Interests (comma-separated)</label>
                <input name="interests" value={personaFormData.interests} onChange={handlePersonaFormChange} className={formFieldStyles} placeholder="e.g., hiking, technology, parenting" disabled={isLocked || isGenerating}/>
              </div>
              {personaError && <p className="text-xs text-red-400 bg-red-900/50 p-2 rounded">{personaError}</p>}
              <button onClick={handleGeneratePersonaFromForm} disabled={isLocked || isGenerating} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-bold py-2 px-3 rounded-md text-sm">
                {isGeneratingPersona ? <Icon type="spinner" className="w-4 h-4"/> : <Icon type="generate" className="w-4 h-4"/>}
                Generate Persona
              </button>
            </div>
          )}

          {personaMode === 'random' && (
            <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-md flex flex-col gap-3 text-center">
              <p className="text-sm text-slate-300">Generate a completely random audience persona to spark new creative ideas.</p>
              {personaError && <p className="text-xs text-red-400 bg-red-900/50 p-2 rounded">{personaError}</p>}
              <button onClick={handleGenerateRandomPersona} disabled={isLocked || isGenerating} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-bold py-2 px-3 rounded-md text-sm">
                  {isGeneratingPersona ? <Icon type="spinner" className="w-4 h-4"/> : <Icon type="generate" className="w-4 h-4"/>}
                  Generate Random Persona
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="storyboard" className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Icon type="story" className="w-5 h-5"/>
              Climate Story / Message
            </label>
             <div className="flex items-center gap-1">
                <TabButton onClick={() => setStoryMode('manual')} active={storyMode === 'manual'} disabled={isLocked || isGenerating}>Manual</TabButton>
                <TabButton onClick={() => setStoryMode('form')} active={storyMode === 'form'} disabled={isLocked || isGenerating}>Form</TabButton>
                <TabButton onClick={() => setStoryMode('latest_news')} active={storyMode === 'latest_news'} disabled={isLocked || isGenerating}>Latest News</TabButton>
            </div>
          </div>
          {storyMode === 'manual' && (
            <textarea
                id="storyboard"
                rows={6}
                value={storyboard}
                onChange={(e) => setStoryboard(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-200"
                placeholder="e.g., A 60-second video on the benefits of renewable energy. Show a wind turbine, then a solar panel, and end with a happy family in a sustainably powered home."
                disabled={isLocked || isGenerating}
            />
          )}
          {storyMode === 'form' && (
             <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-md flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-2">
                    <div>
                        <label className="text-xs text-slate-400">Topic</label>
                        <select name="topic" value={storyFormData.topic} onChange={handleStoryFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                            {storyTopics.map(t => <option key={t} value={t}>{t || 'Select a topic...'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Location (City, Country, or Global)</label>
                        <input name="location" value={storyFormData.location} onChange={handleStoryFormChange} className={formFieldStyles} placeholder="e.g., California, USA" disabled={isLocked || isGenerating}/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Tone</label>
                        <select name="tone" value={storyFormData.tone} onChange={handleStoryFormChange} className={formFieldStyles} disabled={isLocked || isGenerating}>
                            {storyTones.map(t => <option key={t} value={t}>{t || 'Select a tone...'}</option>)}
                        </select>
                    </div>
                </div>
                {storyError && <p className="text-xs text-red-400 bg-red-900/50 p-2 rounded">{storyError}</p>}
                <button onClick={handleGenerateStoryFromForm} disabled={isLocked || isGenerating || !storyFormData.topic} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-bold py-2 px-3 rounded-md text-sm">
                    {isGeneratingStory ? <Icon type="spinner" className="w-4 h-4"/> : <Icon type="generate" className="w-4 h-4"/>}
                    Generate Story
                </button>
            </div>
          )}
           {storyMode === 'latest_news' && (
            <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-md flex flex-col gap-3 text-center">
              <p className="text-sm text-slate-300">Generate a story idea based on the latest global climate news from the past few days.</p>
              {storyError && <p className="text-xs text-red-400 bg-red-900/50 p-2 rounded">{storyError}</p>}
              <button onClick={handleGenerateLatestNews} disabled={isLocked || isGenerating} className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-bold py-2 px-3 rounded-md text-sm">
                  {isGeneratingLatestNews ? <Icon type="spinner" className="w-4 h-4"/> : <Icon type="generate" className="w-4 h-4"/>}
                  Generate from News
              </button>
            </div>
          )}
        </div>
        
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500 transition disabled:opacity-50"
                    checked={isPromotingBrand}
                    onChange={e => setIsPromotingBrand(e.target.checked)}
                    disabled={isLocked || isGenerating}
                />
                Promote a Brand/Product?
            </label>
            {isPromotingBrand && (
                <div className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-md flex flex-col gap-3 animate-fade-in">
                    <div>
                        <label htmlFor="brandInfo" className="text-xs text-slate-400">Brand/Product Information</label>
                        <textarea
                            id="brandInfo"
                            rows={3}
                            value={brandInfo}
                            onChange={e => setBrandInfo(e.target.value)}
                            className={formFieldStyles}
                            placeholder="e.g., EcoWater, a smart water bottle that tracks your intake and is made from recycled materials."
                            disabled={isLocked || isGenerating}
                        />
                    </div>
                    <div>
                        <label htmlFor="brandImage" className="text-xs text-slate-400">Brand/Product Image/Logo</label>
                        <input
                            id="brandImage"
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLocked || isGenerating}
                        />
                    </div>
                    {brandImage && (
                        <div className="mt-1">
                            <img src={brandImage} alt="Brand preview" className="max-h-28 rounded-md border border-slate-700" />
                        </div>
                    )}
                </div>
            )}
        </div>
        
        <div>
          <label htmlFor="voice-select" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0 .75H12a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 4.5 0v5.25A2.25 2.25 0 0 1 12 15.75Z" /></svg>
            Voice
          </label>
          <select
            id="voice-select"
            value={selectedVoiceName}
            onChange={(e) => setSelectedVoiceName(e.target.value)}
            disabled={isLocked || isGenerating || voices.length === 0}
            className={formFieldStyles}
          >
            {voices.length === 0 ? (
                <option>No Indian voices found</option>
            ) : (
                voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                    </option>
                ))
            )}
          </select>
        </div>
      </div>


      <div className="flex-shrink-0 flex flex-col gap-3 pt-4 border-t border-slate-700/50">
        <button
          onClick={onGenerateScript}
          disabled={isLocked || !persona || !storyboard || (isPromotingBrand && !brandInfo) || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform active:scale-95"
        >
          <Icon type="generate" className="w-5 h-5"/>
          Generate Script
        </button>
         <button
          onClick={onReset}
          disabled={isGenerating || ['script_generating', 'thumbnail_generating', 'video_generating'].includes(stage)}
          className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all"
        >
          <Icon type="reset" className="w-5 h-5"/>
          Reset
        </button>
      </div>
    </div>
  );
};

export default InputPanel;