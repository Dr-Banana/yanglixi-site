import { BasePostData, PostEditorConfig, FormErrors } from '../types';

interface FormFieldsProps {
  initial?: BasePostData | null;
  errors: FormErrors;
  displaySlug: string;
  config: PostEditorConfig;
}

export default function FormFields({ initial, errors, displaySlug, config }: FormFieldsProps) {
  const { fields } = config;

  return (
    <>
      {/* Title and Date */}
      {(fields.title || fields.date) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.title && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Title {config.validation.requiredFields.includes('title') && <span className="text-red-500">*</span>}
              </label>
              <input
                name="title"
                defaultValue={initial?.title || ''}
                className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
              />
            </div>
          )}
          {fields.date && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">
                Date {config.validation.requiredFields.includes('date') && <span className="text-red-500">*</span>}
              </label>
              <input
                name="date"
                type="date"
                defaultValue={initial?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
                className={`w-full border rounded px-3 py-2 ${errors.date ? 'border-red-500' : ''}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Excerpt */}
      {fields.excerpt && (
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Excerpt</label>
          <input
            name="excerpt"
            defaultValue={initial?.excerpt || ''}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {/* Cook Time and Difficulty */}
      {(fields.cookTime || fields.difficulty) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.cookTime && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Cook Time</label>
              <input
                name="cookTime"
                defaultValue={initial?.cookTime || ''}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
          {fields.difficulty && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Difficulty</label>
              <input
                name="difficulty"
                defaultValue={initial?.difficulty || ''}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
        </div>
      )}

      {/* Servings and Category */}
      {(fields.servings || fields.category) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.servings && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Servings</label>
              <input
                name="servings"
                defaultValue={initial?.servings || ''}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
          {fields.category && (
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Category</label>
              <input
                name="category"
                defaultValue={initial?.category || ''}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {fields.tags && (
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Tags (comma separated)</label>
          <input
            name="tags"
            defaultValue={(initial?.tags || []).join(', ')}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {/* Slug */}
      {fields.slug && (
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Slug (UUID)</label>
          <input
            name="slug"
            value={displaySlug}
            disabled
            className="w-full border rounded px-3 py-2 bg-neutral-50 text-neutral-500 cursor-not-allowed"
            readOnly
          />
        </div>
      )}
    </>
  );
}


