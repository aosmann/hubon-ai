export default function HomeView({
  history,
  templates,
  onBrowseTemplates,
  onOpenImage,
  onReuseHistoryEntry,
  isLoading,
  error
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>Home</h1>
          <p className="page-subtitle">
            Review your recent image generations and jump back into a template when inspiration hits.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="primary" onClick={onBrowseTemplates}>
            Browse templates
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p className="muted loading-block">Loading your recent generations…</p>
      ) : history.length ? (
        <div className="history-grid">
          {history.map(entry => {
            const templateExists = templates.some(template => template.id === entry.templateId);
            const timestampLabel = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '';
            return (
              <article key={entry.id} className="history-card">
                <div className="history-thumb">
                  <img
                    src={entry.url}
                    alt={entry.templateName ? `${entry.templateName} render` : 'Generated render'}
                  />
                </div>
                <div className="history-details">
                  <div className="history-meta">
                    <span className="history-template">{entry.templateName || 'Saved generation'}</span>
                    {timestampLabel && <span className="history-time">{timestampLabel}</span>}
                  </div>
                  <p className="history-prompt" title={entry.prompt}>
                    {entry.prompt}
                  </p>
                  <div className="history-actions">
                    {templateExists && (
                      <button type="button" className="primary" onClick={() => onReuseHistoryEntry(entry)}>
                        Reuse template
                      </button>
                    )}
                    <button type="button" className="secondary" onClick={() => onOpenImage(entry.url)}>
                      Open image
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No generations yet</h2>
          <p className="muted">
            Generate your first visual to see it saved here. Browse templates to get started quickly.
          </p>
          <div className="empty-actions">
            <button type="button" className="primary" onClick={onBrowseTemplates}>
              Browse templates
            </button>
          </div>
        </section>
      )}
    </>
  );
}
