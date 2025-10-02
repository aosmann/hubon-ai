export default function BrandView({ brandStyleSchema, brandStyle, onChange, onSubmit, loading, isSaving, error }) {
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
          const value = brandStyle[field.key] ?? '';
          const isTextarea = field.type === 'textarea';
          const isLogoField = field.key === 'logoUrl';
          const logoValue = typeof value === 'string' ? value.trim() : '';
          return (
            <div key={field.key} className={`brand-field${isLogoField ? ' brand-field-logo' : ''}`}>
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
