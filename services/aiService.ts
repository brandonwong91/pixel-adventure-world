import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "A detailed, immersive description of the current scene for the player. Should be 2-3 paragraphs."
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A detailed prompt for an AI image generator. Style must be: pixel art, blocky, minecraft style, vibrant colors, 8-bit, detailed."
        },
        actions: {
            type: Type.ARRAY,
            description: "An array of 3-4 short, actionable choices for the player (e.g., 'Walk towards the glowing cave', 'Inspect the strange flower').",
            items: { type: Type.STRING }
        }
    },
    required: ["description", "imagePrompt", "actions"]
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateImagePromptFromLocation = async (latitude: number, longitude: number): Promise<string> => {
    const prompt = `Based on the geographical coordinates (latitude: ${latitude}, longitude: ${longitude}), describe a visually striking, iconic landscape or a characteristic scene of this area. The description should be a single, detailed paragraph suitable as a prompt for an AI image generator. Focus on key visual elements, atmosphere, colors, and potential unique features. For instance, if it's a bustling city center, describe the architecture, the flow of people, and the lighting. If it's a remote natural area, describe the terrain, flora, fauna, and weather. The style should be evocative and inspiring for a fantasy world.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.6,
        }
    });

    return response.text.trim();
};

export const generateInitialScene = async (base64Image: string, mimeType: string) => {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: `You are a text adventure game master specializing in creating worlds with a blocky, pixelated aesthetic like Minecraft. A user has provided this image as inspiration for a vast 2km x 2km world. Generate the starting scene for their adventure. The scene should feel like it's part of this larger world. Your response must be a valid JSON object adhering to the provided schema.`};
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.8,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateNextScene = async (history: string[], playerAction: string) => {
    const prompt = `You are a text adventure game master in a blocky, pixelated world. The player's journey so far is: '${history.join(' -> ')}'. They have just chosen to: '${playerAction}'. Generate the next scene. Keep the story coherent and interesting, revealing more of the world. Do not repeat previous descriptions. Your response must be a valid JSON object adhering to the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.7,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateLocationImage = async (prompt: string): Promise<string> => {
    const fullPrompt = `${prompt}, detailed pixel art, blocky, minecraft style, vibrant colors, 8-bit graphics, epic fantasy`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
};