import { ACCEPTED_IMAGE_FORMATS } from '@/lib/config';

interface CoverUploadProps {
  coverUrl: string | null;
  uploadingCover: boolean;
  onCoverSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCover: () => void;
  style?: 'default' | 'recipe';
}

export default function CoverUpload({
  coverUrl,
  uploadingCover,
  onCoverSelect,
  onDeleteCover,
  style = 'default',
}: CoverUploadProps) {
  const isRecipeStyle = style === 'recipe';

  return (
    <div>
      <label className="block text-sm text-neutral-600 mb-2">Cover Image (cover.jpg)</label>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div
          className={`w-full sm:w-40 h-40 sm:h-28 bg-neutral-100 rounded overflow-hidden flex items-center justify-center border flex-shrink-0 relative ${
            isRecipeStyle ? 'sm:w-48 sm:h-32 rounded-xl border-2' : ''
          }`}
        >
          {coverUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={onDeleteCover}
                disabled={uploadingCover}
                className={`absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 disabled:opacity-50 ${
                  isRecipeStyle ? 'top-2 right-2 p-2 shadow-lg' : ''
                }`}
                title="Delete cover"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <span className={`text-neutral-500 ${isRecipeStyle ? 'text-sm text-neutral-400' : 'text-xs'}`}>
              {isRecipeStyle ? 'No cover image' : 'No cover'}
            </span>
          )}
        </div>
        <div className="flex-1 w-full">
          <label className="block">
            <input
              type="file"
              accept={ACCEPTED_IMAGE_FORMATS}
              onChange={onCoverSelect}
              disabled={uploadingCover}
              className="hidden"
              id="cover-upload"
            />
            <span
              className={`inline-block px-4 py-2 rounded cursor-pointer text-sm ${
                uploadingCover
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              } ${isRecipeStyle ? 'px-5 py-2.5 rounded-lg font-medium' : ''}`}
            >
              {uploadingCover ? 'Uploading...' : 'Choose Image'}
            </span>
          </label>
          <div className={`text-neutral-500 mt-1 ${isRecipeStyle ? 'text-xs mt-2' : 'text-xs'}`}>
            Will be saved to images/cover.jpg (max 5MB). Optional.
          </div>
        </div>
      </div>
    </div>
  );
}


