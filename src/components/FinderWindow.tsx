import { Window } from './Window';
import { useState } from 'react';
import { ApplicationsWindow } from './ApplicationsWindow';
import { DocumentsWindow } from './DocumentsWindow';
import { TrashWindow } from './TrashWindow';

interface File {
  id: string;
  name: string;
  icon: string;
  type: 'file' | 'folder';
  isSystem?: boolean;
  size?: string;
  modified?: string;
}

interface FinderWindowProps {
  onClose: () => void;
  id: string;
}

const defaultFiles: File[] = [
  {
    id: 'applications',
    name: 'Applications',
    icon: '📁',
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: '📁',
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: '🗑️',
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  }
];

export function FinderWindow({ onClose, id }: FinderWindowProps) {
  const [showApplications, setShowApplications] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  const handleDoubleClick = (file: File) => {
    if (file.id === 'applications') {
      setShowApplications(true);
    } else if (file.id === 'documents') {
      setShowDocuments(true);
    } else if (file.id === 'trash') {
      setShowTrash(true);
    } else {
      console.log(`Opening ${file.name}`);
    }
  };

  // Update trash icon based on content
  const getTrashIcon = () => {
    const trashedDocs = localStorage.getItem('trashedDocuments');
    const hasItems = trashedDocs && JSON.parse(trashedDocs).length > 0;
    return hasItems ? '🗑️' : '🗑️';
  };

  const files = defaultFiles.map(file => 
    file.id === 'trash' ? { ...file, icon: getTrashIcon() } : file
  );

  return (
    <>
      <Window 
        id={id}
        title="Macintosh HD" 
        onClose={onClose}
        initialPosition={{ x: 100, y: 50 }}
        initialSize={{ width: 600, height: 400 }}
      >
        <div className="h-full flex flex-col bg-white">
          {/* Navigation Bar */}
          <div className="flex items-center border-b border-gray-400 p-1 gap-2">
            <button className="p-1 border border-gray-400 rounded">←</button>
            <button className="p-1 border border-gray-400 rounded">→</button>
            <button className="p-1 border border-gray-400 rounded">↑</button>
            <div className="flex-1 ml-2">
              <div className="border border-gray-400 p-1 text-sm">/</div>
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
            {files.map((file) => (
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
            <span>{files.length} items</span>
            <span>10 MB available</span>
          </div>
        </div>
      </Window>

      {showApplications && (
        <ApplicationsWindow 
          id={`${id}-applications`}
          onClose={() => setShowApplications(false)} 
        />
      )}

      {showDocuments && (
        <DocumentsWindow onClose={() => setShowDocuments(false)} />
      )}

      {showTrash && (
        <TrashWindow onClose={() => setShowTrash(false)} />
      )}
    </>
  );
} 