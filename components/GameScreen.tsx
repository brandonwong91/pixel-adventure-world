
import React from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import type { GameState } from '../types';
import ActionButton from './ActionButton';
import LoadingSpinner from './LoadingSpinner';

interface GameScreenProps {
  gameState: GameState;
  onAction: (action: string) => void;
  isProcessing: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, onAction, isProcessing }) => {
  const { currentScene, actions, history } = gameState;
  const typedDescription = useTypewriter(currentScene?.description, 20);

  if (!currentScene) {
    return <LoadingSpinner message="Loading scene..." />;
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 flex flex-col">
       <h1 className="text-4xl text-green-400 mb-4 text-center">Pixel World Adventure</h1>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side (Image) */}
        <div className="lg:col-span-3 bg-gray-900 border-2 border-gray-700 p-2 flex items-center justify-center">
           {isProcessing && !currentScene.image ? (
                <LoadingSpinner message="Generating Vista..." />
            ) : (
                <img 
                    src={currentScene.image} 
                    alt="Current Scene" 
                    className="w-full h-full object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                />
            )}
        </div>

        {/* Right Side (Text & Actions) */}
        <div className="lg:col-span-2 flex flex-col bg-gray-900 border-2 border-gray-700 p-6 text-xl text-gray-300">
          <div className="flex-grow overflow-y-auto mb-6 pr-2" style={{ maxHeight: '40vh' }}>
            <p className="whitespace-pre-wrap">{typedDescription}</p>
          </div>
          
          <div className="border-t-2 border-gray-700 pt-4">
             {isProcessing ? (
                <div className="text-center text-green-400 text-2xl animate-pulse">
                    <p>{gameState.loadingMessage}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {actions.map((action, index) => (
                    <ActionButton
                        key={`${history.length}-${index}`}
                        text={action}
                        onClick={() => onAction(action)}
                        disabled={isProcessing}
                    />
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
