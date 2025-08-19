import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SetupScreenProps {
  onStartGame: (imageDataUrl: string) => void;
  onGenerateImageFromLocation: (coords: { latitude: number; longitude: number }) => Promise<string>;
}

type Step = 'idle' | 'locating' | 'imagining' | 'ready' | 'error';

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, onGenerateImageFromLocation }) => {
  const [step, setStep] = useState<Step>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationClick = useCallback(async () => {
    setStep('locating');
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStep('error');
      return;
    }

    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });
    };

    try {
      const position = await getPosition();
      setStep('imagining');
      const imageUrl = await onGenerateImageFromLocation(position.coords);
      setPreview(imageUrl);
      setStep('ready');
    } catch (err: any) {
      let message = 'An unknown error occurred.';
      // Check if it's a GeolocationPositionError
      if (err && typeof err.code === 'number') {
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            message = 'You denied the request for Geolocation. Please enable location permissions in your browser settings for this site and try again.';
            break;
          case 2: // POSITION_UNAVAILABLE
            message = 'Location information is unavailable. Please check your connection and try again.';
            break;
          case 3: // TIMEOUT
            message = 'The request to get user location timed out. Please try again.';
            break;
        }
      } else if (err instanceof Error) {
        message = `An error occurred: ${err.message}`;
      }
      setError(message);
      setStep('error');
    }
  }, [onGenerateImageFromLocation]);

  const handleStartClick = useCallback(() => {
    if (preview) {
      onStartGame(preview);
    }
  }, [preview, onStartGame]);

  const handleRetry = () => {
    setStep('idle');
    setError(null);
    setPreview(null);
  };

  const renderContent = () => {
    switch (step) {
      case 'locating':
        return <LoadingSpinner message="Finding you on the map..." />;
      case 'imagining':
        return <LoadingSpinner message="Imagining your surroundings..." />;
      case 'error':
        return (
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="text-2xl p-3 bg-green-500 text-gray-900 font-bold border-2 border-green-700 hover:bg-green-400"
            >
              Try Again
            </button>
          </div>
        );
      case 'ready':
        return (
          <>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">Here's the inspiration for your world:</p>
              <img
                src={preview!}
                alt="Generated world inspiration"
                className="max-h-64 mx-auto border-2 border-gray-600"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex gap-4 w-full">
              <button
                onClick={handleRetry}
                className="w-1/3 text-2xl p-4 bg-gray-600 text-white font-bold border-2 border-gray-700 hover:bg-gray-500 transition-all"
              >
                RETRY
              </button>
              <button
                onClick={handleStartClick}
                className="w-2/3 text-3xl p-4 bg-green-500 text-gray-900 font-bold border-4 border-green-700 hover:bg-green-400 transition-all"
              >
                GENERATE WORLD
              </button>
            </div>
          </>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={handleLocationClick}
            className="w-full text-3xl p-4 bg-green-500 text-gray-900 font-bold border-4 border-green-700 hover:bg-green-400 transition-all"
          >
            Use My Location
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="w-full max-w-2xl bg-gray-800 border-4 border-green-500 p-8 shadow-lg shadow-green-500/10">
        <h1 className="text-6xl font-bold text-green-400 mb-2">Pixel World Adventure</h1>
        <p className="text-xl text-gray-300 mb-8">
          Use your current location to generate a unique text-based adventure!
        </p>
        <div className="min-h-[250px] flex flex-col items-center justify-center w-full">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SetupScreen;