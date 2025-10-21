import { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, History, Copy, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';

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
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const resolveImageSrc = entry => entry.previewUrl || entry.url || '';
  const activeEntry = activeEntryId ? history.find(entry => entry.id === activeEntryId) : null;
  const scrollLockRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    if (activeEntry && !scrollLockRef.current) {
      document.body.classList.add('modal-open');
      scrollLockRef.current = true;
    } else if (!activeEntry && scrollLockRef.current) {
      document.body.classList.remove('modal-open');
      scrollLockRef.current = false;
    }
    return () => {
      if (scrollLockRef.current) {
        document.body.classList.remove('modal-open');
        scrollLockRef.current = false;
      }
    };
  }, [activeEntry]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.body.classList.toggle('modal-open', Boolean(activeEntry));
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [activeEntry]);

  function handleOpenModal(entry) {
    setActiveEntryId(entry.id);
    setShowFullPrompt(false);
  }

  function handleCloseModal() {
    setActiveEntryId(null);
    setShowFullPrompt(false);
  }

  const doesTemplateExist = entry => templates.some(template => template.id === entry.templateId);

  function handleReuse(entry) {
    if (!doesTemplateExist(entry)) {
      const detail = entry.templateName ? `“${entry.templateName}” template` : 'This template';
      alert(`${detail} is no longer available.`);
      return;
    }
    onReuseHistoryEntry(entry);
    handleCloseModal();
  }

  async function handleDownload(entry) {
    const src = resolveImageSrc(entry);
    if (!src) return;
    const safeName = (entry.generationName || entry.templateName || 'render')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .toLowerCase();
    try {
      let downloadUrl = src;
      let revokeAfter = false;
      if (!src.startsWith('data:')) {
        const response = await fetch(src, { mode: 'cors' });
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
        revokeAfter = true;
      }
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (revokeAfter) URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download image', err);
      onOpenImage(src);
    }
  }

  function handleCopyPrompt(entry) {
    if (!entry?.prompt || !navigator?.clipboard) return;
    navigator.clipboard.writeText(entry.prompt).catch(copyErr => console.error('Copy failed', copyErr));
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
            const timestampLabel = entry.createdAt
              ? (() => {
                  const date = new Date(entry.createdAt);
                  const now = new Date();
                  const options = { day: '2-digit', month: 'long' };
                  if (date.getFullYear() !== now.getFullYear()) {
                    options.year = 'numeric';
                  }
                  return date.toLocaleDateString('en-GB', options);
                })()
              : '';
            const generationLabel = entry.generationName || entry.templateName || 'Saved generation';
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
                    alt={`${generationLabel} render`}
                  />
                </div>
                <div className="history-details">
                  <div className="history-meta">
                    <span className="history-generation">{generationLabel}</span>
                  </div>
                  {entry.templateName ? (
                    <span className="history-template muted">Template: {entry.templateName}</span>
                  ) : null}
                  {timestampLabel && <span className="history-time">{timestampLabel}</span>}
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
              <X size={18} />
            </button>
            <div className="template-modal-body">
              <div className="template-modal-grid">
                <div className="template-modal-media">
                <img
                  src={resolveImageSrc(activeEntry)}
                  alt={activeEntry.generationName || activeEntry.templateName || 'Generated render'}
                />
              </div>
                <div className="template-modal-details">
                <header>
                  <h2>{activeEntry.generationName || activeEntry.templateName || 'Saved generation'}</h2>
                  {activeEntry.templateName ? (
                    <p className="muted">Template: {activeEntry.templateName}</p>
                  ) : null}
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
                    {activeEntry.createdAt
                      ? (() => {
                          const date = new Date(activeEntry.createdAt);
                          const now = new Date();
                          const options = { day: '2-digit', month: 'long' };
                          if (date.getFullYear() !== now.getFullYear()) {
                            options.year = 'numeric';
                          }
                          return date.toLocaleDateString('en-GB', options);
                        })()
                      : 'Unknown'}
                  </span>
                </div>
                {activeEntry.model ? (
                  <div className="history-meta-block">
                    <span className="history-meta-label">Model</span>
                    <span className="history-meta-value">
                      {activeEntry.model === 'gpt-image-1' ? 'GPT Image' : 'DALL·E 3'}
                    </span>
                  </div>
                ) : null}
                <div className="history-meta-block prompt-block">
                  <div className="prompt-header">
                    <span className="history-meta-label">Prompt</span>
                    <div className="prompt-actions">
                      <button type="button" onClick={() => setShowFullPrompt(prev => !prev)}>
                        {showFullPrompt ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>{showFullPrompt ? 'Collapse' : 'Show full'}</span>
                      </button>
                      <button type="button" onClick={() => handleCopyPrompt(activeEntry)}>
                        <Copy size={16} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <p className={showFullPrompt ? 'history-prompt-full' : 'history-prompt-truncated'}>{activeEntry.prompt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
