import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function GenerateView({
  selectedTemplate,
  templateFormValues,
  onTemplateFormChange,
  onGenerate,
  isGenerateDisabled,
  loading,
  error,
  brandStyleSummary,
  promptPreview,
  imageResult,
  onBack,
  onEditBrand,
  onOpenImage,
  useGptImage,
  onModelToggle,
  hasLogoAsset,
  aspectRatioOptions,
  selectedAspectRatio,
  onAspectRatioChange,
  generationName,
  onGenerationNameChange
}) {
  const [showBrandStyles, setShowBrandStyles] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const ratioOptions = useMemo(() => {
    if (Array.isArray(aspectRatioOptions) && aspectRatioOptions.length > 0) {
      return aspectRatioOptions;
    }
    return [{ value: '512x512', label: 'Square (512x512)', width: 1, height: 1 }];
  }, [aspectRatioOptions]);

  const activeRatio = useMemo(
    () => ratioOptions.find(option => option.value === selectedAspectRatio) || ratioOptions[0],
    [ratioOptions, selectedAspectRatio]
  );

  const ratioValue = activeRatio?.value || ratioOptions[0].value;

  const ratioPreviewStyle = useMemo(() => {
    const base = 44;
    const width = typeof activeRatio?.width === 'number' ? activeRatio.width : 1;
    const height = typeof activeRatio?.height === 'number' ? activeRatio.height : 1;
    const maxSide = Math.max(width, height, 1);
    const visualWidth = Math.max((width / maxSide) * base, 12);
    const visualHeight = Math.max((height / maxSide) * base, 12);
    return {
      width: `${visualWidth}px`,
      height: `${visualHeight}px`
    };
  }, [activeRatio]);

  function handleRatioChange(event) {
    if (typeof onAspectRatioChange === 'function') {
      onAspectRatioChange(event.target.value);
    }
  }

  if (!selectedTemplate) return null;

  return (
    <>
      <div className="page-header">
        <div>
          <button type="button" className="secondary" onClick={onBack}>
            ← Back to templates
          </button>
          <h1>{selectedTemplate.name}</h1>
          <p className="page-subtitle">{selectedTemplate.description}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="secondary" onClick={onEditBrand}>
            Edit brand style
          </button>
        </div>
      </div>

      <div className="generate-layout">
        <section className="generation-form">
          <h2>Template fields</h2>
          <label className="generation-name">
            <span>Generation name</span>
            <input
              type="text"
              placeholder="e.g. Spring launch hero"
              value={generationName}
              onChange={event => onGenerationNameChange(event.target.value)}
            />
          </label>
          <label className="aspect-ratio-field">
            <span>Aspect ratio</span>
            <div className="aspect-ratio-control">
              <span className="aspect-ratio-icon" style={ratioPreviewStyle} aria-hidden="true" />
              <select value={ratioValue} onChange={handleRatioChange}>
                {ratioOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="muted aspect-ratio-hint">Larger ratios use more credits.</span>
          </label>
          <div className="form-grid">
            {selectedTemplate.fields.map(field => (
              <label key={field.id}>
                <span>{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    value={templateFormValues[field.key] ?? ''}
                    onChange={event => onTemplateFormChange(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={templateFormValues[field.key] ?? ''}
                    onChange={event => onTemplateFormChange(field.key, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="form-actions">
            <label className="model-toggle">
              <input
                type="checkbox"
                checked={useGptImage}
                onChange={event => onModelToggle(event.target.checked)}
              />
              <span>
                Use GPT Image (access to multi-image reasoning and logo conditioning)
                {!hasLogoAsset && useGptImage ? (
                  <>
                    <br />
                    <em className="muted">Tip: upload a logo or provide a URL for better conditioning.</em>
                  </>
                ) : null}
              </span>
            </label>
            <button type="button" className="primary" disabled={isGenerateDisabled} onClick={onGenerate}>
              {loading ? 'Generating…' : 'Generate image'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>

        <aside className="prompt-preview">
          <div className="preview-section">
            <h3>Template preview</h3>
            <div className="template-thumbnail">
              <img
                src={selectedTemplate.image}
                alt={selectedTemplate.name}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="preview-section" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
            <div className="prompt-header">
              <span className="history-meta-label">Brand style</span>
              <div className="prompt-actions">
                <button type="button" onClick={() => setShowBrandStyles(prev => !prev)}>
                  {showBrandStyles ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showBrandStyles ? 'Collapse' : 'Show full'}</span>
                </button>
              </div>
            </div>
            {showBrandStyles && (
              brandStyleSummary.length ? (
                <ul>
                  {brandStyleSummary.map(entry => (
                    <li key={entry.label}>
                      <strong>{entry.label}:</strong> {entry.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">You have not set any brand style details yet.</p>
              )
            )}
          </div>

          <div className="preview-section" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
            <div className="prompt-header">
              <span className="history-meta-label">Prompt preview</span>
              <div className="prompt-actions">
                <button type="button" onClick={() => setShowPrompt(prev => !prev)}>
                  {showPrompt ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPrompt ? 'Collapse' : 'Show full'}</span>
                </button>
              </div>
            </div>
            {showPrompt && (
              promptPreview ? <pre>{promptPreview}</pre> : <p className="muted">Fill out the fields to preview your prompt.</p>
            )}
          </div>

          {imageResult && (
            <div className="preview-section">
              <h3>Latest render</h3>
              <div className="image-preview">
                <button
                  type="button"
                  onClick={() => onOpenImage(imageResult.storedUrl || imageResult.url)}
                >
                  <img src={imageResult.url} alt="Generated visual" />
                </button>
                <span className="muted">Tap to open full resolution</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
