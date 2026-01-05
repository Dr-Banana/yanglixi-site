import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { FormErrors } from '../types';
import MarkdownToolbar from './MarkdownToolbar';

interface MDXEditorProps {
  body: string;
  setBody: (body: string) => void;
  previewLoading: boolean;
  previewOn: boolean;
  mdxSource: MDXRemoteSerializeResult | null;
  onTogglePreview: () => void;
  errors: FormErrors;
  style?: 'default' | 'recipe';
}

export default function MDXEditor({
  body,
  setBody,
  previewLoading,
  previewOn,
  mdxSource,
  onTogglePreview,
  errors,
  style = 'default',
}: MDXEditorProps) {
  const isRecipeStyle = style === 'recipe';
  const textareaId = 'mdx-body-editor';

  return (
    <div>
      <label className="block text-sm text-neutral-600 mb-1">Body (MDX)</label>
      <div className="border rounded-lg overflow-hidden">
        <MarkdownToolbar textareaId={textareaId} value={body} onChange={setBody} />
        <textarea
          name="body"
          id={textareaId}
          rows={20}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`w-full px-3 py-2 font-mono text-sm border-0 focus:ring-0 focus:outline-none ${
            errors.body
              ? 'border-red-500'
              : previewOn
              ? 'border-primary-400 ring-1 ring-primary-200'
              : ''
          }`}
        />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={previewLoading}
          onClick={onTogglePreview}
          className={`px-3 py-1.5 rounded transition-colors ${
            previewOn ? 'bg-neutral-900 text-white' : 'border'
          } ${isRecipeStyle ? 'px-4 py-2 rounded-lg font-medium border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50' : ''}`}
          aria-pressed={previewOn}
        >
          {previewLoading ? 'Rendering…' : previewOn ? (isRecipeStyle ? '✓ Preview ON' : 'Preview: ON') : (isRecipeStyle ? 'Preview OFF' : 'Preview: OFF')}
        </button>
        {previewOn && (
          <span className={`px-2 py-0.5 rounded ${isRecipeStyle ? 'text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-medium' : 'text-xs bg-primary-100 text-primary-700'}`}>
            {isRecipeStyle ? 'Live Preview' : 'Preview mode'}
          </span>
        )}
      </div>
      {previewOn && mdxSource && (
        <div
          className={`mt-4 p-4 border-2 border-primary-200 rounded bg-neutral-50 h-80 overflow-auto ${
            isRecipeStyle ? 'p-6 rounded-xl bg-white max-h-96' : ''
          }`}
        >
          <div className="prose max-w-none">
            <MDXRemote {...mdxSource} />
          </div>
        </div>
      )}
    </div>
  );
}

