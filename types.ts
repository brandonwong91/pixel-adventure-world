
export enum GameStatus {
  SETUP,
  GENERATING,
  PLAYING,
  ERROR,
}

export interface Scene {
  description: string;
  image: string; // base64 data URL
}

export interface GameState {
  status: GameStatus;
  currentScene: Scene | null;
  actions: string[];
  history: string[]; // History of descriptions
  error: string | null;
  loadingMessage: string;
}

export interface GeminiResponse {
    description: string;
    imagePrompt: string;
    actions: string[];
}
