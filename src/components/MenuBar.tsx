import { useState } from 'react'

interface MenuBarProps {
  currentTime: Date;
  onAboutClick: () => void;
  onAppLaunch?: (id: string) => void;
}

const applications = [
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📝',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💣',
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: '🌐',
  }
];

export function MenuBar({ currentTime, onAboutClick, onAppLaunch }: MenuBarProps) {
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);

  const handleAppleMenuClick = () => {
    setIsAppleMenuOpen(!isAppleMenuOpen);
  };

  const handleAboutClick = () => {
    onAboutClick();
    setIsAppleMenuOpen(false);
  };

  const handleAppClick = (id: string) => {
    if (onAppLaunch) {
      onAppLaunch(id);
      setIsAppleMenuOpen(false);
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    setIsAppleMenuOpen(false);
  };

  return (
    <div className="h-7 bg-white border-b border-black flex items-center justify-between px-1 font-vt323">
      <div className="flex items-center space-x-1">
        <button
          className="px-2 hover:bg-black hover:text-white"
          onClick={handleAppleMenuClick}
        >
          🍎
        </button>
        <span className="text-base hover:bg-black hover:text-white px-2 cursor-pointer">File</span>
        <span className="text-base hover:bg-black hover:text-white px-2 cursor-pointer">Edit</span>
        <span className="text-base hover:bg-black hover:text-white px-2 cursor-pointer">View</span>
        <span className="text-base hover:bg-black hover:text-white px-2 cursor-pointer">Special</span>
      </div>
        
      {isAppleMenuOpen && (
        <>
          <div 
            className="fixed inset-0"
            onClick={handleClickOutside}
          />
          <div className="absolute top-7 left-0 w-64 bg-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-50">
            <div className="py-1">
              <button 
                onClick={handleAboutClick}
                className="w-full text-left px-4 py-1 text-base font-vt323 hover:bg-black hover:text-white border-b border-gray-200"
              >
                About This Computer...
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button className="w-full text-left px-4 py-1 text-base font-vt323 hover:bg-black hover:text-white">
                Control Panel
              </button>
              
              {/* Applications Section */}
              <div className="mt-1 border-b border-gray-200" />
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full text-left px-4 py-1 text-base font-vt323 hover:bg-black hover:text-white flex items-center gap-2"
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="text-base">
        {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </div>
    </div>
  );
} 