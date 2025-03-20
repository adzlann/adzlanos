import { Window } from './Window';
import { useState, useEffect } from 'react';
import applicationsIcon from '../assets/applications-folder.png';
import documentsIcon from '../assets/folder-documents.png';
import trashIcon from '../assets/trash.png';
import macintoshIcon from '../assets/macintosh.png';
import textEditIcon from '../assets/TextEdit.png';
import mineIcon from '../assets/mine.png';
import explorerIcon from '../assets/explorer.png';
import { useWindow } from '../contexts/WindowContext';
import { TextEditWindow } from './TextEditWindow';

interface File {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  type: 'file' | 'folder' | 'application' | 'document' | 'trashed';
  isSystem?: boolean;
  size?: string;
  modified?: string;
  content?: string;
  deletedAt?: string;
}

interface SavedDocument {
  id: string;
  name: string;
  content: string;
  lastModified: string;
  deletedAt?: string;
}

interface FinderWindowProps {
  onClose: () => void;
  id: string;
}

const rootFiles: File[] = [
  {
    id: 'applications',
    name: 'Applications',
    icon: <img src={applicationsIcon} alt="Applications" className="w-6 h-6" />,
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: <img src={documentsIcon} alt="Documents" className="w-6 h-6" />,
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: <img src={trashIcon} alt="Trash" className="w-6 h-6" />,
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  },
  {
    id: 'macintosh',
    name: 'Macintosh HD',
    icon: <img src={macintoshIcon} alt="Macintosh HD" className="w-6 h-6" />,
    type: 'folder',
    isSystem: true,
    size: '--',
    modified: '--'
  }
];

const applicationFiles: File[] = [
  {
    id: 'textedit',
    name: 'TextEdit',
    icon: <img src={textEditIcon} alt="TextEdit" className="w-6 h-6" />,
    type: 'application',
    size: '--',
    modified: '--'
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: <img src={mineIcon} alt="Minesweeper" className="w-6 h-6" />,
    type: 'application',
    size: '--',
    modified: '--'
  },
  {
    id: 'internetexplorer',
    name: 'Internet Explorer',
    icon: <img src={explorerIcon} alt="Internet Explorer" className="w-6 h-6" />,
    type: 'application',
    size: '--',
    modified: '--'
  }
];

export function FinderWindow({ onClose, id }: FinderWindowProps) {
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['root']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [trashFiles, setTrashFiles] = useState<File[]>([]);
  const [showTextEdit, setShowTextEdit] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const { bringToFront, isWindowMinimized, unminimizeWindow, isWindowOpen, reopenWindow } = useWindow();

  // Load files based on current folder
  useEffect(() => {
    if (currentFolder === 'documents') {
      loadDocuments();
    } else if (currentFolder === 'trash') {
      loadTrashFiles();
    }
  }, [currentFolder]);

  // Load saved documents from local storage
  const loadDocuments = () => {
    const saved = localStorage.getItem('textEditDocuments');
    if (!saved) {
      setDocumentFiles([]);
      return;
    }
    
    try {
      const documents = JSON.parse(saved) as SavedDocument[];
      const formattedDocs = documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        icon: <img src={textEditIcon} alt="TextEdit Document" className="w-6 h-6" />,
        type: 'document' as const,
        size: `${Math.ceil(doc.content.length / 1024)} KB`,
        modified: new Date(doc.lastModified).toLocaleDateString(),
        content: doc.content
      }));
      setDocumentFiles(formattedDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentFiles([]);
    }
  };

  // Load trashed files from local storage
  const loadTrashFiles = () => {
    const saved = localStorage.getItem('trashedDocuments');
    if (!saved) {
      setTrashFiles([]);
      return;
    }
    
    try {
      const trashedDocs = JSON.parse(saved) as SavedDocument[];
      const formattedDocs = trashedDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        icon: <img src={textEditIcon} alt="TextEdit Document" className="w-6 h-6" />,
        type: 'trashed' as const,
        size: `${Math.ceil(doc.content.length / 1024)} KB`,
        modified: new Date(doc.lastModified).toLocaleDateString(),
        content: doc.content,
        deletedAt: doc.deletedAt
      }));
      setTrashFiles(formattedDocs);
    } catch (error) {
      console.error('Error loading trash files:', error);
      setTrashFiles([]);
    }
  };

  // Get files based on current folder
  const getCurrentFiles = (): File[] => {
    switch (currentFolder) {
      case 'applications':
        return applicationFiles;
      case 'documents':
        return documentFiles;
      case 'trash':
        return trashFiles;
      default:
        return rootFiles;
    }
  };

  // Get current folder path for display
  const getCurrentPath = (): string => {
    switch (currentFolder) {
      case 'applications':
        return '/Applications';
      case 'documents':
        return '/Documents';
      case 'trash':
        return '/Trash';
      default:
        return '/';
    }
  };

  // Handle navigation back
  const handleNavigateBack = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentFolder(navigationHistory[newIndex]);
    }
  };

  // Handle navigation forward
  const handleNavigateForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentFolder(navigationHistory[newIndex]);
    }
  };

  // Handle navigation up (to parent folder)
  const handleNavigateUp = () => {
    if (currentFolder !== 'root') {
      setCurrentFolder('root');
      // Add to history
      const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), 'root'];
      setNavigationHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    }
  };

  const handleDoubleClick = (file: File) => {
    if (file.type === 'folder') {
      // Navigate to folder
      setCurrentFolder(file.id);
      // Add to navigation history (truncate any forward history)
      const newHistory = [...navigationHistory.slice(0, currentHistoryIndex + 1), file.id];
      setNavigationHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
    } else if (file.type === 'application') {
      // Launch application
      launchApplication(file.id);
    } else if (file.type === 'document' || file.type === 'trashed') {
      // Open document in TextEdit
      setSelectedDocument(file);
      setShowTextEdit(true);
    } else {
      console.log(`Opening ${file.name}`);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = (file: File, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent document opening
    
    if (window.confirm(`Are you sure you want to move "${file.name}" to Trash?`)) {
      // Get current documents and trashed documents
      const saved = localStorage.getItem('textEditDocuments');
      const documents = saved ? JSON.parse(saved) : [];
      const trashedDocs = JSON.parse(localStorage.getItem('trashedDocuments') || '[]');

      // Remove from documents
      const updatedDocuments = documents.filter((doc: SavedDocument) => doc.id !== file.id);
      localStorage.setItem('textEditDocuments', JSON.stringify(updatedDocuments));

      // Add to trash with deletion timestamp
      const docToTrash = documents.find((doc: SavedDocument) => doc.id === file.id);
      if (docToTrash) {
        const trashedDoc = {
          ...docToTrash,
          deletedAt: new Date().toISOString()
        };
        trashedDocs.push(trashedDoc);
        localStorage.setItem('trashedDocuments', JSON.stringify(trashedDocs));
      }

      // Reload documents to update the UI
      loadDocuments();
    }
  };

  // Handle document restoration from trash
  const handleRestoreDocument = (file: File, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent document opening
    
    if (window.confirm(`Restore "${file.name}" to Documents?`)) {
      // Get current documents and trashed documents
      const saved = localStorage.getItem('trashedDocuments');
      const trashedDocs = saved ? JSON.parse(saved) : [];
      const documents = JSON.parse(localStorage.getItem('textEditDocuments') || '[]');

      // Remove from trash
      const updatedTrash = trashedDocs.filter((doc: SavedDocument) => doc.id !== file.id);
      localStorage.setItem('trashedDocuments', JSON.stringify(updatedTrash));

      // Add back to documents without the deletedAt property
      const docToRestore = trashedDocs.find((doc: SavedDocument) => doc.id === file.id);
      if (docToRestore) {
        // Make a copy without the deletedAt property
        const { deletedAt, ...restoredDoc } = docToRestore;
        // Log the removal of deletedAt for debugging
        console.log(`Removed deletedAt timestamp: ${deletedAt}`);
        documents.push(restoredDoc);
        localStorage.setItem('textEditDocuments', JSON.stringify(documents));
      }

      // Reload trash files to update the UI
      loadTrashFiles();
    }
  };

  // Permanently delete a document from trash
  const handlePermanentDelete = (file: File, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent document opening
    
    if (window.confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) {
      // Get trashed documents
      const saved = localStorage.getItem('trashedDocuments');
      const trashedDocs = saved ? JSON.parse(saved) : [];

      // Remove from trash
      const updatedTrash = trashedDocs.filter((doc: SavedDocument) => doc.id !== file.id);
      localStorage.setItem('trashedDocuments', JSON.stringify(updatedTrash));

      // Reload trash files to update the UI
      loadTrashFiles();
    }
  };

  // Empty trash function
  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently delete all items in the Trash? This cannot be undone.')) {
      localStorage.setItem('trashedDocuments', '[]');
      loadTrashFiles();
    }
  };

  // Launch application function
  const launchApplication = (appId: string) => {
    switch (appId) {
      case 'textedit':
        if (isWindowMinimized('textedit')) {
          unminimizeWindow('textedit');
        } else if (!isWindowOpen('textedit')) {
          // Clear any previous session storage to start fresh
          sessionStorage.removeItem('textEdit_temp_textedit');
          reopenWindow('textedit');
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
          bringToFront('internetexplorer');
        } else {
          bringToFront('internetexplorer');
        }
        break;
    }
  };

  // Update trash icon based on content
  const getTrashIcon = () => {
    return <img src={trashIcon} alt="Trash" className="w-6 h-6" />;
  };

  const files = getCurrentFiles().map(file => 
    file.id === 'trash' ? { ...file, icon: getTrashIcon() } : file
  );

  return (
    <>
      <Window 
        id={id}
        title={currentFolder === 'root' ? "Macintosh HD" : currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)} 
        onClose={onClose}
        initialPosition={{ x: 100, y: 50 }}
        initialSize={{ width: 600, height: 400 }}
      >
        <div className="h-full flex flex-col bg-white">
          {/* Navigation Bar */}
          <div className="flex items-center border-b border-gray-400 p-1 gap-2">
            <button 
              className="p-1 border border-gray-400 rounded" 
              onClick={handleNavigateBack}
              disabled={currentHistoryIndex <= 0}
            >
              ←
            </button>
            <button 
              className="p-1 border border-gray-400 rounded"
              onClick={handleNavigateForward}
              disabled={currentHistoryIndex >= navigationHistory.length - 1}
            >
              →
            </button>
            <button 
              className="p-1 border border-gray-400 rounded"
              onClick={handleNavigateUp}
              disabled={currentFolder === 'root'}
            >
              ↑
            </button>
            <div className="flex-1 ml-2">
              <div className="border border-gray-400 p-1 text-sm">{getCurrentPath()}</div>
            </div>
            {currentFolder === 'trash' && trashFiles.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-2 py-1 text-sm font-chicago text-red-600 hover:bg-red-100 rounded"
              >
                Empty Trash
              </button>
            )}
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
                className="grid grid-cols-4 gap-4 p-2 hover:bg-gray-100 cursor-pointer select-none group"
                onDoubleClick={() => handleDoubleClick(file)}
              >
                <div className="flex items-center gap-2">
                  {typeof file.icon === 'string' ? (
                    <span className="text-xl">{file.icon}</span>
                  ) : (
                    file.icon
                  )}
                  <span className="font-chicago text-sm">{file.name}</span>
                </div>
                <div className="font-chicago text-sm self-center">
                  {file.type === 'trashed' ? 'TextEdit Document' : file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                </div>
                <div className="font-chicago text-sm self-center">{file.size}</div>
                <div className="flex items-center justify-between">
                  <span className="font-chicago text-sm self-center">{file.modified}</span>
                  {file.type === 'document' && (
                    <button
                      onClick={(e) => handleDeleteDocument(file, e)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sm font-chicago text-red-600 hover:bg-red-100 rounded"
                    >
                      Delete
                    </button>
                  )}
                  {file.type === 'trashed' && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={(e) => handleRestoreDocument(file, e)}
                        className="px-2 py-1 text-sm font-chicago text-blue-600 hover:bg-blue-100 rounded"
                      >
                        Restore
                      </button>
                      <button
                        onClick={(e) => handlePermanentDelete(file, e)}
                        className="px-2 py-1 text-sm font-chicago text-red-600 hover:bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
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

      {/* TextEdit Window for opening documents */}
      {showTextEdit && selectedDocument && (
        <TextEditWindow
          id={`${id}-document-${selectedDocument.id}`}
          onClose={() => {
            setShowTextEdit(false);
            setSelectedDocument(null);
            // Reload documents or trash in case changes were made
            if (currentFolder === 'documents') {
              loadDocuments();
            } else if (currentFolder === 'trash') {
              loadTrashFiles();
            }
          }}
          initialContent={selectedDocument.content}
          documentName={selectedDocument.name}
        />
      )}
    </>
  );
} 