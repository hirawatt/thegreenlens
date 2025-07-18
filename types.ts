
export interface Scene {
  visual: string;
  dialogue: string;
}

export interface CreativePackage {
  title: string;
  thumbnail_prompt: string;
  scenes: Scene[];
}

export interface GeneratedContent {
  creativePackage: CreativePackage | null;
  thumbnailUrl: string | null;
  videoFrameUrls: string[];
}

export type PipelineStage =
  | 'input'
  | 'script_generating'
  | 'script_approval'
  | 'thumbnail_generating'
  | 'thumbnail_approval'
  | 'video_generating'
  | 'complete'
  | 'error';

// For the Audience Persona form
export interface PersonaFormData {
  age: string;
  gender: string;
  location: string;
  interests: string;
  profession: string;
}

// For the Climate Story form
export interface StoryFormData {
  topic: string;
  location:string;
  tone: string;
}
