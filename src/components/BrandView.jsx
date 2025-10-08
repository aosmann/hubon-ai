function formatFileSize(bytes) {
  if (!bytes || typeof bytes !== 'number') return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BrandView({ brandStyleSchema, brandStyle, onChange, onSubmit, loading, isSaving, error }) {
  function handleFileInputChange(fieldKey, event) {
    const file = event.target.files?.[0];
    if (!file) {
      onChange(fieldKey, null);
      return;
    }

    const reader = new FileReader();
    reader.onload = loadEvent => {
      const result = typeof loadEvent.target?.result === 'string' ? loadEvent.target.result : '';
      if (!result) {
        onChange(fieldKey, null);
        return;
      }
      onChange(fieldKey, {
        name: file.name,
        type: file.type || 'image/png',
        size: file.size,
        dataUrl: result
      });
    };
    reader.onerror = () => {
      console.error('Failed to read uploaded file');
      onChange(fieldKey, null);
    };
    reader.readAsDataURL(file);

    // Allow selecting the same file again if needed.
    event.target.value = '';
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Brand style guide</h1>
          <p className="page-subtitle">
            These details are blended into every template prompt so your visuals stay on-brand.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="secondary" onClick={onSubmit}>
            Back to templates
          </button>
        </div>
      </div>

      {loading ? <p className="muted loading-block">Loading your saved brand preferences…</p> : null}
      {error && <p className="error-message">{error}</p>}

      <form
        className="brand-form"
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {brandStyleSchema.map(field => {
          const rawValue = brandStyle[field.key];
          const value = typeof rawValue === 'string' ? rawValue : '';
          const isTextarea = field.type === 'textarea';
          const isLogoField = field.key === 'logoUrl';
          const isFileField = field.type === 'file';
          const logoValue = isLogoField && typeof value === 'string' ? value.trim() : '';
          const uploadValue =
            isFileField && rawValue && typeof rawValue === 'object' && rawValue.dataUrl ? rawValue : null;
          return (
            <div
              key={field.key}
              className={`brand-field${isLogoField || isFileField ? ' brand-field-logo' : ''}`}
            >
              {isFileField ? (
                <>
                  <label>
                    <span>{field.label}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={event => handleFileInputChange(field.key, event)}
                    />
                  </label>
                  {uploadValue ? (
                    <div className="logo-preview">
                      <span className="muted">Uploaded logo</span>
                      <div className="logo-preview-frame">
                        <img src={uploadValue.dataUrl} alt="Uploaded brand logo" />
                      </div>
                      <div className="logo-preview-meta">
                        <span>
                          {uploadValue.name || 'Logo image'}
                          {uploadValue.size ? ` · ${formatFileSize(uploadValue.size)}` : ''}
                        </span>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => onChange(field.key, null)}
                        >
                          Remove upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="muted">Upload a PNG, JPG, or SVG to include the actual logo asset.</p>
                  )}
                </>
              ) : (
                <>
                  <label>
                    <span>{field.label}</span>
                    {isTextarea ? (
                      <textarea
                        rows={field.key === 'brandName' ? 2 : 4}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={event => onChange(field.key, event.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        placeholder={field.placeholder}
                        onChange={event => onChange(field.key, event.target.value)}
                      />
                    )}
                  </label>
                  {isLogoField && logoValue && (
                    <div className="logo-preview">
                      <span className="muted">Live preview</span>
                      <div className="logo-preview-frame">
                        <img src={logoValue} alt="Brand logo preview" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div className="page-actions">
          <button type="submit" className="primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </>
  );
}
