import { useState } from 'react';

interface DesktopIconProps {
  name: string;
  icon: string;
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

  return (
    <div
      className={`desktop-icon absolute flex flex-col items-center w-24 cursor-pointer ${
        isSelected ? 'selected' : ''
      }`}
      style={{ left: position.x, top: position.y }}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={`p-1 rounded ${isSelected ? 'bg-gray-500' : ''}`}>
        <div className="w-12 h-12 flex items-center justify-center text-3xl mb-1">
          {icon}
        </div>
        <div 
          className={`text-center text-[11px] leading-tight px-1 break-words font-chicago ${
            isSelected ? 'text-white' : 'text-white'
          }`}
          style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
        >
          {name}
        </div>
      </div>
    </div>
  );
} 