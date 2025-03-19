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

// Constants
const WALLPAPER_STORAGE_KEY = 'macos7_desktop_wallpaper';

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
  const { 
    bringToFront, 
    unminimizeWindow, 
    isWindowMinimized, 
    onWindowClose, 
    reopenWindow, 
    isWindowOpen, 
    minimizeWindow,
    hasLoadedInitialState
  } = useWindow();

  // Load saved wallpaper from localStorage on initial mount
  useEffect(() => {
    const savedWallpaper = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (savedWallpaper) {
      setCurrentWallpaper(savedWallpaper);
    }
  }, []);

  // Save wallpaper to localStorage whenever it changes
  const handleWallpaperChange = (wallpaper: string) => {
    setCurrentWallpaper(wallpaper);
    localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
  };

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial load - only show windows that were both open and not minimized
  useEffect(() => {
    if (hasLoadedInitialState) {
      // Make sure we've loaded the window state from localStorage first
      setShowFinderWindow(isWindowOpen('finder') && !isWindowMinimized('finder'));
      setShowTextEdit(isWindowOpen('textedit') && !isWindowMinimized('textedit'));
      setShowMinesweeper(isWindowOpen('minesweeper') && !isWindowMinimized('minesweeper'));
      setShowInternetExplorer(isWindowOpen('internetexplorer') && !isWindowMinimized('internetexplorer'));
      setShowAboutWindow(isWindowOpen('about') && !isWindowMinimized('about'));
      setShowControlPanels(isWindowOpen('controlpanels') && !isWindowMinimized('controlpanels'));
      
      // Add to window order if necessary
      const openWindows = [
        'finder', 'textedit', 'minesweeper', 'internetexplorer', 'about', 'controlpanels'
      ].filter(id => isWindowOpen(id));
      
      openWindows.forEach(id => {
        if (isWindowOpen(id)) {
          bringToFront(id);
        }
      });
    }
  }, [isWindowOpen, isWindowMinimized, bringToFront, hasLoadedInitialState]);

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

  // Sync application visibility with window context state
  // This effect ensures the window visibility stays in sync with the window state as the user minimizes/restores windows
  useEffect(() => {
    if (hasLoadedInitialState) {
      const windowStateChanged = (id: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        const shouldBeVisible = isWindowOpen(id) && !isWindowMinimized(id);
        setter(shouldBeVisible);
      };

      windowStateChanged('finder', setShowFinderWindow);
      windowStateChanged('textedit', setShowTextEdit);
      windowStateChanged('minesweeper', setShowMinesweeper);
      windowStateChanged('internetexplorer', setShowInternetExplorer);
      windowStateChanged('about', setShowAboutWindow);
      windowStateChanged('controlpanels', setShowControlPanels);
    }
  }, [isWindowOpen, isWindowMinimized, hasLoadedInitialState]);

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
          // Clear session storage when reopening Minesweeper after it's been closed
          sessionStorage.removeItem('minesweeper_state_minesweeper');
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
          // Clear session storage when reopening Internet Explorer after it's been closed
          sessionStorage.removeItem('internetexplorer_state_internetexplorer');
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
            reopenWindow('about');
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
            reopenWindow('controlpanels');
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
              // Do not actually close, just minimize
              minimizeWindow('textedit');
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
            onWallpaperChange={handleWallpaperChange}
          />
        )}
      </div>
    </div>
  );
} 