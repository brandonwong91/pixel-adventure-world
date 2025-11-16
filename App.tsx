import React, { useState, useCallback } from 'react';
import { GameStatus } from './types';
import type { GameState, GeminiResponse } from './types';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { generateInitialScene, generateNextScene, generateLocationImage, generateImagePromptFromLocation } from './services/aiService';

const LOADING_MESSAGES = [
    "Building mountains...",
    "Planting pixelated trees...",
    "Populating world with 8-bit creatures...",
    "Rendering retro clouds...",
    "Generating mysterious caves...",
    "Thinking about what's over the next hill...",
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.SETUP,
    currentScene: null,
    actions: [],
    history: [],
    error: null,
    loadingMessage: 'Generating World...'
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handleStartGame = useCallback(async (imageDataUrl: string) => {
    setGameState(prev => ({ ...prev, status: GameStatus.GENERATING, loadingMessage: 'Parsing your world...' }));
    try {
      const isDataUrl = imageDataUrl.startsWith('data:');
      const mimeType = isDataUrl ? imageDataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] : 'image/png';
      const base64 = isDataUrl ? imageDataUrl.split(',')[1] : await fetch(imageDataUrl).then(r => r.blob()).then(b => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(b);
      }));

      if (!mimeType || !base64) {
        throw new Error('Invalid image data URL provided.');
      }
      
      setGameState(prev => ({ ...prev, loadingMessage: 'Contacting the world builder...' }));
      const geminiResponse: GeminiResponse = await generateInitialScene(base64, mimeType);

      setGameState(prev => ({ ...prev, loadingMessage: 'Painting the first sunrise...' }));
      const imageUrl = await generateLocationImage(geminiResponse.imagePrompt);

      setGameState({
        status: GameStatus.PLAYING,
        currentScene: { description: geminiResponse.description, image: imageUrl },
        actions: geminiResponse.actions,
        history: [geminiResponse.description],
        error: null,
        loadingMessage: ''
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setGameState(prev => ({ ...prev, status: GameStatus.ERROR, error: `Failed to generate world: ${errorMessage}`}));
    }
  }, []);

  const handleGenerateImageFromLocation = useCallback(async (coords: { latitude: number; longitude: number }) => {
    try {
        const prompt = await generateImagePromptFromLocation(coords.latitude, coords.longitude);
        const imageUrl = await generateLocationImage(prompt);
        return imageUrl;
    } catch (error) {
        console.error("Failed to generate image from location:", error);
        // Re-throw to be caught in SetupScreen to display error to user
        throw error;
    }
  }, []);

  const handleAction = useCallback(async (action: string) => {
    setIsProcessingAction(true);
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setGameState(prev => ({...prev, loadingMessage: randomMessage}));

    try {
      const geminiResponse: GeminiResponse = await generateNextScene(gameState.history, action);
      
      const imageUrl = await generateLocationImage(geminiResponse.imagePrompt);

      setGameState(prev => ({
        ...prev,
        currentScene: { description: geminiResponse.description, image: imageUrl },
        actions: geminiResponse.actions,
        history: [...prev.history, geminiResponse.description]
      }));
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setGameState(prev => ({ ...prev, error: `An error occurred: ${errorMessage}` }));
    } finally {
        setIsProcessingAction(false);
    }
  }, [gameState.history]);

  const renderContent = () => {
    switch (gameState.status) {
      case GameStatus.SETUP:
        return <SetupScreen 
            onStartGame={handleStartGame} 
            onGenerateImageFromLocation={handleGenerateImageFromLocation}
        />;
      case GameStatus.GENERATING:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner message={gameState.loadingMessage} />
          </div>
        );
      case GameStatus.PLAYING:
        return <GameScreen gameState={gameState} onAction={handleAction} isProcessing={isProcessingAction} />;
      case GameStatus.ERROR:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-4xl text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl">{gameState.error}</p>
            <button
              onClick={() => setGameState({
                  status: GameStatus.SETUP,
                  currentScene: null, actions: [], history: [], error: null, loadingMessage: ''
              })}
              className="text-2xl p-4 bg-green-500 text-gray-900 font-bold border-4 border-green-700 hover:bg-green-400"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="bg-gray-900 min-h-screen">{renderContent()}</div>;
};

export default App;