import { useEffect, useRef, useState } from 'react';

function autoResizeTextarea(node) {
  if (!node) return;
  node.style.height = 'auto';
  node.style.height = `${node.scrollHeight}px`;
}
import { Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function TemplatesView({
  templates,
  editingTemplates,
  expandedTemplateEditor,
  isAdminMode,
  isLoading,
  error,
  canManageTemplates,
  onCreateTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  onToggleTemplateEditor,
  onTemplateMetaChange,
  onTemplateFieldChange,
  onAddField,
  onRemoveField,
  onCancelTemplateEdit,
  onSaveTemplateEdit
}) {
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleOpenTemplate = templateId => {
    setActiveTemplateId(templateId);
  };

  const handleCloseModal = () => {
    if (activeTemplateId && editingTemplates[activeTemplateId]) {
      onCancelTemplateEdit(activeTemplateId);
    }
    setActiveTemplateId(null);
  };

  const handleImageFile = (file, templateId) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        onTemplateMetaChange(templateId, 'image', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, templateId) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file, templateId);
  };

  const handlePaste = (e, templateId) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file, templateId);
          }
          break;
        }
      }
    }
  };

  const modalTemplate = activeTemplateId ? templates.find(template => template.id === activeTemplateId) : null;
  const modalDraft = modalTemplate ? editingTemplates[modalTemplate.id] ?? modalTemplate : null;
  const modalEditing = modalTemplate && expandedTemplateEditor === modalTemplate.id;
  const iconProps = {
    size: 18,
    strokeWidth: 1.9,
  };
  const scrollLockRef = useRef(false);
  const isModalActive = Boolean(modalTemplate && modalDraft);


  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    if (isModalActive && !scrollLockRef.current) {
      document.body.classList.add('modal-open');
      scrollLockRef.current = true;
    } else if (!isModalActive && scrollLockRef.current) {
      document.body.classList.remove('modal-open');
      scrollLockRef.current = false;
    }
    return () => {
      if (scrollLockRef.current) {
        document.body.classList.remove('modal-open');
        scrollLockRef.current = false;
      }
    };
  }, [isModalActive]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Choose a template</h1>
          <p className="page-subtitle">
            Start from a curated prompt structure. You can customise the brand style once and reuse it across every
            generation.
          </p>
        </div>
        {canManageTemplates && isAdminMode && (
          <div className="page-actions">
            <button type="button" className="secondary" onClick={onCreateTemplate}>
              + New Template
            </button>
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p className="muted loading-block">Loading templates…</p>
      ) : templates.length ? (
        <div className="template-grid">
          {templates.map(template => (
            <article
              key={template.id}
              className="template-card"
              onClick={() => handleOpenTemplate(template.id)}
              role="button"
              tabIndex={0}
            >
              <div className="template-image" style={{ backgroundImage: `url(${template.image})` }} />
              <div className="template-body">
                <header className="template-heading">
                  <h2>{template.name}</h2>
                  <p>{template.description}</p>
                </header>
                <span className="template-open-hint">Tap to view details</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No templates yet</h2>
          <p className="muted">
            {canManageTemplates && isAdminMode
              ? 'Create your first template to kick things off. You can add fields and prompts in the editor.'
              : 'Your workspace does not have any templates yet. Check back later or ask an admin to add one.'}
          </p>
          {canManageTemplates && isAdminMode && (
            <div className="empty-actions">
              <button type="button" className="primary" onClick={onCreateTemplate}>
                + New Template
              </button>
            </div>
          )}
        </section>
      )}

      {modalTemplate && modalDraft && (
        <div className="template-modal" role="dialog" aria-modal="true">
          <div className="template-modal-backdrop" onClick={handleCloseModal} />
          <div className="template-modal-content">
            <button type="button" className="modal-close" onClick={handleCloseModal} aria-label="Close">
              <X {...iconProps} />
            </button>
            <div className="template-modal-body">
              <div className="template-modal-grid">
                <div className="template-modal-media">
                <img src={modalDraft.image} alt={`${modalDraft.name} preview`} />
              </div>
                <div className="template-modal-details">
                <header>
                  <h2>{modalDraft.name}</h2>
                  <p>{modalDraft.description}</p>
                </header>
                <div className="template-modal-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      onSelectTemplate(modalDraft.id);
                      handleCloseModal();
                    }}
                  >
                    Use Template
                  </button>
      {canManageTemplates && isAdminMode && (
        <div className="template-modal-admin">
          <button
            type="button"
            className={`icon-button ${modalEditing ? 'active' : ''}`}
            onClick={() => onToggleTemplateEditor(modalDraft)}
            aria-label={modalEditing ? 'Close editor' : 'Edit template'}
          >
            <Pencil {...iconProps} />
          </button>
          <button
            type="button"
            className="icon-button danger"
            onClick={() => {
              onDeleteTemplate(modalDraft.id);
              handleCloseModal();
            }}
            aria-label="Delete template"
          >
            <Trash2 {...iconProps} />
          </button>
        </div>
      )}
                </div>

                {canManageTemplates && isAdminMode && modalEditing && (
                  <div className="template-editor">
                    <div className="editor-group">
                      <label>
                        <span>Template Name</span>
                        <input
                          type="text"
                          value={modalDraft.name}
                          onChange={event => onTemplateMetaChange(modalDraft.id, 'name', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Description</span>
                        <textarea
                          value={modalDraft.description}
                          onChange={event => onTemplateMetaChange(modalDraft.id, 'description', event.target.value)}
                        />
                      </label>
                      <div>
                        <span style={{ display: 'block', marginBottom: '6px', fontSize: '0.95rem', color: 'var(--color-muted)' }}>
                          Preview Image
                        </span>
                        <div
                          className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, modalDraft.id)}
                          onPaste={(e) => handlePaste(e, modalDraft.id)}
                          onClick={() => fileInputRef.current?.click()}
                          tabIndex={0}
                          role="button"
                        >
                          {modalDraft.image ? (
                            <div className="image-upload-preview">
                              <img src={modalDraft.image} alt="Preview" />
                              <div className="image-upload-overlay">
                                <Upload size={20} />
                                <span>Click, drag, or paste to replace</span>
                              </div>
                            </div>
                          ) : (
                            <div className="image-upload-placeholder">
                              <ImageIcon size={32} strokeWidth={1.5} />
                              <p>Click to upload, drag & drop, or paste an image</p>
                              <span className="muted">PNG, JPG, GIF up to 10MB</span>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleImageFile(file, modalDraft.id);
                          }}
                        />
                      </div>
                      <label>
                        <span>Base Prompt</span>
                        <textarea
                          rows={4}
                          value={modalDraft.prompt}
                          onChange={event => onTemplateMetaChange(modalDraft.id, 'prompt', event.target.value)}
                        />
                      </label>
                    </div>

                    <div className="editor-fields">
                      <div className="editor-fields-header">
                        <h3>Form Fields</h3>
                        <button type="button" className='secondary' onClick={() => onAddField(modalDraft.id)}>
                          + Add Field
                        </button>
                      </div>
                      <div className="editor-field-list">
                        {modalDraft.fields.map(field => (
                          <div key={field.id} className="editor-field">
                            <div className="field-row">
                              <label>
                                <span>Label</span>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={event =>
                                    onTemplateFieldChange(modalDraft.id, field.id, 'label', event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                <span>Field Key</span>
                                <input
                                  type="text"
                                  value={field.key}
                                  onChange={event =>
                                    onTemplateFieldChange(modalDraft.id, field.id, 'key', event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                <span>Type</span>
                                <select
                                  value={field.type}
                                  onChange={event =>
                                    onTemplateFieldChange(modalDraft.id, field.id, 'type', event.target.value)
                                  }
                                >
                                  <option value="text">Single line</option>
                                  <option value="textarea">Multi line</option>
                                </select>
                              </label>
                            </div>
                            <label>
                              <span>Placeholder</span>
                              <input
                                type="text"
                                value={field.placeholder}
                                onChange={event =>
                                  onTemplateFieldChange(modalDraft.id, field.id, 'placeholder', event.target.value)
                                }
                              />
                            </label>
                            <div className="field-actions">
                              <button type="button" onClick={() => onRemoveField(modalDraft.id, field.id)}>
                                Remove field
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="editor-footer">
                      <button type="button" className="secondary" onClick={() => onCancelTemplateEdit(modalDraft.id)}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => {
                          onSaveTemplateEdit(modalDraft.id);
                          if (!modalEditing) {
                            onToggleTemplateEditor(modalDraft);
                          }
                        }}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
