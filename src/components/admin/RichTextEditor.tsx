'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  minHeight?: string;
}

export default function RichTextEditor({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  dir = 'ltr',
  minHeight = '300px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Update editor content when external value changes (but not while focusing to avoid cursor jumps)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange({
        target: {
          name,
          value: content === '<br>' ? '' : content
        }
      });
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Entrez l\'URL du lien :');
    if (url) execCommand('createLink', url);
  };

  return (
    <div className={`group relative flex flex-col rounded-3xl border transition-all duration-300 ${
      isFocused 
        ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-xl shadow-teal-500/5 bg-white' 
        : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10 rounded-t-3xl">
        <ToolbarButton 
          onClick={() => execCommand('bold')} 
          icon="B" 
          title="Gras (Ctrl+B)" 
          className="font-black"
        />
        <ToolbarButton 
          onClick={() => execCommand('italic')} 
          icon="I" 
          title="Italique (Ctrl+I)" 
          className="italic serif"
        />
        <ToolbarButton 
          onClick={() => execCommand('insertUnorderedList')} 
          icon="•" 
          title="Liste à puces" 
        />
        <div className="w-px h-6 bg-gray-100 mx-1"></div>
        <ToolbarButton 
          onClick={addLink} 
          icon="🔗" 
          title="Ajouter un lien" 
        />
        <ToolbarButton 
          onClick={() => execCommand('removeFormat')} 
          icon="⌫" 
          title="Effacer le formatage" 
        />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dir={dir}
        className={`w-full p-6 outline-none prose prose-teal max-w-none font-medium leading-relaxed overflow-y-auto ${
          dir === 'rtl' ? 'text-right' : 'text-left'
        }`}
        style={{ minHeight }}
      />
      
      {/* Placeholder workaround */}
      {!value && !isFocused && (
        <div className="absolute top-[72px] left-6 text-gray-400 pointer-events-none italic font-medium">
          {placeholder || 'Commencez à rédiger...'}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, icon, title, className = "" }: { onClick: () => void, icon: string, title: string, className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600 ${className}`}
    >
      {icon}
    </button>
  );
}
