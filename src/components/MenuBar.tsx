import { useState } from 'react'
import { useWindow } from '../contexts/WindowContext'
import appleIcon from '../assets/apple.png'
import textEditIcon from '../assets/TextEdit.png'
import mineIcon from '../assets/mine.png'
import explorerIcon from '../assets/explorer.png'

interface MenuBarProps {
  currentTime: Date;
  onAboutClick: () => void;
  onControlPanelsClick: () => void;
  onAppLaunch?: (id: string) => void;
}

const applications = [
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: <img src={textEditIcon} alt="TextEdit" className="w-5 h-5" />,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: <img src={mineIcon} alt="Minesweeper" className="w-5 h-5" />,
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: <img src={explorerIcon} alt="Internet Explorer" className="w-5 h-5" />,
  }
];

export function MenuBar({ currentTime, onAboutClick, onControlPanelsClick, onAppLaunch }: MenuBarProps) {
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const { getActiveWindow, minimizeWindow, closeWindow } = useWindow();

  const handleAppleMenuClick = () => {
    setIsAppleMenuOpen(!isAppleMenuOpen);
    setIsFileMenuOpen(false);
    setIsEditMenuOpen(false);
  };

  const handleFileMenuClick = () => {
    setIsFileMenuOpen(!isFileMenuOpen);
    setIsAppleMenuOpen(false);
    setIsEditMenuOpen(false);
  };

  const handleEditMenuClick = () => {
    setIsEditMenuOpen(!isEditMenuOpen);
    setIsAppleMenuOpen(false);
    setIsFileMenuOpen(false);
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

  const handleNewFinderWindow = () => {
    if (onAppLaunch) {
      onAppLaunch('macintoshHd');
      setIsFileMenuOpen(false);
    }
  };

  const handleFileClose = () => {
    const activeWindowId = getActiveWindow();
    if (activeWindowId) {
      // For TextEdit windows, we need to save before minimizing
      if (activeWindowId === 'textedit') {
        // Save current state to session storage before minimizing
        const event = new CustomEvent('textedit-close-direct');
        window.dispatchEvent(event);
        minimizeWindow(activeWindowId);
      }
      // For Minesweeper and Internet Explorer, we want to actually close them to start fresh next time
      else if (activeWindowId === 'minesweeper' || activeWindowId === 'internetexplorer') {
        // Remove any saved state
        sessionStorage.removeItem(`minesweeper_state_${activeWindowId}`);
        sessionStorage.removeItem(`internetexplorer_state_${activeWindowId}`);
        closeWindow(activeWindowId);
      }
      // For any other window, minimize to preserve state
      else {
        minimizeWindow(activeWindowId);
      }
    }
    handleClickOutside();
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    setIsAppleMenuOpen(false);
    setIsFileMenuOpen(false);
    setIsEditMenuOpen(false);
  };

  return (
    <div className="h-7 bg-white border-b border-black flex items-center justify-between px-4 font-chicago">
      <div className="flex items-center space-x-2">
        <button
          className="px-2 hover:bg-gray-200"
          onClick={handleAppleMenuClick}
        >
          <img src={appleIcon} alt="Apple" className="w-4 h-4" />
        </button>
        <button 
          className="text-sm hover:bg-gray-200 px-2 cursor-pointer font-semibold"
          onClick={handleFileMenuClick}
        >
          File
        </button>
        <button 
          className="text-sm hover:bg-gray-200 px-2 cursor-pointer font-semibold"
          onClick={handleEditMenuClick}
        >
          Edit
        </button>
        <span className="text-sm hover:bg-gray-200 px-2 cursor-pointer font-semibold">View</span>
        <span className="text-sm hover:bg-gray-200 px-2 cursor-pointer font-semibold">Special</span>
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
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold hover:bg-gray-200 border-b border-gray-200"
              >
                About This Computer...
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button 
                onClick={() => {
                  onControlPanelsClick();
                  setIsAppleMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold hover:bg-gray-200"
              >
                Control Panels
              </button>
              
              {/* Applications Section */}
              <div className="mt-1 border-b border-gray-200" />
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold hover:bg-gray-200 flex items-center gap-2"
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isFileMenuOpen && (
        <>
          <div 
            className="fixed inset-0"
            onClick={handleClickOutside}
          />
          <div className="absolute top-7 left-[40px] w-48 bg-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-50">
            <div className="py-1">
              <button 
                onClick={handleNewFinderWindow}
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold hover:bg-gray-200 border-b border-gray-200"
              >
                New Finder Window
              </button>
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                New Folder
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Move to Trash
              </button>
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Empty Trash...
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button 
                onClick={handleFileClose}
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {isEditMenuOpen && (
        <>
          <div 
            className="fixed inset-0"
            onClick={handleClickOutside}
          />
          <div className="absolute top-7 left-[85px] w-48 bg-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-50">
            <div className="py-1">
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed border-b border-gray-200"
              >
                Undo
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Cut
              </button>
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Copy
              </button>
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Paste
              </button>
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed border-b border-gray-200"
              >
                Clear
              </button>
              <div className="mt-1 border-b border-gray-200" />
              <button 
                disabled
                className="w-full text-left px-4 py-1 text-sm font-chicago font-semibold text-gray-400 cursor-not-allowed"
              >
                Select All
              </button>
            </div>
          </div>
        </>
      )}

      <div className="text-sm font-semibold">
        {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </div>
    </div>
  );
} 