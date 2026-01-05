import { useState, useRef, useEffect } from 'react';
import MarkdownToolbar from './MarkdownToolbar';

interface MarkdownPreviewEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  rows?: number;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function MarkdownPreviewEditor({
  id,
  value,
  onChange,
  label,
  rows = 6,
  placeholder,
  className = '',
  required = false,
}: MarkdownPreviewEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 辅助函数：将 Markdown 转换为简单的预览 HTML
  const markdownToHtml = (md: string) => {
    if (!md) return '';
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br/>');
  };

  // 简单的 HTML 转 Markdown 逻辑
  const htmlToMarkdown = (html: string): string => {
    let md = html
      .replace(/<strong.*?>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b.*?>(.*?)<\/b>/g, '**$1**')
      .replace(/<em.*?>(.*?)<\/em>/g, '*$1*')
      .replace(/<i.*?>(.*?)<\/i>/g, '*$1*')
      .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<h1.*?>(.*?)<\/h1>/g, '# $1\n')
      .replace(/<h2.*?>(.*?)<\/h2>/g, '## $1\n')
      .replace(/<h3.*?>(.*?)<\/h3>/g, '### $1\n')
      .replace(/<ul.*?>([\s\S]*?)<\/ul>/g, (match, p1) => {
        return p1.replace(/<li.*?>(.*?)<\/li>/g, '- $1\n');
      })
      .replace(/<ol.*?>([\s\S]*?)<\/ol>/g, (match, p1) => {
        let i = 1;
        return p1.replace(/<li>(.*?)<\/li>/g, () => `${i++}. $1\n`);
      })
      .replace(/<blockquote.*?>(.*?)<\/blockquote>/g, '> $1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div.*?>(.*?)<\/div>/g, '\n$1')
      .replace(/<p.*?>(.*?)<\/p>/g, '\n$1\n');
    
    // 移除剩余 HTML 标签
    md = md.replace(/<[^>]*>/g, '');
    
    // 解码 HTML 实体
    if (typeof document !== 'undefined') {
      const txt = document.createElement('textarea');
      txt.innerHTML = md;
      return txt.value.trim();
    }
    return md.trim();
  };

  // 初始化内容
  useEffect(() => {
    if (editorRef.current && !hasInitialized) {
      editorRef.current.innerHTML = markdownToHtml(value);
      setHasInitialized(true);
    }
  }, [value, hasInitialized]);

  // 当外部 value 改变时（例如通过其他方式重置表单），同步内容
  useEffect(() => {
    if (editorRef.current && hasInitialized && !isInternalChange.current) {
      const currentMd = htmlToMarkdown(editorRef.current.innerHTML);
      if (currentMd !== value) {
        editorRef.current.innerHTML = markdownToHtml(value);
      }
    }
  }, [value, hasInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      onChange(md);
      // 使用 requestAnimationFrame 确保在下一次渲染前恢复状态
      requestAnimationFrame(() => {
        isInternalChange.current = false;
      });
    }
  };

  const handleToolbarCommand = (command: string, arg?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && typeof label === 'string' && !label.includes('*') && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="border border-neutral-300 rounded-lg overflow-hidden flex flex-col bg-white">
        <MarkdownToolbar 
          textareaId={id} 
          value={value} 
          onChange={onChange}
          isVisual={true}
          onCommand={handleToolbarCommand}
        />
        
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={`p-4 min-h-[200px] prose max-w-none focus:outline-none ${className}`}
          style={{ minHeight: `${rows * 1.5}rem` }}
        />

        {/* 隐藏的 textarea 用于兼容现有表单提交逻辑 */}
        <textarea
          name={id}
          value={value}
          readOnly
          className="hidden"
        />
        
        {!value && !hasInitialized && (
          <div className="absolute p-4 text-neutral-400 pointer-events-none italic">
            {placeholder || 'Start typing...'}
          </div>
        )}
      </div>
    </div>
  );
}
