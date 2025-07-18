import { GoogleGenAI, Type } from "@google/genai";
import type { CreativePackage, PersonaFormData, StoryFormData } from '../types';
import { fallbackImageBase64 } from "../data/fallbackImage";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const creativePackageSchema = {
  type: Type.OBJECT,
  properties: {
    title: { 
        type: Type.STRING,
        description: "A catchy, climate-focused title for the video, under 70 characters."
    },
    thumbnail_prompt: { 
        type: Type.STRING,
        description: "A detailed, visually striking prompt for an AI image generator to create a click-worthy thumbnail related to the climate theme. Describe colors, composition, and mood."
    },
    scenes: {
      type: Type.ARRAY,
      description: "The sequence of scenes for the video.",
      items: {
        type: Type.OBJECT,
        properties: {
          visual: { 
            type: Type.STRING,
            description: "A detailed visual description for a scene about the climate topic, to be used as a prompt for an AI image generator."
          },
          dialogue: { 
            type: Type.STRING,
            description: "The spoken words for this scene. Should be a single, concise, and impactful sentence about the climate topic."
          }
        },
        required: ['visual', 'dialogue']
      }
    }
  },
  required: ['title', 'thumbnail_prompt', 'scenes']
};

export async function generateCreativePackage(
    persona: string, 
    storyboard: string,
    isPromoting: boolean,
    brandInfo: string,
    brandImage: string | null
): Promise<CreativePackage> {
    let textPrompt = `
        You are an expert in science communication and an environmental storyteller. Your task is to create a complete content package for a short-form video about a climate-related topic. The content should be engaging, informative, and accessible. The output must be a clean JSON object that adheres to the provided schema.

        Audience Persona:
        ${persona}

        Climate Story / Message:
        ${storyboard}
    `;

    if (isPromoting && brandInfo) {
        textPrompt += `\n\nCRITICAL INSTRUCTION: You must naturally and effectively integrate a promotion for the following brand/product into the generated content. This should be woven into the narrative, not a jarring advertisement. The thumbnail and scene visuals should also reflect this product placement.
        \nBrand/Product Information:\n${brandInfo}`;
        if (brandImage) {
            textPrompt += `\nAn image of the brand/product has been provided for your visual reference.`;
        }
    }

    textPrompt += "\n\nGenerate a compelling, climate-focused content package now.";

    const parts: any[] = [{ text: textPrompt }];
    
    if (isPromoting && brandImage) {
        const match = brandImage.match(/data:(image\/.+);base64,(.+)/);
        if (match) {
            const mimeType = match[1];
            const data = match[2];
            parts.push({
                inlineData: {
                    mimeType,
                    data,
                }
            });
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: creativePackageSchema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CreativePackage;
    } catch (error) {
        console.error("Error generating creative package:", error);
        throw new Error("Failed to generate script and scenes from Gemini.");
    }
}

export async function generatePersonaFromForm(formData: PersonaFormData): Promise<string> {
    const { age, gender, location, interests, profession } = formData;

    const prompt = `
        Based on the following user attributes, create a detailed and vibrant audience persona in a single paragraph. This persona should be framed within the context of their relationship to environmental and climate topics, making it suitable for creating targeted climate communication videos.

        Attributes:
        - Age Range: ${age || 'Not specified'}
        - Gender: ${gender || 'Not specified'}
        - Location Type: ${location || 'Not specified'}
        - Key Interests: ${interests || 'Not specified'}
        - Profession Field: ${profession || 'Not specified'}

        Generate a persona description that includes their likely awareness of climate issues, what might motivate them to engage with environmental content, their potential skepticism or concerns, and their digital content preferences.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating persona from form:", error);
        throw new Error("Failed to generate persona from Gemini.");
    }
}

export async function generateRandomPersona(): Promise<string> {
    const prompt = `
        You are an expert in market research and creative strategy.
        Your task is to generate a single, detailed, and vibrant audience persona in a single paragraph.
        This persona should be completely random, but grounded in realistic human archetypes.
        The persona should be framed within the context of their potential relationship to environmental and climate topics, making it suitable for creating targeted climate communication videos.

        Generate a random persona description now. Include details about their lifestyle, values, motivations, and how they might engage with climate content. Do not ask for any input. Just create one.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating random persona:", error);
        throw new Error("Failed to generate random persona from Gemini.");
    }
}

export async function generateStoryFromForm(formData: StoryFormData): Promise<string> {
    const { topic, location, tone } = formData;

    const prompt = `
        You are an expert climate communicator. Your goal is to generate a short, impactful video script idea based on the latest information.
        The script idea should be timely and relevant to the provided inputs.
        Provide a concise concept for a 60-second video, including a brief description of the narrative or key messages.

        Inputs:
        - Topic: ${topic || 'General Climate Change'}
        - Location Focus: ${location || 'Global'}
        - Tone: ${tone || 'Informative'}

        Using these inputs, generate a compelling "Climate Story / Message".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story from form:", error);
        throw new Error("Failed to generate climate story from Gemini.");
    }
}


export async function generateStoryFromLatestNews(): Promise<string> {
    const prompt = `
        You are an expert climate communicator. Your goal is to generate a short, impactful video script idea (a "Climate Story / Message") based on the most significant and trending global climate change news from the past few days.

        Use your search tool to find this recent news.

        Provide a concise concept for a 60-second video, including a brief description of the narrative or key messages. The output should be a single block of text, ready to be used as a storyboard input.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story from latest news:", error);
        throw new Error("Failed to generate climate story from latest news via Gemini.");
    }
}


export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch(error) {
        console.error(`Error generating image for prompt "${prompt}". Using fallback.`, error);
        return fallbackImageBase64;
    }
}