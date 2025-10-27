
import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Chat from './components/Chat';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loading screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen font-sans">
      <LoadingScreen isVisible={isLoading} />
      {!isLoading && <Chat />}
    </div>
  );
};

export default App;
