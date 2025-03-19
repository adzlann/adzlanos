import { Window } from './Window';
import { useState, useRef, useEffect } from 'react';
import { useWindow } from '../contexts/WindowContext';

interface Bookmark {
  name: string;
  url: string;
  icon?: string;
}

interface InternetExplorerWindowProps {
  onClose: () => void;
  id: string;
}

export function InternetExplorerWindow({ onClose, id }: InternetExplorerWindowProps) {
  const defaultUrl = 'https://sarangresepi.vercel.app/';
  const [url, setUrl] = useState(defaultUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isWindowMinimized } = useWindow();

  const bookmarks: Bookmark[] = [
    { name: 'SarangResepi', url: 'https://sarangresepi.vercel.app/', icon: '🍳' },
    { name: 'NewJeans', url: 'https://newjeans.kr', icon: '👖' },
    { name: 'HyperCard', url: 'https://hcsimulator.com', icon: '💳' },
  ];

  // Save browser state when minimized
  useEffect(() => {
    // Function to save the current browser state
    const saveBrowserState = () => {
      // Get the current URL from the iframe
      let currentSrc = url;
      if (iframeRef.current) {
        try {
          currentSrc = iframeRef.current.src || url;
        } catch {
          // Handle cross-origin restrictions
          console.warn('Could not access iframe src due to cross-origin policy');
        }
      }

      const browserState = {
        url: currentSrc,
        inputUrl: url
      };
      
      sessionStorage.setItem(`internetexplorer_state_${id}`, JSON.stringify(browserState));
    };

    // Set up interval to check window state
    let minimizeState = isWindowMinimized(id);
    const intervalId = setInterval(() => {
      const newMinimizeState = isWindowMinimized(id);
      
      // If window was just minimized, save state
      if (!minimizeState && newMinimizeState) {
        saveBrowserState();
      }
      
      minimizeState = newMinimizeState;
    }, 100);

    return () => clearInterval(intervalId);
  }, [id, url, isWindowMinimized]);

  // Restore browser state when component mounts or is unminimized
  useEffect(() => {
    const restoreBrowserState = () => {
      const savedState = sessionStorage.getItem(`internetexplorer_state_${id}`);
      if (savedState) {
        try {
          const { url: savedUrl, inputUrl } = JSON.parse(savedState);
          
          if (savedUrl) {
            // Set both URL state and iframe src to ensure they match
            if (iframeRef.current) {
              iframeRef.current.src = savedUrl;
            }
            
            // Force a double RAF to ensure the iframe updates properly
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (iframeRef.current) {
                  iframeRef.current.src = savedUrl;
                }
              });
            });
          }
          
          if (inputUrl) {
            setUrl(inputUrl);
          }
        } catch (error) {
          console.error('Error restoring Internet Explorer state:', error);
        }
      }
    };

    // Restore state when component mounts
    restoreBrowserState();

    // Also set up a listener for unminimize events
    let minimizeState = isWindowMinimized(id);
    const intervalId = setInterval(() => {
      const newMinimizeState = isWindowMinimized(id);
      
      // If window was just unminimized, restore state
      if (minimizeState && !newMinimizeState) {
        restoreBrowserState();
      }
      
      minimizeState = newMinimizeState;
    }, 100);

    return () => clearInterval(intervalId);
  }, [id, isWindowMinimized]);

  // Initialize with proper URL
  useEffect(() => {
    // First, check if we have a saved state
    const savedState = sessionStorage.getItem(`internetexplorer_state_${id}`);
    if (savedState) {
      try {
        const { url: savedUrl } = JSON.parse(savedState);
        
        // Use the saved URL as our default if available
        if (savedUrl && iframeRef.current) {
          iframeRef.current.src = savedUrl;
          setUrl(savedUrl);
        }
      } catch (error) {
        console.error('Error initializing Internet Explorer:', error);
        // Fall back to default URL
        if (iframeRef.current) {
          iframeRef.current.src = defaultUrl;
        }
      }
    } else {
      // No saved state, use default URL
      if (iframeRef.current) {
        iframeRef.current.src = defaultUrl;
      }
    }
  }, [defaultUrl, id]);

  // Update URL tracking when iframe changes - moved to separate effect
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        try {
          const loadedUrl = iframe.src;
          setUrl(loadedUrl);
          
          // Save state when iframe loads a new page
          const browserState = {
            url: loadedUrl,
            inputUrl: loadedUrl
          };
          
          sessionStorage.setItem(`internetexplorer_state_${id}`, JSON.stringify(browserState));
        } catch {
          // Handle cross-origin restrictions
          console.warn('Could not access iframe src due to cross-origin policy');
        }
      };
      
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [id]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (iframeRef.current) {
      // Ensure URLs start with http:// or https://
      let navigateUrl = url;
      if (!navigateUrl.startsWith('http://') && !navigateUrl.startsWith('https://')) {
        navigateUrl = 'https://' + navigateUrl;
        setUrl(navigateUrl);
      }
      
      // Update iframe source
      iframeRef.current.src = navigateUrl;
      
      // Save state immediately when navigating
      const browserState = {
        url: navigateUrl,
        inputUrl: navigateUrl
      };
      
      sessionStorage.setItem(`internetexplorer_state_${id}`, JSON.stringify(browserState));
    }
  };

  const handleBack = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.history.back();
    }
  };

  const handleForward = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.history.forward();
    }
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    // Update the URL state
    setUrl(bookmark.url);
    
    // Update the iframe src
    if (iframeRef.current) {
      iframeRef.current.src = bookmark.url;
    }
    
    // Save state immediately when clicking a bookmark
    const browserState = {
      url: bookmark.url,
      inputUrl: bookmark.url
    };
    
    sessionStorage.setItem(`internetexplorer_state_${id}`, JSON.stringify(browserState));
  };

  return (
    <Window
      id={id}
      title="Internet Explorer"
      onClose={onClose}
      initialPosition={{ x: 150, y: 50 }}
      initialSize={{ width: 1024, height: 720 }}
    >
      <div className="h-full flex flex-col">
        {/* Navigation Bar */}
        <div className="flex flex-col border-b border-gray-300">
          {/* URL Bar */}
          <div className="flex items-center gap-2 p-2 bg-[#f0f0f0]">
            <button
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
            >
              ←
            </button>
            <button
              onClick={handleForward}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
            >
              →
            </button>
            <form onSubmit={handleNavigate} className="flex-1 flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded outline-none font-chicago text-sm"
              />
              <button
                type="submit"
                className="px-4 py-1 border border-gray-300 rounded hover:bg-gray-100 font-chicago text-sm"
              >
                Go
              </button>
            </form>
          </div>

          {/* Bookmarks Bar */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-gray-200">
            {bookmarks.map((bookmark, index) => (
              <button
                key={index}
                onClick={() => handleBookmarkClick(bookmark)}
                className="flex items-center gap-1.5 text-sm hover:text-blue-600"
              >
                <span className="text-base">{bookmark.icon}</span>
                <span className="font-chicago text-xs">{bookmark.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Browser Content */}
        <div className="flex-1">
          <iframe
            ref={iframeRef}
            src={defaultUrl}
            key={`browser-frame-${id}`}
            className="w-full h-full"
            style={{ display: 'block', border: 'none' }}
          />
        </div>

        {/* Status Bar */}
        <div className="h-5 border-t border-gray-300 bg-[#f0f0f0]" />
      </div>
    </Window>
  );
} 