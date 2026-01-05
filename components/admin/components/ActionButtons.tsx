interface ActionButtonsProps {
  loading: boolean;
  publish: boolean;
  setPublish: (publish: boolean) => void;
  style?: 'default' | 'recipe';
}

export default function ActionButtons({ loading, publish, setPublish, style = 'default' }: ActionButtonsProps) {
  const isRecipeStyle = style === 'recipe';

  return (
    <div className={`flex items-center gap-3 ${isRecipeStyle ? 'gap-4 pt-4 border-t border-neutral-200' : ''}`}>
      <button
        type="submit"
        onClick={() => setPublish(false)}
        disabled={loading}
        className={`px-4 py-2 rounded border ${
          isRecipeStyle
            ? 'px-6 py-2.5 rounded-lg border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            : ''
        }`}
      >
        {loading && !publish ? 'Saving…' : isRecipeStyle ? 'Save as Draft' : 'Save (draft)'}
      </button>
      <button
        type="submit"
        onClick={() => setPublish(true)}
        disabled={loading}
        className={`px-4 py-2 rounded bg-neutral-900 text-white ${
          isRecipeStyle
            ? 'px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            : ''
        }`}
      >
        {loading && publish ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
}


