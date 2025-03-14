import { Window } from './Window';
import { useState, useRef, useEffect } from 'react';

interface TextEditWindowProps {
  onClose: () => void;
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

export function TextEditWindow({ onClose, initialContent = '', documentName }: TextEditWindowProps) {
  const [fileName, setFileName] = useState(documentName || 'Untitled');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
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

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      // Enable editing commands
      document.execCommand('defaultParagraphSeparator', false, 'p');
      editorRef.current.focus();
    }
  }, [initialContent]);

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
  const getSavedDocuments = (): SavedDocument[] => {
    const saved = localStorage.getItem('textEditDocuments');
    return saved ? JSON.parse(saved) : [];
  };

  // Save document to local storage
  const saveDocument = (name: string) => {
    const documents = getSavedDocuments();
    const now = new Date().toISOString();
    const id = `doc_${Date.now()}`;
    const content = editorRef.current?.innerHTML || '';

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
        id,
        name,
        content,
        lastModified: now
      });
    }

    localStorage.setItem('textEditDocuments', JSON.stringify(documents));
    setFileName(name);
    setIsEdited(false);
    setShowSaveDialog(false);
  };

  const handleSave = () => {
    if (fileName === 'Untitled') {
      setShowSaveDialog(true);
    } else {
      saveDocument(fileName);
    }
  };

  const handleClose = () => {
    if (isEdited) {
      if (window.confirm('Do you want to save changes?')) {
        handleSave();
      }
    }
    onClose();
  };

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

  return (
    <>
      <Window
        title={`${fileName}${isEdited ? ' •' : ''} - TextEdit`}
        onClose={handleClose}
        initialPosition={{ x: 200, y: 100 }}
        initialSize={{ width: 600, height: 500 }}
      >
        <div className="h-full flex flex-col bg-white [&>*]:p-0 [&>*]:m-0">
          {/* Toolbar - Add negative margins to counter parent padding */}
          <div className="border-b border-gray-400 flex items-center bg-[#DDDDDD] w-full -mx-2 h-10">
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

          {/* Text Editor */}
          <div
            ref={editorRef}
            className={`flex-1 p-4 text-sm outline-none overflow-auto ${selectedFont.value}`}
            contentEditable
            onInput={() => setIsEdited(true)}
            style={{ 
              whiteSpace: 'pre-wrap',
              minHeight: '100%'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (activeFormats.bulletList || activeFormats.numberList)) {
                if (e.currentTarget.textContent?.trim() === '') {
                  e.preventDefault();
                  formatText(activeFormats.bulletList ? 'insertUnorderedList' : 'insertOrderedList');
                }
              }
            }}
          />
        </div>
      </Window>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Window
          title="Save Document"
          onClose={() => setShowSaveDialog(false)}
          initialPosition={{ x: 250, y: 150 }}
          initialSize={{ width: 300, height: 150 }}
        >
          <div className="p-4 bg-white flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-chicago text-sm">Document Name:</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="border border-gray-400 p-1 font-chicago text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-1 border border-gray-400 rounded font-chicago text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => saveDocument(fileName)}
                className="px-4 py-1 border border-gray-400 rounded font-chicago text-sm hover:bg-gray-100"
              >
                Save
              </button>
            </div>
          </div>
        </Window>
      )}
    </>
  );
} 