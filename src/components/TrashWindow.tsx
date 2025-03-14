import { Window } from './Window';
import { useState } from 'react';

interface File {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  type: string;
  size: string;
  deletedAt: string;
}

interface TrashWindowProps {
  onClose: () => void;
}

export function TrashWindow({ onClose }: TrashWindowProps) {
  const [, forceUpdate] = useState({});

  // Load deleted files from local storage
  const getDeletedFiles = () => {
    const saved = localStorage.getItem('trashedDocuments');
    if (!saved) return [];
    return JSON.parse(saved) as File[];
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all items in the Trash?')) {
      localStorage.setItem('trashedDocuments', '[]');
      forceUpdate({});
    }
  };

  const handleRestoreFile = (file: File) => {
    // Get current documents and trashed documents
    const documents = JSON.parse(localStorage.getItem('textEditDocuments') || '[]');
    const trashedDocs = getDeletedFiles();

    // Remove file from trash
    const updatedTrash = trashedDocs.filter(doc => doc.id !== file.id);
    localStorage.setItem('trashedDocuments', JSON.stringify(updatedTrash));

    // Add file back to documents
    const restoredDoc = {
      id: file.id,
      name: file.name,
      content: file.content,
      lastModified: new Date().toISOString()
    };
    documents.push(restoredDoc);
    localStorage.setItem('textEditDocuments', JSON.stringify(documents));

    // Force re-render
    forceUpdate({});
  };

  const deletedFiles = getDeletedFiles();

  return (
    <Window 
      title="Trash" 
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
            <div className="border border-gray-400 p-1 text-sm">/Trash</div>
          </div>
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-1 border border-gray-400 rounded font-chicago text-sm hover:bg-gray-100"
            disabled={deletedFiles.length === 0}
          >
            Empty Trash
          </button>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-4 gap-4 p-2 border-b border-gray-400 bg-gray-100 text-sm">
          <div className="font-chicago">Name</div>
          <div className="font-chicago">Type</div>
          <div className="font-chicago">Size</div>
          <div className="font-chicago">Deleted</div>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-auto">
          {deletedFiles.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-100 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <span className="font-chicago text-sm">{file.name}</span>
              </div>
              <div className="font-chicago text-sm self-center">{file.type}</div>
              <div className="font-chicago text-sm self-center">{file.size}</div>
              <div className="flex items-center justify-between">
                <span className="font-chicago text-sm self-center">
                  {new Date(file.deletedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRestoreFile(file)}
                  className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sm font-chicago text-blue-600 hover:bg-blue-100 rounded"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status Bar */}
        <div className="p-2 border-t border-gray-400 flex justify-between text-sm font-chicago">
          <span>{deletedFiles.length} items</span>
          <span>10 MB available</span>
        </div>
      </div>
    </Window>
  );
} 