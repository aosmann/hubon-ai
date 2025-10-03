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
        {canManageTemplates && (
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
          {templates.map(template => {
            const draft = editingTemplates[template.id] ?? template;
            const isExpanded = expandedTemplateEditor === template.id;
            return (
              <article key={template.id} className="template-card">
                <div className="template-image" style={{ backgroundImage: `url(${template.image})` }} />
              <div className="template-body">
                <header className="template-heading">
                  <h2>{template.name}</h2>
                  <p>{template.description}</p>
                </header>
                <div className="template-actions">
                  <button type="button" className="primary" onClick={() => onSelectTemplate(template.id)}>
                    Use Template
                  </button>
                  {canManageTemplates && isAdminMode && (
                    <button type="button" className="secondary" onClick={() => onToggleTemplateEditor(template)}>
                      {isExpanded ? 'Close Editor' : 'Edit Template'}
                    </button>
                  )}
                  {canManageTemplates && isAdminMode && (
                    <button type="button" className="danger" onClick={() => onDeleteTemplate(template.id)}>
                      Delete
                    </button>
                  )}
                </div>
                {canManageTemplates && isAdminMode && isExpanded && (
                  <div className="template-editor">
                    <div className="editor-group">
                      <label>
                        <span>Template Name</span>
                        <input
                          type="text"
                          value={draft.name}
                          onChange={event => onTemplateMetaChange(template.id, 'name', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Description</span>
                        <textarea
                          value={draft.description}
                          onChange={event => onTemplateMetaChange(template.id, 'description', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Preview Image URL</span>
                        <input
                          type="text"
                          value={draft.image}
                          onChange={event => onTemplateMetaChange(template.id, 'image', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Base Prompt</span>
                        <textarea
                          rows={4}
                          value={draft.prompt}
                          onChange={event => onTemplateMetaChange(template.id, 'prompt', event.target.value)}
                        />
                      </label>
                    </div>

                    <div className="editor-fields">
                      <div className="editor-fields-header">
                        <h3>Form Fields</h3>
                        <button type="button" onClick={() => onAddField(template.id)}>
                          + Add Field
                        </button>
                      </div>
                      <div className="editor-field-list">
                        {draft.fields.map(field => (
                          <div key={field.id} className="editor-field">
                            <div className="field-row">
                              <label>
                                <span>Label</span>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={event =>
                                    onTemplateFieldChange(template.id, field.id, 'label', event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                <span>Field Key</span>
                                <input
                                  type="text"
                                  value={field.key}
                                  onChange={event =>
                                    onTemplateFieldChange(template.id, field.id, 'key', event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                <span>Type</span>
                                <select
                                  value={field.type}
                                  onChange={event =>
                                    onTemplateFieldChange(template.id, field.id, 'type', event.target.value)
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
                                  onTemplateFieldChange(template.id, field.id, 'placeholder', event.target.value)
                                }
                              />
                            </label>
                            <div className="field-actions">
                              <button type="button" onClick={() => onRemoveField(template.id, field.id)}>
                                Remove field
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="editor-footer">
                      <button type="button" className="secondary" onClick={() => onCancelTemplateEdit(template.id)}>
                        Cancel
                      </button>
                      <button type="button" className="primary" onClick={() => onSaveTemplateEdit(template.id)}>
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      ) : (
        <section className="empty-state">
          <h2>No templates yet</h2>
          <p className="muted">
            {canManageTemplates
              ? 'Create your first template to kick things off. You can add fields and prompts in the editor.'
              : 'Your workspace does not have any templates yet. Check back later or ask an admin to add one.'}
          </p>
          {canManageTemplates && (
            <div className="empty-actions">
              <button type="button" className="primary" onClick={onCreateTemplate}>
                + New Template
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
