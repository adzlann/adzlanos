import { useState } from 'react';

interface DesktopIconProps {
  name: string;
  icon: string | React.ReactNode;
  position: { x: number; y: number };
  onDoubleClick: () => void;
}

export function DesktopIcon({ name, icon, position, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Deselect all other icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      if (icon !== e.currentTarget) {
        icon.classList.remove('selected');
      }
    });
    setIsSelected(!isSelected);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div
      className={`desktop-icon absolute flex flex-col items-center w-32 cursor-pointer ${
        isSelected ? 'selected' : ''
      }`}
      style={{ left: position.x, top: position.y }}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={`p-2 rounded flex flex-col items-center ${isSelected ? 'bg-gray-500' : ''}`}>
        <div className="w-16 h-16 flex items-center justify-center">
          {typeof icon === 'string' ? (
            <span className="text-4xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
        <div 
          className={`text-center text-[14px] leading-tight px-1 whitespace-nowrap font-chicago mt-2 bg-white text-black ${
            isSelected ? 'bg-gray-500 text-white' : ''
          }`}
          style={{ textShadow: isSelected ? '1px 1px 1px rgba(0,0,0,0.5)' : 'none' }}
        >
          {truncateText(name, 12)}
        </div>
      </div>
    </div>
  );
} 