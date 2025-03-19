import { Window } from './Window';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useWindow } from '../contexts/WindowContext';

interface TextEditWindowProps {
  onClose: () => void;
  id: string;
  initialContent?: string;
  documentName?: string;
}

interface SavedDocument {
  id: string;
  name: string;
  content: string;
  lastModified: string;
}

const fonts = [
  { name: 'Chicago', value: 'font-chicago' },
  { name: 'Monaco', value: 'font-monaco' },
  { name: 'Geneva', value: 'font-geneva' },
  { name: 'Times', value: 'font-times' }
];

export function TextEditWindow({ onClose, id, initialContent = '', documentName }: TextEditWindowProps) {
  const [fileName, setFileName] = useState(documentName || 'Untitled');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    bulletList: false,
    numberList: false
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const { isWindowMinimized } = useWindow();

  // Load initial content
  useEffect(() => {
    if (editorRef.current) {
      // Start with fresh content when explicitly provided
      // Otherwise, start with empty content
      editorRef.current.innerHTML = initialContent || '';
      setCurrentContent(initialContent || '');
      
      // Enable editing commands
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [initialContent]);

  // Save content to state and session storage when it changes
  useEffect(() => {
    const handleInput = () => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        setCurrentContent(content);
        setIsEdited(true);
        
        // Save to session storage immediately when content changes
        const tempEditorState = {
          content,
          fileName,
          isEdited: true
        };
        sessionStorage.setItem(`textEdit_temp_${id}`, JSON.stringify(tempEditorState));
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', handleInput);
      
      // Also attach a blur event to save content when focus is lost
      editor.addEventListener('blur', handleInput);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('blur', handleInput);
      }
    };
  }, [id, fileName]);

  // Monitor window state changes (minimize/unminimize)
  useEffect(() => {
    // We need to track minimize state changes
    let minimizeState = isWindowMinimized(id);
    let lastContentSaved = currentContent;
    
    // Set up an interval to check for state changes
    const intervalId = setInterval(() => {
      const newMinimizeState = isWindowMinimized(id);
      
      // If state changed (window was minimized or unminimized)
      if (minimizeState !== newMinimizeState) {
        minimizeState = newMinimizeState;
        
        if (minimizeState) {
          // Window was just minimized - save current content
          if (editorRef.current) {
            const currentText = editorRef.current.innerHTML;
            lastContentSaved = currentText;
            
            // Save to state and session storage
            setCurrentContent(currentText);
            const tempEditorState = {
              content: currentText,
              fileName,
              isEdited
            };
            sessionStorage.setItem(`textEdit_temp_${id}`, JSON.stringify(tempEditorState));
          }
        } else {
          // Window was just unminimized - check if we need to restore
          if (editorRef.current && lastContentSaved) {
            // Make sure editor content matches what we saved
            if (editorRef.current.innerHTML !== lastContentSaved) {
              editorRef.current.innerHTML = lastContentSaved;
              setCurrentContent(lastContentSaved);
            }
          }
        }
      }
      
      // Also check if content has changed since last save
      if (editorRef.current && !minimizeState) {
        const currentText = editorRef.current.innerHTML;
        if (currentText !== lastContentSaved) {
          lastContentSaved = currentText;
          
          // Save to session storage periodically when content changes
          const tempEditorState = {
            content: currentText,
            fileName,
            isEdited: true
          };
          sessionStorage.setItem(`textEdit_temp_${id}`, JSON.stringify(tempEditorState));
        }
      }
    }, 100); // Check frequently
    
    return () => clearInterval(intervalId);
  }, [id, fileName, isEdited, isWindowMinimized, currentContent]);

  // Check active formats when selection changes
  useEffect(() => {
    const checkFormats = () => {
      if (document.queryCommandState) {
        const formats = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          alignLeft: document.queryCommandState('justifyLeft'),
          alignCenter: document.queryCommandState('justifyCenter'),
          alignRight: document.queryCommandState('justifyRight'),
          bulletList: document.queryCommandState('insertUnorderedList'),
          numberList: document.queryCommandState('insertOrderedList')
        };
        setActiveFormats(formats);
      }
    };

    document.addEventListener('selectionchange', checkFormats);
    return () => document.removeEventListener('selectionchange', checkFormats);
  }, []);

  // Format functions
  const formatText = (command: string, value?: string) => {
    // Ensure we have focus and a selection
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current!);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    // Execute the command
    document.execCommand(command, false, value);
    
    // For lists, ensure proper structure
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const list = editorRef.current?.querySelector(command === 'insertUnorderedList' ? 'ul' : 'ol');
      if (list && !list.querySelector('li')) {
        const li = document.createElement('li');
        li.textContent = '\u200B';
        list.appendChild(li);
      }
    }

    setIsEdited(true);
    
    // Update active formats
    if (document.queryCommandState) {
      const newState = document.queryCommandState(command);
      setActiveFormats(prev => ({
        ...prev,
        [command === 'insertUnorderedList' ? 'bulletList' : 
          command === 'insertOrderedList' ? 'numberList' : command]: newState
      }));
    }
  };

  const handleFontChange = (font: typeof fonts[0]) => {
    setSelectedFont(font);
    if (editorRef.current) {
      // Remove all font classes
      fonts.forEach(f => {
        editorRef.current?.classList.remove(f.value);
      });
      // Add selected font class
      editorRef.current.classList.add(font.value);
    }
    setShowFontDropdown(false);
  };

  // Load saved documents from local storage
  const getSavedDocuments = useCallback((): SavedDocument[] => {
    const saved = localStorage.getItem('textEditDocuments');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Save document to local storage
  const saveDocument = useCallback((name: string) => {
    // Always get the most current content from the editor
    const content = editorRef.current ? editorRef.current.innerHTML : currentContent || '';
    
    // Ensure state is updated
    setCurrentContent(content);
    
    const documents = getSavedDocuments();
    const now = new Date().toISOString();
    const documentId = `doc_${Date.now()}`;

    // Check if document with this name already exists
    const existingIndex = documents.findIndex(doc => doc.name === name);
    if (existingIndex >= 0) {
      documents[existingIndex] = {
        ...documents[existingIndex],
        content,
        lastModified: now
      };
    } else {
      documents.push({
        id: documentId,
        name,
        content,
        lastModified: now
      });
    }

    localStorage.setItem('textEditDocuments', JSON.stringify(documents));
    setFileName(name);
    setIsEdited(false);
    setShowSaveDialog(false);
    
    // Also update session storage with latest state
    const tempEditorState = {
      content,
      fileName: name,
      isEdited: false
    };
    sessionStorage.setItem(`textEdit_temp_${id}`, JSON.stringify(tempEditorState));
  }, [currentContent, id, getSavedDocuments, setCurrentContent, setFileName, setIsEdited, setShowSaveDialog]);

  const handleSave = useCallback(() => {
    // Capture the current content state before showing dialog
    if (editorRef.current) {
      setCurrentContent(editorRef.current.innerHTML);
    }
    
    if (fileName === 'Untitled') {
      setShowSaveDialog(true);
    } else {
      saveDocument(fileName);
    }
  }, [fileName, saveDocument]);

  // Direct close without confirmation dialog
  const handleDirectClose = useCallback(() => {
    // When closing directly, we want to clear any saved state
    // to start fresh when reopening
    
    // If content is edited but not saved, save to localStorage
    if (isEdited && fileName !== 'Untitled' && editorRef.current) {
      saveDocument(fileName);
    }
    
    // Clear session storage on close so reopening starts fresh
    sessionStorage.removeItem(`textEdit_temp_${id}`);
  }, [id, isEdited, fileName, saveDocument]);

  // Regular close with confirmation dialog
  const handleCloseRequest = useCallback(() => {
    // Save the current state to session storage as a final backup
    if (editorRef.current) {
      const currentText = editorRef.current.innerHTML;
      setCurrentContent(currentText);
      
      // For actual close (not minimize), prompt to save if needed
      if (isEdited) {
        if (window.confirm('Do you want to save changes?')) {
          handleSave();
        }
      }
      
      // Clear session storage on close so reopening starts fresh
      sessionStorage.removeItem(`textEdit_temp_${id}`);
      
      onClose();
    } else {
      // If no editor ref, just close
      sessionStorage.removeItem(`textEdit_temp_${id}`);
      onClose();
    }
  }, [id, isEdited, onClose, handleSave]);

  // This function will be used with useEffect to handle window events
  useEffect(() => {
    // Listen for close event from File menu
    const handleFileMenuClose = () => {
      if (id === 'textedit') {
        handleCloseRequest();
      }
    };
    
    // Listen for direct close event from File menu
    const handleFileMenuDirectClose = () => {
      if (id === 'textedit') {
        handleDirectClose();
      }
    };
    
    window.addEventListener('textedit-close-request', handleFileMenuClose);
    window.addEventListener('textedit-close-direct', handleFileMenuDirectClose);

    return () => {
      window.removeEventListener('textedit-close-request', handleFileMenuClose);
      window.removeEventListener('textedit-close-direct', handleFileMenuDirectClose);
    };
  }, [id, handleCloseRequest, handleDirectClose]);

  // Add debug CSS to editor with explicit list styling
  useEffect(() => {
    if (editorRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        [contenteditable] ul { 
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin: 0.5em 0 !important;
        }
        [contenteditable] ol { 
          list-style-type: decimal !important;
          padding-left: 24px !important;
          margin: 0.5em 0 !important;
        }
        [contenteditable] li { 
          display: list-item !important;
          margin: 0.25em 0 !important;
        }
      `;
      document.head.appendChild(style);
      return () => style.remove();
    }
  }, []);

  // Restore from temporary storage when component loads or is unminimized
  useEffect(() => {
    const restoreContent = () => {
      // Only restore state if this window was previously minimized, not closed
      // Desktop component will clear session storage on app launch if it was closed
      const savedState = sessionStorage.getItem(`textEdit_temp_${id}`);
      if (savedState && isWindowMinimized(id) === false) {
        try {
          const { content, fileName: savedFileName, isEdited: savedIsEdited } = JSON.parse(savedState);
          
          // Only restore if we have content
          if (content && editorRef.current) {
            // Always sync content with what's in session storage
            if (editorRef.current.innerHTML !== content) {
              editorRef.current.innerHTML = content;
              setCurrentContent(content);
            }
          }
          
          if (savedFileName && savedFileName !== fileName) {
            setFileName(savedFileName);
          }
          
          setIsEdited(savedIsEdited);
        } catch (error) {
          console.error('Error restoring text editor state:', error);
        }
      }
    };
    
    // Restore when component mounts if window is minimized
    if (isWindowMinimized(id) === false) {
      restoreContent();
    }
    
    // Also restore when window is unminimized
    const checkMinimizeState = () => {
      if (!isWindowMinimized(id)) {
        restoreContent();
      }
    };
    
    // Set up an interval to check for unminimize events
    const intervalId = setInterval(checkMinimizeState, 100);
    
    return () => clearInterval(intervalId);
  }, [id, fileName, isWindowMinimized]);

  // Focus the filename input when the save dialog appears
  useEffect(() => {
    if (showSaveDialog) {
      // Short delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        const input = document.querySelector(`#${id}-filename-input`) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select(); // Select all text for easy replacement
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [showSaveDialog, id]);

  // Monitor fileName state changes
  useEffect(() => {
    console.log('fileName state changed to:', fileName);
  }, [fileName]);

  return (
    <>
      <Window
        id={id}
        title={`${fileName}${isEdited ? ' •' : ''} - TextEdit`}
        initialPosition={{ x: 150, y: 50 }}
        initialSize={{ width: 500, height: 400 }}
      >
        <div className="h-full flex flex-col bg-white">
          {/* Toolbar */}
          <div className="border-b border-gray-400 flex items-center bg-[#DDDDDD] w-full h-10">
            {/* Text Style Buttons */}
            <div className="flex items-center h-full pl-2">
              <button
                onClick={() => formatText('bold')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 font-chicago text-sm ${
                  activeFormats.bold ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                B
              </button>
              <button
                onClick={() => formatText('italic')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 font-chicago text-sm italic ml-1 ${
                  activeFormats.italic ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                I
              </button>
              <button
                onClick={() => formatText('underline')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 font-chicago text-sm underline ml-1 ${
                  activeFormats.underline ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                U
              </button>
            </div>

            {/* Font Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowFontDropdown(!showFontDropdown)}
                className="flex items-center border border-gray-500 rounded px-2 py-1 bg-white hover:bg-gray-50 min-w-[100px]"
              >
                <span className="font-chicago text-sm">{selectedFont.name}</span>
                <span className="ml-2">▼</span>
              </button>
              {showFontDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-500 rounded shadow-lg z-50">
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      className={`w-full px-2 py-1 text-left hover:bg-gray-100 font-chicago text-sm ${font.value}`}
                      onClick={() => handleFontChange(font)}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alignment Buttons */}
            <div className="flex ml-2">
              <button
                onClick={() => formatText('justifyLeft')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 ${
                  activeFormats.alignLeft ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h12M3 18h15" />
                </svg>
              </button>
              <button
                onClick={() => formatText('justifyCenter')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 ${
                  activeFormats.alignCenter ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6h12M3 12h18M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => formatText('justifyRight')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 ${
                  activeFormats.alignRight ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M9 12h12M6 18h15" />
                </svg>
              </button>
            </div>

            {/* List Buttons */}
            <div className="flex ml-2">
              <button
                onClick={() => formatText('insertUnorderedList')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 ${
                  activeFormats.bulletList ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="4" cy="6" r="2" fill="currentColor" />
                  <path d="M8 6h13M8 12h13M8 18h13" />
                  <circle cx="4" cy="12" r="2" fill="currentColor" />
                  <circle cx="4" cy="18" r="2" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => formatText('insertOrderedList')}
                className={`w-8 h-8 border border-gray-500 rounded flex items-center justify-center hover:bg-gray-200 ${
                  activeFormats.numberList ? 'bg-gray-400 shadow-inner border-gray-600' : ''
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6h13M8 12h13M8 18h13" />
                  <text x="2" y="8" className="font-chicago text-xs">1</text>
                  <text x="2" y="14" className="font-chicago text-xs">2</text>
                  <text x="2" y="20" className="font-chicago text-xs">3</text>
                </svg>
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 h-8 border border-gray-500 rounded font-chicago text-sm hover:bg-gray-200 ml-auto mr-2"
            >
              Save
            </button>
          </div>

          {/* Editor Area */}
          <div 
            ref={editorRef}
            className={`flex-1 p-4 outline-none overflow-auto ${selectedFont.value}`}
            contentEditable
            onInput={() => setIsEdited(true)}
          />
        </div>
      </Window>

      {showSaveDialog && (
        <div 
          className="fixed inset-0 z-[9999] bg-transparent"
          onClick={(e) => {
            // This overlay prevents clicks outside the dialog
            e.stopPropagation();
          }}
        >
          <Window
            id={`${id}-save-dialog`}
            title="Save Document"
            initialPosition={{ x: 200, y: 150 }}
            initialSize={{ width: 300, height: 150 }}
            disableResize={true}
          >
            <div className="p-4 flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
              <form 
                className="flex flex-col h-full" 
                onSubmit={(e) => {
                  console.log('Form submitted');
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const filename = formData.get('filename') as string || fileName;
                  saveDocument(filename);
                }}
                onClick={(e) => {
                  console.log('Form clicked at', e.target);
                  e.stopPropagation();
                }}
              >
                <div className="mb-4">
                  <label className="block mb-1" htmlFor={`${id}-filename-input`}>Save as:</label>
                  <input 
                    id={`${id}-filename-input`}
                    name="filename"
                    type="text" 
                    defaultValue={fileName} 
                    onChange={(e) => {
                      console.log('Input onChange fired:', e.target.value);
                      setFileName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      console.log('Key pressed:', e.key);
                      e.stopPropagation();
                    }}
                    onFocus={(e) => {
                      console.log('Input focused');
                      // Select all text on focus
                      e.target.select();
                    }}
                    onBlur={() => console.log('Input lost focus')}
                    onClick={(e) => {
                      console.log('Input clicked');
                      e.stopPropagation();
                    }}
                    className="w-full p-1 border border-gray-500"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <div className="flex justify-end mt-auto">
                  <button 
                    type="button"
                    className="border border-gray-500 bg-[#DDDDDD] px-4 py-1 rounded mr-2 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSaveDialog(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="border border-gray-500 bg-[#DDDDDD] px-4 py-1 rounded hover:bg-gray-200"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </Window>
        </div>
      )}
    </>
  );
} 