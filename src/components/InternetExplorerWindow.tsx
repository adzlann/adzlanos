import { Window } from './Window';
import { useState, useRef } from 'react';

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

  const bookmarks: Bookmark[] = [
    { name: 'SarangResepi', url: 'https://sarangresepi.vercel.app/', icon: '🍳' },
    { name: 'NewJeans', url: 'https://newjeans.kr', icon: '👖' },
    { name: 'HyperCard', url: 'https://hcsimulator.com', icon: '💳' },
  ];

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (iframeRef.current) {
      iframeRef.current.src = url;
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
    setUrl(bookmark.url);
    if (iframeRef.current) {
      iframeRef.current.src = bookmark.url;
    }
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