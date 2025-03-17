import { useState, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { AboutWindow } from './AboutWindow';
import { MenuBar } from './MenuBar';
import { FinderWindow } from './FinderWindow';
import { TextEditWindow } from './TextEditWindow';
import { MinesweeperWindow } from './MinesweeperWindow';
import { InternetExplorerWindow } from './InternetExplorerWindow';
import { useWindow } from '../contexts/WindowContext';
import textEditIcon from '../assets/TextEdit.png';
import macintoshIcon from '../assets/macintosh.png';

interface Application {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  position: { x: number; y: number };
}

const defaultApps: Application[] = [
  {
    id: 'macintoshHd',
    name: 'Macintosh HD',
    icon: <img src={macintoshIcon} alt="Macintosh HD" className="w-12 h-12" />,
    position: { x: window.innerWidth - 150, y: 40 }
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: <img src={textEditIcon} alt="TextEdit" className="w-12 h-12" />,
    position: { x: window.innerWidth - 150, y: 160 }
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: <span className="text-4xl">💣</span>,
    position: { x: window.innerWidth - 150, y: 280 }
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: <span className="text-4xl">🌐</span>,
    position: { x: window.innerWidth - 150, y: 400 }
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
  const { bringToFront } = useWindow();

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
        bringToFront('finder');
        break;
      case 'textedit':
        setShowTextEdit(true);
        bringToFront('textedit');
        break;
      case 'minesweeper':
        setShowMinesweeper(true);
        bringToFront('minesweeper');
        break;
      case 'internetexplorer':
        setShowInternetExplorer(true);
        bringToFront('internetexplorer');
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <MenuBar 
        currentTime={currentTime}
        onAboutClick={() => {
          setShowAboutWindow(true);
          bringToFront('about');
        }}
        onAppLaunch={handleAppLaunch}
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
          <AboutWindow 
            id="about"
            onClose={() => setShowAboutWindow(false)}
          />
        )}
        {showFinderWindow && (
          <FinderWindow 
            id="finder"
            onClose={() => setShowFinderWindow(false)}
          />
        )}
        {showTextEdit && (
          <TextEditWindow 
            id="textedit"
            onClose={() => setShowTextEdit(false)}
          />
        )}
        {showMinesweeper && (
          <MinesweeperWindow 
            id="minesweeper"
            onClose={() => setShowMinesweeper(false)}
          />
        )}
        {showInternetExplorer && (
          <InternetExplorerWindow 
            id="internetexplorer"
            onClose={() => setShowInternetExplorer(false)}
          />
        )}
      </div>
    </div>
  );
} 