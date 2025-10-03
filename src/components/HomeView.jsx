import { useState } from 'react';
import { Download, ExternalLink, History } from 'lucide-react';

export default function HomeView({
  history,
  templates,
  onBrowseTemplates,
  onOpenImage,
  onReuseHistoryEntry,
  isLoading,
  error
}) {
  const [activeEntryId, setActiveEntryId] = useState(null);

  const resolveImageSrc = entry => entry.previewUrl || entry.url || '';
  const activeEntry = activeEntryId ? history.find(entry => entry.id === activeEntryId) : null;

  function handleOpenModal(entry) {
    setActiveEntryId(entry.id);
  }

  function handleCloseModal() {
    setActiveEntryId(null);
  }

  function handleReuse(entry) {
    onReuseHistoryEntry(entry);
    handleCloseModal();
  }

  function handleDownload(entry) {
    const src = resolveImageSrc(entry);
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    const safeName = (entry.templateName || 'render').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    link.download = `${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
          <button type="button" className="secondary" onClick={onBrowseTemplates}>
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
              <article
                key={entry.id}
                className="history-card"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenModal(entry)}
              >
                <div className="history-thumb">
                  <img
                    src={resolveImageSrc(entry)}
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
                  <span className="history-open-hint">Tap to view details</span>
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
            <button type="button" className="secondary" onClick={onBrowseTemplates}>
              Browse templates
            </button>
          </div>
        </section>
      )}

      {activeEntry && (
        <div className="template-modal" role="dialog" aria-modal="true">
          <div className="template-modal-backdrop" onClick={handleCloseModal} />
          <div className="template-modal-content history-modal">
            <button type="button" className="modal-close" onClick={handleCloseModal} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
            <div className="template-modal-grid">
              <div className="template-modal-media">
                <img src={resolveImageSrc(activeEntry)} alt={activeEntry.templateName || 'Generated render'} />
              </div>
              <div className="template-modal-details">
                <header>
                  <h2>{activeEntry.templateName || 'Saved generation'}</h2>
                  <p>{activeEntry.prompt}</p>
                </header>
                <div className="template-modal-actions">
                  <button type="button" className="primary" onClick={() => handleReuse(activeEntry)}>
                    <History size={18} />
                    <span>Reuse Template</span>
                  </button>
                  <button type="button" className="secondary" onClick={() => onOpenImage(resolveImageSrc(activeEntry))}>
                    <ExternalLink size={18} />
                    <span>Open Image</span>
                  </button>
                  <button type="button" className="secondary" onClick={() => handleDownload(activeEntry)}>
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                </div>
                <div className="history-meta-block">
                  <span className="history-meta-label">Generated</span>
                  <span className="history-meta-value">
                    {activeEntry.createdAt ? new Date(activeEntry.createdAt).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
