import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center animate-fade-in-up">
        <h1 className="text-6xl md:text-8xl font-black tracking-widest shimmer-text">
          MAVERICK
        </h1>
        <p className="mt-4 text-lg md:text-xl font-light tracking-[0.3em] text-slate-500 uppercase">
          An IQROGUEREX Product
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;