import { useState, useEffect } from 'react';
import { configureApiClient } from '~/chrome-extension/utils/apiClient';
import { Settings } from './Settings';
import { Home } from './MyHome';

interface SpacePopupProps {
  onSave: (spaceKey: string, documentPath: string) => void;
}

export function SpacePopup({ onSave }: SpacePopupProps) {
  const [isApiClientInitialized, setIsApiClientInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    configureApiClient().then(() => {
      setIsApiClientInitialized(true);
    });
  }, []);
  return isApiClientInitialized ? (
    showSettings ? (
      <Settings setShowSettings={setShowSettings} />
    ) : (
      <Home setShowSettings={setShowSettings} onSave={onSave} />
    )
  ) : null;
}

export default SpacePopup;
