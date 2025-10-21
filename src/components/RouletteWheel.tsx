import { memo } from 'react';

interface RouletteWheelProps {
  currentNumber?: number;
}

export const RouletteWheel = memo(({ currentNumber }: RouletteWheelProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        {/* Wheel */}
        <div 
          className="absolute inset-0 rounded-full animate-spin-slow"
          style={{
            background: `conic-gradient(
              from 0deg,
              #ff0000 0deg 9.73deg, #000000 9.73deg 19.46deg,
              #ff0000 19.46deg 29.19deg, #000000 29.19deg 38.92deg,
              #ff0000 38.92deg 48.65deg, #000000 48.65deg 58.38deg,
              #ff0000 58.38deg 68.11deg, #000000 68.11deg 77.84deg,
              #ff0000 77.84deg 87.57deg, #000000 87.57deg 97.3deg,
              #ff0000 97.3deg 107.03deg, #000000 107.03deg 116.76deg,
              #ff0000 116.76deg 126.49deg, #000000 126.49deg 136.22deg,
              #ff0000 136.22deg 145.95deg, #000000 145.95deg 155.68deg,
              #ff0000 155.68deg 165.41deg, #000000 165.41deg 175.14deg,
              #ff0000 175.14deg 184.87deg, #000000 184.87deg 194.6deg,
              #ff0000 194.6deg 204.33deg, #000000 204.33deg 214.06deg,
              #ff0000 214.06deg 223.79deg, #000000 223.79deg 233.52deg,
              #ff0000 233.52deg 243.25deg, #000000 243.25deg 252.98deg,
              #ff0000 252.98deg 262.71deg, #000000 262.71deg 272.44deg,
              #ff0000 272.44deg 282.17deg, #000000 282.17deg 291.9deg,
              #ff0000 291.9deg 301.63deg, #000000 301.63deg 311.36deg,
              #ff0000 311.36deg 321.09deg, #000000 321.09deg 330.82deg,
              #ff0000 330.82deg 340.55deg, #000000 340.55deg 350.28deg,
              #ff0000 350.28deg 360deg, #00ff00 0deg 9.73deg
            )`
          }}
        />
        
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black text-xl md:text-2xl shadow-lg">
          {currentNumber ?? '?'}
        </div>
      </div>
      
      {currentNumber !== undefined && (
        <div className="mt-6 text-center">
          <div 
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent animate-pulse-glow"
          >
            {currentNumber}
          </div>
        </div>
      )}
    </div>
  );
});

RouletteWheel.displayName = 'RouletteWheel';
