import { useState, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { AboutWindow } from './AboutWindow';
import { MenuBar } from './MenuBar';
import { FinderWindow } from './FinderWindow';
import { TextEditWindow } from './TextEditWindow';
import { MinesweeperWindow } from './MinesweeperWindow';
import { InternetExplorerWindow } from './InternetExplorerWindow';

interface Application {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
}

const defaultApps: Application[] = [
  {
    id: 'macintoshHd',
    name: 'Macintosh HD',
    icon: '💽',
    position: { x: window.innerWidth - 100, y: 20 }
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📝',
    position: { x: window.innerWidth - 100, y: 100 }
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💣',
    position: { x: window.innerWidth - 100, y: 180 }
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: '🌐',
    position: { x: window.innerWidth - 100, y: 260 }
  }
];

export function Desktop() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showFinderWindow, setShowFinderWindow] = useState(false);
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [showInternetExplorer, setShowInternetExplorer] = useState(false);
  const [apps] = useState<Application[]>(defaultApps);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDesktopClick = () => {
    // Clear any selections when clicking the desktop
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => icon.classList.remove('selected'));
  };

  const handleAppLaunch = (id: string) => {
    switch (id) {
      case 'macintoshHd':
        setShowFinderWindow(true);
        break;
      case 'textedit':
        setShowTextEdit(true);
        break;
      case 'minesweeper':
        setShowMinesweeper(true);
        break;
      case 'internetexplorer':
        setShowInternetExplorer(true);
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <MenuBar 
        currentTime={currentTime}
        onAboutClick={() => setShowAboutWindow(true)}
      />
      <div 
        className="flex-1 bg-[#000033] relative overflow-hidden"
        onClick={handleDesktopClick}
      >
        {/* Desktop Icons */}
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            name={app.name}
            icon={app.icon}
            position={app.position}
            onDoubleClick={() => handleAppLaunch(app.id)}
          />
        ))}

        {/* Windows */}
        {showAboutWindow && (
          <AboutWindow onClose={() => setShowAboutWindow(false)} />
        )}
        {showFinderWindow && (
          <FinderWindow onClose={() => setShowFinderWindow(false)} />
        )}
        {showTextEdit && (
          <TextEditWindow onClose={() => setShowTextEdit(false)} />
        )}
        {showMinesweeper && (
          <MinesweeperWindow onClose={() => setShowMinesweeper(false)} />
        )}
        {showInternetExplorer && (
          <InternetExplorerWindow onClose={() => setShowInternetExplorer(false)} />
        )}
      </div>
    </div>
  );
} 