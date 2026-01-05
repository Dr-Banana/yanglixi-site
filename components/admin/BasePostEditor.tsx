import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import FormFields from './components/FormFields';
import CoverUpload from './components/CoverUpload';
import MDXEditor from './components/MDXEditor';
import ActionButtons from './components/ActionButtons';
import { BasePostData, PostEditorConfig, FormErrors } from './types';

interface BasePostEditorProps {
  initial?: BasePostData & { body?: string } | null;
  config: PostEditorConfig;
  displaySlug: string;
  errors: FormErrors;
  body?: string;
  setBody?: (body: string) => void;
  coverUrl: string | null;
  uploadingCover: boolean;
  onCoverSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCover: () => void;
  previewLoading: boolean;
  previewOn: boolean;
  mdxSource: any;
  onTogglePreview: () => void;
  loading: boolean;
  publish: boolean;
  setPublish: (publish: boolean) => void;
  message: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  customBodyEditor?: ReactNode; // 自定义body编辑器（如sections）
}

export default function BasePostEditor({
  initial,
  config,
  displaySlug,
  errors,
  body,
  setBody,
  coverUrl,
  uploadingCover,
  onCoverSelect,
  onDeleteCover,
  previewLoading,
  previewOn,
  mdxSource,
  onTogglePreview,
  loading,
  publish,
  setPublish,
  message,
  onSubmit,
  customBodyEditor,
}: BasePostEditorProps) {
  const router = useRouter();


  const isRecipeStyle = config.style === 'recipe';

  return (
    <div className={isRecipeStyle ? '' : 'min-h-screen p-6 bg-neutral-50'}>
      <div className={`${isRecipeStyle ? '' : 'max-w-4xl mx-auto space-y-4'}`}>
        <div className="flex items-center justify-between">
          <h1 className={`${isRecipeStyle ? 'text-4xl font-serif font-bold text-neutral-800' : 'text-2xl font-bold'}`}>
            {config.pageTitle}
          </h1>
          <button
            onClick={() => router.push(config.backButtonHref)}
            className={`${isRecipeStyle ? 'inline-flex items-center px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors font-medium' : 'text-sm px-3 py-1.5 border rounded'}`}
          >
            {config.backButtonText}
          </button>
        </div>
        {message && (
          <div className={`text-sm ${isRecipeStyle ? 'text-green-700 bg-green-50 px-4 py-2 rounded-lg' : 'text-neutral-700'}`}>
            {message}
          </div>
        )}
        <form
          onSubmit={onSubmit}
          className={`bg-white rounded-xl shadow p-4 space-y-4 ${isRecipeStyle ? 'rounded-2xl shadow-lg p-8 space-y-6' : ''}`}
        >
          {/* 基础字段 */}
          <FormFields initial={initial || null} errors={errors} displaySlug={displaySlug} config={config} />

          {/* Cover图片上传 */}
          {config.fields.cover && (
            <CoverUpload
              coverUrl={coverUrl}
              uploadingCover={uploadingCover}
              onCoverSelect={onCoverSelect}
              onDeleteCover={onDeleteCover}
              style={config.style}
            />
          )}

          {/* Body编辑器 */}
          {config.fields.body && !customBodyEditor && body !== undefined && setBody && (
            <MDXEditor
              body={body}
              setBody={setBody}
              previewLoading={previewLoading}
              previewOn={previewOn}
              mdxSource={mdxSource}
              onTogglePreview={onTogglePreview}
              errors={errors}
              style={config.style}
            />
          )}

          {/* 自定义body编辑器 */}
          {customBodyEditor}

          {/* 操作按钮 */}
          <ActionButtons loading={loading} publish={publish} setPublish={setPublish} style={config.style} />
        </form>
      </div>
    </div>
  );
}

