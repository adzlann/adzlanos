import { Window } from './Window';
import { useState } from 'react';
import { TextEditWindow } from './TextEditWindow';

interface File {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  type: string;
  size: string;
}

interface SavedDocument {
  id: string;
  name: string;
  content: string;
  lastModified: string;
}

interface DocumentsWindowProps {
  onClose: () => void;
}

export function DocumentsWindow({ onClose }: DocumentsWindowProps) {
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

  // Load saved documents from local storage
  const getSavedDocuments = () => {
    const saved = localStorage.getItem('textEditDocuments');
    if (!saved) return [];
    
    const documents = JSON.parse(saved) as SavedDocument[];
    return documents.map((doc: SavedDocument) => ({
      ...doc,
      type: 'TextEdit Document',
      size: `${Math.ceil(doc.content.length / 1024)} KB`
    }));
  };

  const handleDoubleClick = (file: File) => {
    setSelectedDocument(file);
    setShowTextEdit(true);
  };

  const handleDeleteDocument = (file: File) => {
    if (window.confirm(`Are you sure you want to move "${file.name}" to Trash?`)) {
      // Get current documents and trashed documents
      const documents = getSavedDocuments();
      const trashedDocs = JSON.parse(localStorage.getItem('trashedDocuments') || '[]');

      // Remove from documents
      const updatedDocuments = documents.filter((doc: File) => doc.id !== file.id);
      localStorage.setItem('textEditDocuments', JSON.stringify(updatedDocuments));

      // Add to trash with deletion timestamp
      const trashedDoc = {
        ...file,
        deletedAt: new Date().toISOString()
      };
      trashedDocs.push(trashedDoc);
      localStorage.setItem('trashedDocuments', JSON.stringify(trashedDocs));

      // Force a re-render
      setSelectedDocument(null);
    }
  };

  const documents = getSavedDocuments();

  return (
    <>
      <Window 
        title="Documents" 
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
              <div className="border border-gray-400 p-1 text-sm">/Documents</div>
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
            {documents.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-100 cursor-pointer select-none group"
                onDoubleClick={() => handleDoubleClick(file)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <span className="font-chicago text-sm">{file.name}</span>
                </div>
                <div className="font-chicago text-sm self-center">{file.type}</div>
                <div className="font-chicago text-sm self-center">{file.size}</div>
                <div className="flex items-center justify-between">
                  <span className="font-chicago text-sm self-center">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(file);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sm font-chicago text-red-600 hover:bg-red-100 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="p-2 border-t border-gray-400 flex justify-between text-sm font-chicago">
            <span>{documents.length} items</span>
            <span>10 MB available</span>
          </div>
        </div>
      </Window>

      {showTextEdit && selectedDocument && (
        <TextEditWindow
          onClose={() => {
            setShowTextEdit(false);
            setSelectedDocument(null);
          }}
          initialContent={selectedDocument.content}
          documentName={selectedDocument.name}
        />
      )}
    </>
  );
} 