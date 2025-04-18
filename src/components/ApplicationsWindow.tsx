import { Window } from './Window';
import { useState } from 'react';
import { TextEditWindow } from './TextEditWindow';
import { MinesweeperWindow } from './MinesweeperWindow';
import { InternetExplorerWindow } from './InternetExplorerWindow';
import { useWindow } from '../contexts/WindowContext';
import textEditIcon from '../assets/TextEdit.png';
import mineIcon from '../assets/mine.png';
import explorerIcon from '../assets/explorer.png';

interface File {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  type: string;
  size: string;
  modified: string;
}

interface ApplicationsWindowProps {
  onClose: () => void;
  id: string;
}

const applicationFiles: File[] = [
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: <img src={textEditIcon} alt="TextEdit" className="w-6 h-6" />,
    type: 'Application',
    size: '--',
    modified: '--'
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: <img src={mineIcon} alt="Minesweeper" className="w-6 h-6" />,
    type: 'Application',
    size: '--',
    modified: '--'
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: <img src={explorerIcon} alt="Internet Explorer" className="w-6 h-6" />,
    type: 'Application',
    size: '--',
    modified: '--'
  }
];

export function ApplicationsWindow({ onClose, id }: ApplicationsWindowProps) {
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [showInternetExplorer, setShowInternetExplorer] = useState(false);
  const { bringToFront, isWindowMinimized, unminimizeWindow, minimizeWindow, isWindowOpen } = useWindow();

  const handleDoubleClick = (file: File) => {
    switch (file.id) {
      case 'textedit':
        if (isWindowMinimized('textedit')) {
          // If window is minimized, unminimize it
          unminimizeWindow('textedit');
        } else if (isWindowOpen('textedit')) {
          // If window is open but not shown in this view, bring it to front
          bringToFront('textedit');
        } else {
          // Otherwise show a new window
          setShowTextEdit(true);
          bringToFront('textedit');
        }
        break;
      case 'minesweeper':
        if (isWindowMinimized('minesweeper')) {
          // If window is minimized, unminimize it
          unminimizeWindow('minesweeper');
        } else if (isWindowOpen('minesweeper')) {
          // If window is open but not shown in this view, bring it to front
          bringToFront('minesweeper');
        } else {
          // Clear session storage when opening a fresh minesweeper window
          sessionStorage.removeItem('minesweeper_state_minesweeper');
          // Otherwise show a new window
          setShowMinesweeper(true);
          bringToFront('minesweeper');
        }
        break;
      case 'internetexplorer':
        if (isWindowMinimized('internetexplorer')) {
          // If window is minimized, unminimize it
          unminimizeWindow('internetexplorer');
        } else if (isWindowOpen('internetexplorer')) {
          // If window is open but not shown in this view, bring it to front
          bringToFront('internetexplorer');
        } else {
          // Clear session storage when opening a fresh Internet Explorer window
          sessionStorage.removeItem('internetexplorer_state_internetexplorer');
          // Otherwise show a new window
          setShowInternetExplorer(true);
          bringToFront('internetexplorer');
        }
        break;
    }
  };

  return (
    <>
      <Window 
        id={id}
        title="Applications" 
        onClose={onClose}
        initialPosition={{ x: 150, y: 70 }}
        initialSize={{ width: 600, height: 400 }}
      >
        <div className="h-full flex flex-col bg-white">
          {/* Navigation Bar */}
          <div className="flex items-center border-b border-gray-400 p-1 gap-2">
            <button className="p-1 border border-gray-400 rounded">←</button>
            <button className="p-1 border border-gray-400 rounded">→</button>
            <button className="p-1 border border-gray-400 rounded">↑</button>
            <div className="flex-1 ml-2">
              <div className="border border-gray-400 p-1 text-sm">/Applications</div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-4 gap-4 p-2 border-b border-gray-400 bg-gray-100 text-sm">
            <div className="font-chicago">Name</div>
            <div className="font-chicago">Type</div>
            <div className="font-chicago">Size</div>
            <div className="font-chicago">Modified</div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-auto">
            {applicationFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-100 cursor-pointer select-none"
                onDoubleClick={() => handleDoubleClick(file)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{file.icon}</span>
                  <span className="font-chicago text-sm">{file.name}</span>
                </div>
                <div className="font-chicago text-sm self-center">{file.type}</div>
                <div className="font-chicago text-sm self-center">{file.size}</div>
                <div className="font-chicago text-sm self-center">{file.modified}</div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="p-2 border-t border-gray-400 flex justify-between text-sm font-chicago">
            <span>{applicationFiles.length} items</span>
            <span>10 MB available</span>
          </div>
        </div>
      </Window>

      {/* Application Windows */}
      {showTextEdit && (
        <TextEditWindow 
          id="textedit"
          onClose={() => setShowTextEdit(false)}
        />
      )}
      {showMinesweeper && (
        <MinesweeperWindow 
          id="minesweeper"
          onClose={() => {
            // Do not actually close here, just hide from this view
            setShowMinesweeper(false);
            // We minimize instead of closing to preserve state
            minimizeWindow('minesweeper');
          }}
        />
      )}
      {showInternetExplorer && (
        <InternetExplorerWindow 
          id="internetexplorer"
          onClose={() => {
            // Do not actually close here, just hide from this view
            setShowInternetExplorer(false);
            // We minimize instead of closing to preserve state
            minimizeWindow('internetexplorer');
          }}
        />
      )}
    </>
  );
} 