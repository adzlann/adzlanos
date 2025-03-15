import { Window } from './Window';
import { useState } from 'react';
import { TextEditWindow } from './TextEditWindow';
import { MinesweeperWindow } from './MinesweeperWindow';
import { InternetExplorerWindow } from './InternetExplorerWindow';

interface File {
  id: string;
  name: string;
  icon: string;
  type: string;
  size: string;
  modified: string;
}

interface ApplicationsWindowProps {
  onClose: () => void;
}

const applicationFiles: File[] = [
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📝',
    type: 'Application',
    size: '--',
    modified: '--'
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💣',
    type: 'Application',
    size: '--',
    modified: '--'
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: '🌐',
    type: 'Application',
    size: '--',
    modified: '--'
  }
];

export function ApplicationsWindow({ onClose }: ApplicationsWindowProps) {
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [showInternetExplorer, setShowInternetExplorer] = useState(false);

  const handleDoubleClick = (file: File) => {
    switch (file.id) {
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
    <>
      <Window 
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

      {showTextEdit && (
        <TextEditWindow onClose={() => setShowTextEdit(false)} />
      )}

      {showMinesweeper && (
        <MinesweeperWindow onClose={() => setShowMinesweeper(false)} />
      )}

      {showInternetExplorer && (
        <InternetExplorerWindow onClose={() => setShowInternetExplorer(false)} />
      )}
    </>
  );
} 