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
  onOpenImage
}) {
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
            <button type="button" className="primary" disabled={isGenerateDisabled} onClick={onGenerate}>
              {loading ? 'Generating…' : 'Generate image'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>

        <aside className="prompt-preview">
          <div className="preview-section">
            <h3>Brand style</h3>
            {brandStyleSummary.length ? (
              <ul>
                {brandStyleSummary.map(entry => (
                  <li key={entry.label}>
                    <strong>{entry.label}:</strong> {entry.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">You have not set any brand style details yet.</p>
            )}
          </div>

          <div className="preview-section">
            <h3>Prompt preview</h3>
            {promptPreview ? <pre>{promptPreview}</pre> : <p className="muted">Fill out the fields to preview your prompt.</p>}
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
