import { useRef, useEffect } from 'react';

interface MarkdownToolbarProps {
  textareaId: string;
  value: string;
  onChange: (value: string) => void;
  isVisual?: boolean;
  onCommand?: (command: string, value?: string) => void;
}

export default function MarkdownToolbar({ 
  textareaId, 
  value, 
  onChange, 
  isVisual = false,
  onCommand 
}: MarkdownToolbarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 获取textarea引用
  useEffect(() => {
    if (!isVisual) {
      textareaRef.current = document.getElementById(textareaId) as HTMLTextAreaElement;
    }
  }, [textareaId, isVisual]);

  // 获取选中文本和光标位置
  const getSelection = () => {
    const textarea = textareaRef.current || (document.getElementById(textareaId) as HTMLTextAreaElement);
    if (!textarea) return { start: 0, end: 0, selectedText: '', textarea: null };
    
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      selectedText: value.substring(textarea.selectionStart, textarea.selectionEnd),
      textarea,
    };
  };

  // 插入文本并保持焦点
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const { start, end, selectedText, textarea } = getSelection();
    if (!textarea) return;

    const textToInsert = selectedText || defaultText;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // 恢复焦点和光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 处理动作
  const handleAction = (command: string, mdBefore: string, mdAfter: string, mdDefault: string, commandValue?: string) => {
    if (isVisual && onCommand) {
      onCommand(command, commandValue);
    } else {
      insertText(mdBefore, mdAfter, mdDefault);
    }
  };

  // 各种格式化动作
  const insertBold = () => handleAction('bold', '**', '**', 'bold text');
  const insertItalic = () => handleAction('italic', '*', '*', 'italic text');
  const insertHeading = (level: number) => {
    if (isVisual && onCommand) {
      onCommand('formatBlock', `<h${level}>`);
    } else {
      const prefix = '#'.repeat(level) + ' ';
      insertText(prefix, '', 'Heading');
    }
  };
  const insertUnorderedList = () => handleAction('insertUnorderedList', '- ', '', 'List item');
  const insertOrderedList = () => handleAction('insertOrderedList', '1. ', '', 'List item');
  const insertBlockquote = () => handleAction('formatBlock', '> ', '', 'Quote', '<blockquote>');
  const insertHorizontalRule = () => handleAction('insertHorizontalRule', '\n---\n', '', '');

  return (
    <div className="border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 flex flex-wrap items-center gap-1">
      {/* Bold */}
      <button
        type="button"
        onClick={insertBold}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Bold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={insertItalic}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Italic"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => insertHeading(1)}
        className="px-2 py-1 rounded hover:bg-neutral-200 transition-colors text-sm font-bold"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => insertHeading(2)}
        className="px-2 py-1 rounded hover:bg-neutral-200 transition-colors text-sm font-bold"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => insertHeading(3)}
        className="px-2 py-1 rounded hover:bg-neutral-200 transition-colors text-sm font-bold"
        title="Heading 3"
      >
        H3
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 mx-1" />

      {/* Unordered List */}
      <button
        type="button"
        onClick={insertUnorderedList}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Unordered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Ordered List */}
      <button
        type="button"
        onClick={insertOrderedList}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Ordered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </button>

      {/* Blockquote */}
      <button
        type="button"
        onClick={insertBlockquote}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Blockquote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Horizontal Rule */}
      <button
        type="button"
        onClick={insertHorizontalRule}
        className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
        title="Horizontal Rule"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
