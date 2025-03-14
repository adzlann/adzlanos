import { useState } from 'react'

interface MenuBarProps {
  currentTime: Date;
  onAboutClick: () => void;
}

export function MenuBar({ currentTime, onAboutClick }: MenuBarProps) {
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);

  const handleAppleMenuClick = () => {
    setIsAppleMenuOpen(!isAppleMenuOpen);
  };

  const handleAboutClick = () => {
    onAboutClick();
    setIsAppleMenuOpen(false);
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    setIsAppleMenuOpen(false);
  };

  return (
    <div className="relative">
      <div className="h-5 bg-white border-b border-gray-400 flex items-center justify-between px-1">
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleAppleMenuClick}
            className={`hover:bg-gray-200 px-1.5 py-0.5 rounded text-sm ${isAppleMenuOpen ? 'bg-gray-200' : ''}`}
          >
            🍎
          </button>
          <span className="text-xs hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer">File</span>
          <span className="text-xs hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer">Edit</span>
          <span className="text-xs hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer">View</span>
          <span className="text-xs hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer">Special</span>
        </div>
        <div className="text-xs pr-1">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>

      {/* Apple Menu Dropdown */}
      {isAppleMenuOpen && (
        <>
          <div 
            className="fixed inset-0"
            onClick={handleClickOutside}
          />
          <div className="absolute top-5 left-0 w-64 bg-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-50">
            <div className="py-1">
              <button 
                onClick={handleAboutClick}
                className="w-full text-left px-4 py-1 text-xs font-chicago hover:bg-black hover:text-white border-b border-gray-200"
              >
                About This Computer...
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button className="w-full text-left px-4 py-1 text-xs font-chicago hover:bg-black hover:text-white">
                Control Panel
              </button>
              <button className="w-full text-left px-4 py-1 text-xs font-chicago hover:bg-black hover:text-white border-b border-gray-200">
                Chooser
              </button>
              <div className="mt-1" />
              <button className="w-full text-left px-4 py-1 text-xs font-chicago hover:bg-black hover:text-white">
                Restart
              </button>
              <button className="w-full text-left px-4 py-1 text-xs font-chicago hover:bg-black hover:text-white">
                Shut Down
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 