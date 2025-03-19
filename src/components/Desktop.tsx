import { useState, useEffect } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { AboutWindow } from './AboutWindow';
import { MenuBar } from './MenuBar';
import { FinderWindow } from './FinderWindow';
import { TextEditWindow } from './TextEditWindow';
import { MinesweeperWindow } from './MinesweeperWindow';
import { InternetExplorerWindow } from './InternetExplorerWindow';
import { ControlPanelsWindow } from './ControlPanelsWindow';
import { useWindow } from '../contexts/WindowContext';
import textEditIcon from '../assets/TextEdit.png';
import macintoshIcon from '../assets/macintosh.png';
import mineIcon from '../assets/mine.png';
import explorerIcon from '../assets/explorer.png';
import thunderWallpaper from '../assets/wallpaper/thunder_wallpaper.jpg';

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
    position: { x: window.innerWidth - 150, y: 0 }
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: <img src={textEditIcon} alt="TextEdit" className="w-12 h-12" />,
    position: { x: window.innerWidth - 150, y: 105 }
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: <img src={mineIcon} alt="Minesweeper" className="w-12 h-12" />,
    position: { x: window.innerWidth - 150, y: 210 }
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: <img src={explorerIcon} alt="Internet Explorer" className="w-12 h-12" />,
    position: { x: window.innerWidth - 150, y: 315 }
  }
];

export function Desktop() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAboutWindow, setShowAboutWindow] = useState(false);
  const [showFinderWindow, setShowFinderWindow] = useState(false);
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [showInternetExplorer, setShowInternetExplorer] = useState(false);
  const [showControlPanels, setShowControlPanels] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState(thunderWallpaper);
  const [apps] = useState<Application[]>(defaultApps);
  const { bringToFront, unminimizeWindow, isWindowMinimized, onWindowClose, reopenWindow, isWindowOpen, minimizeWindow } = useWindow();

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle window closing
  useEffect(() => {
    const unsubscribe = onWindowClose((id) => {
      switch (id) {
        case 'finder':
          setShowFinderWindow(false);
          break;
        case 'textedit':
          setShowTextEdit(false);
          break;
        case 'minesweeper':
          setShowMinesweeper(false);
          break;
        case 'internetexplorer':
          setShowInternetExplorer(false);
          break;
        case 'about':
          setShowAboutWindow(false);
          break;
        case 'controlpanels':
          setShowControlPanels(false);
          break;
      }
    });

    return unsubscribe;
  }, [onWindowClose]);

  const handleDesktopClick = () => {
    // Clear any selections when clicking the desktop
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => icon.classList.remove('selected'));
  };

  const handleAppLaunch = (id: string) => {
    switch (id) {
      case 'macintoshHd':
        if (isWindowMinimized('finder')) {
          unminimizeWindow('finder');
        } else if (!isWindowOpen('finder')) {
          reopenWindow('finder');
          setShowFinderWindow(true);
          bringToFront('finder');
        } else if (!showFinderWindow) {
          setShowFinderWindow(true);
          bringToFront('finder');
        } else {
          bringToFront('finder');
        }
        break;
      case 'textedit':
        // For TextEdit, we want a fresh instance when reopening after a close
        if (isWindowMinimized('textedit')) {
          unminimizeWindow('textedit');
        } else if (!isWindowOpen('textedit')) {
          // Clear any previous session storage to start fresh
          sessionStorage.removeItem('textEdit_temp_textedit');
          reopenWindow('textedit');
          setShowTextEdit(true);
          bringToFront('textedit');
        } else if (!showTextEdit) {
          setShowTextEdit(true);
          bringToFront('textedit');
        } else {
          bringToFront('textedit');
        }
        break;
      case 'minesweeper':
        if (isWindowMinimized('minesweeper')) {
          unminimizeWindow('minesweeper');
        } else if (!isWindowOpen('minesweeper')) {
          reopenWindow('minesweeper');
          setShowMinesweeper(true);
          bringToFront('minesweeper');
        } else if (!showMinesweeper) {
          setShowMinesweeper(true);
          bringToFront('minesweeper');
        } else {
          bringToFront('minesweeper');
        }
        break;
      case 'internetexplorer':
        if (isWindowMinimized('internetexplorer')) {
          unminimizeWindow('internetexplorer');
        } else if (!isWindowOpen('internetexplorer')) {
          reopenWindow('internetexplorer');
          setShowInternetExplorer(true);
          bringToFront('internetexplorer');
        } else if (!showInternetExplorer) {
          setShowInternetExplorer(true);
          bringToFront('internetexplorer');
        } else {
          bringToFront('internetexplorer');
        }
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <MenuBar 
        currentTime={currentTime}
        onAboutClick={() => {
          if (isWindowMinimized('about')) {
            unminimizeWindow('about');
          } else if (!showAboutWindow) {
            setShowAboutWindow(true);
            bringToFront('about');
          } else {
            bringToFront('about');
          }
        }}
        onControlPanelsClick={() => {
          if (isWindowMinimized('controlpanels')) {
            unminimizeWindow('controlpanels');
          } else if (!showControlPanels) {
            setShowControlPanels(true);
            bringToFront('controlpanels');
          } else {
            bringToFront('controlpanels');
          }
        }}
        onAppLaunch={handleAppLaunch}
      />
      <div 
        className="flex-1 relative overflow-hidden"
        onClick={handleDesktopClick}
        style={{
          backgroundImage: `url(${currentWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
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
            onClose={() => {
              // Do not actually close, just minimize
              minimizeWindow('about');
            }}
          />
        )}
        {showFinderWindow && (
          <FinderWindow 
            id="finder"
            onClose={() => {
              // Do not actually close, just minimize
              minimizeWindow('finder');
            }}
          />
        )}
        {showTextEdit && (
          <TextEditWindow 
            id="textedit"
            onClose={() => {
              // TextEdit is already set up to handle minimize correctly
              setShowTextEdit(false);
            }}
          />
        )}
        {showMinesweeper && (
          <MinesweeperWindow 
            id="minesweeper"
            onClose={() => {
              // Do not actually close, just minimize
              minimizeWindow('minesweeper');
            }}
          />
        )}
        {showInternetExplorer && (
          <InternetExplorerWindow 
            id="internetexplorer"
            onClose={() => {
              // Do not actually close, just minimize
              minimizeWindow('internetexplorer');
            }}
          />
        )}
        {showControlPanels && (
          <ControlPanelsWindow 
            id="controlpanels"
            onClose={() => {
              // Do not actually close, just minimize
              minimizeWindow('controlpanels');
            }}
            onWallpaperChange={(wallpaper) => setCurrentWallpaper(wallpaper)}
          />
        )}
      </div>
    </div>
  );
} 