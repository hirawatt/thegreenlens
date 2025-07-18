import React, { useState } from 'react';
import type { GeneratedContent, PipelineStage } from '../types';
import { Icon } from './icons';
import VideoPlayer from './VideoPlayer';
import Spinner from './Spinner';
import JSZip from 'jszip';

interface OutputPanelProps {
  content: GeneratedContent;
  error: string | null;
  stage: PipelineStage;
  selectedVoiceName: string;
  onRegenerateScript: () => void;
  onApproveScript: () => void;
  onRegenerateThumbnail: () => void;
  onApproveThumbnail: () => void;
  onRetry: () => void;
  onReset: () => void;
}

const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success';
  icon?: 'generate' | 'check' | 'reset' | 'cross' | 'download' | 'spinner';
}> = ({ onClick, disabled, children, variant = 'primary', icon }) => {
  const baseClasses = "flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-md transition-all disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-600",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-600/50",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-slate-600",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]}`}>
      {icon && <Icon type={icon} className="w-5 h-5"/>}
      {children}
    </button>
  );
};

const ScriptDisplay: React.FC<{creativePackage: GeneratedContent['creativePackage']}> = ({ creativePackage }) => (
    <div>
        <h4 className="text-lg font-semibold mb-2 text-slate-300">Script for "{creativePackage?.title || 'Untitled'}"</h4>
        <div className="bg-slate-800/70 p-4 rounded-lg max-h-96 overflow-y-auto">
            {creativePackage?.scenes.map((scene, index) => (
                <div key={index} className="pb-3 mb-3 border-b border-slate-700 last:border-b-0 last:pb-0 last:mb-0">
                    <p className="text-sm text-emerald-300 font-semibold">Scene {index + 1}</p>
                    <p className="text-slate-200">{scene.dialogue}</p>
                </div>
            ))}
        </div>
    </div>
);


const OutputPanel: React.FC<OutputPanelProps> = (props) => {
  const { content, error, stage, selectedVoiceName, onRegenerateScript, onApproveScript, onRegenerateThumbnail, onApproveThumbnail, onRetry, onReset } = props;
  const { creativePackage, thumbnailUrl, videoFrameUrls } = content;
  
  const [isZipping, setIsZipping] = useState(false);
  
  const handleExport = async () => {
    if (!creativePackage || !thumbnailUrl || videoFrameUrls.length === 0) return;

    setIsZipping(true);

    try {
        const zip = new JSZip();

        // 1. Add script
        zip.file("script.json", JSON.stringify(creativePackage, null, 2));

        // 2. Add thumbnail
        const thumbnailData = thumbnailUrl.split(',')[1];
        zip.file("thumbnail.jpeg", thumbnailData, { base64: true });
        
        // 3. Add video frames
        const framesFolder = zip.folder("video_frames");
        if (framesFolder) {
            videoFrameUrls.forEach((frameUrl, index) => {
                const frameData = frameUrl.split(',')[1];
                const frameNumber = String(index + 1).padStart(2, '0');
                framesFolder.file(`frame_${frameNumber}.jpeg`, frameData, { base64: true });
            });
        }
        
        const zipContent = await zip.generateAsync({ type: "blob" });
        
        const safeTitle = creativePackage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeTitle || 'climate_video_package'}.zip`;

        // Trigger download using File System Access API if available for better UX, else fallback
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipContent);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (err) {
        console.error("Error creating zip file:", err);
        // Here you could set an error state to show a message to the user
    } finally {
        setIsZipping(false);
    }
  };


  const renderContent = () => {
    if (stage === 'error') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
          <Icon type="cross" className="w-16 h-16 mb-4"/>
          <h3 className="text-xl font-semibold">Generation Failed</h3>
          <p className="max-w-md mt-2 text-red-300 bg-red-900/50 p-3 rounded-md">{error}</p>
          <div className="flex items-center gap-4 mt-6">
            <ActionButton onClick={onRetry} variant="primary" icon="generate">Try Again</ActionButton>
            <ActionButton onClick={onReset} variant="secondary" icon="reset">Reset All</ActionButton>
          </div>
        </div>
      );
    }

    switch (stage) {
      case 'input':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 mb-4 text-slate-700"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.502 6.345a.75.75 0 1 1-1.004-1.004l3.535 3.536a.75.75 0 0 1 0 1.06l-3.535 3.536a.75.75 0 0 1-1.004-1.004l2.284-2.285H8.25a.75.75 0 0 1 0-1.5h6.536L12.502 6.345Z" clipRule="evenodd" /></svg>
            <h3 className="text-xl font-semibold">Ready to Create Change</h3>
            <p className="max-w-md mt-2">Define your audience and climate story, then click "Generate Script" to begin.</p>
          </div>
        );
      case 'script_generating':
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Spinner label="Generating climate script..." size="lg" />
            </div>
        );
      case 'script_approval':
        if (!creativePackage) return null;
        return (
            <div className="flex flex-col justify-center h-full gap-6">
                <ScriptDisplay creativePackage={creativePackage} />
                <div className="flex items-center justify-center gap-4">
                    <ActionButton onClick={onRegenerateScript} variant="secondary" icon="generate">Regenerate Script</ActionButton>
                    <ActionButton onClick={onApproveScript} variant="primary" icon="check">Approve & Generate Thumbnail</ActionButton>
                </div>
            </div>
        );
    }

    if (!creativePackage) return <div className="flex items-center justify-center h-full"><Spinner label="Loading..." /></div>;
    
    // Stages from here require creativePackage
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 h-full relative">
            {/* Main Content Area */}
            <div className="lg:col-span-1 xl:col-span-2 flex flex-col justify-center items-center">
                 {stage === 'complete' && <VideoPlayer title={creativePackage.title} scenes={creativePackage.scenes} frameUrls={videoFrameUrls} selectedVoiceName={selectedVoiceName} />}
                 {stage === 'video_generating' && <div className="aspect-[9/16] w-full max-w-xs mx-auto bg-black rounded-lg flex items-center justify-center"><Spinner label="Generating video frames..." size="lg"/></div>}
                 {(stage === 'thumbnail_approval' || stage === 'thumbnail_generating') && (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <h4 className="text-lg font-semibold text-slate-300">Generated Thumbnail</h4>
                        <div className="aspect-[9/16] w-full max-w-xs bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                            {stage === 'thumbnail_generating' && <Spinner label="Generating..." size="lg"/>}
                            {thumbnailUrl && <img src={thumbnailUrl} alt="Generated thumbnail" className="w-full h-full object-cover" />}
                        </div>
                        {stage === 'thumbnail_approval' && (
                             <div className="flex items-center justify-center gap-4 mt-4">
                                <ActionButton onClick={onRegenerateThumbnail} variant="secondary" icon="generate">Regenerate</ActionButton>
                                <ActionButton onClick={onApproveThumbnail} variant="primary" icon="check">Approve & Generate Video</ActionButton>
                            </div>
                        )}
                    </div>
                 )}
            </div>
             {/* Sidebar */}
            <div className="lg:col-span-1 xl:col-span-3 flex flex-col gap-6 justify-center">
                {(stage === 'complete' || stage === 'video_generating') && (
                     <div>
                        <h4 className="text-lg font-semibold mb-2 text-slate-300">Final Thumbnail</h4>
                        <div className="aspect-[9/16] w-full max-w-[200px] bg-slate-800 rounded-lg overflow-hidden mx-auto lg:mx-0">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Generated thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Icon type="spinner" className="w-8 h-8"/>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <ScriptDisplay creativePackage={creativePackage} />
                {stage === 'complete' && (
                  <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 border-t border-slate-700/50">
                    <ActionButton
                      onClick={handleExport}
                      disabled={isZipping}
                      variant={'primary'}
                      icon={isZipping ? 'spinner' : 'download'}
                    >
                      {isZipping ? 'Zipping...' : 'Export Project (.zip)'}
                    </ActionButton>
                    <ActionButton onClick={onReset} variant="secondary" icon="reset">Start Over</ActionButton>
                  </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="flex-grow p-6 md:p-8 bg-slate-900 overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default OutputPanel;