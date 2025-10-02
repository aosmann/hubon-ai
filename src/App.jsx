import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateImage } from './openai.js';
import HeaderNav from './components/HeaderNav.jsx';
import HomeView from './components/HomeView.jsx';
import TemplatesView from './components/TemplatesView.jsx';
import BrandView from './components/BrandView.jsx';
import GenerateView from './components/GenerateView.jsx';
import AuthView from './components/AuthView.jsx';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import './App.css';

const adminEmailEnv = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(entry => entry.trim().toLowerCase())
  .filter(Boolean);
const imageBucketName = import.meta.env.VITE_SUPABASE_IMAGE_BUCKET || 'generated-images';

const defaultTemplates = [
  {
    id: 'social_launch',
    name: 'Social Launch Graphic',
    description: 'Bold social media announcement with product hero, short copy, and clean background.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    prompt:
      'Create a high-impact social media graphic suitable for Instagram. Use layered lighting, dynamic angles, and a polished digital aesthetic. Feature the product hero prominently with subtle glow and depth.',
    fields: [
      {
        id: 'headline',
        key: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Launching Nimbus 2.0 today'
      },
      {
        id: 'supporting_copy',
        key: 'supporting_copy',
        label: 'Supporting Copy',
        type: 'textarea',
        placeholder: 'Share highlights, value props, or launch details.'
      },
      {
        id: 'call_to_action',
        key: 'call_to_action',
        label: 'Call To Action',
        type: 'text',
        placeholder: 'Tap to explore'
      }
    ]
  },
  {
    id: 'product_spotlight',
    name: 'Product Spotlight',
    description: 'Detailed product showcase for ecommerce tiles or ads with close-up focus.',
    image:
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=800&q=80',
    prompt:
      'Produce a premium ecommerce product spotlight with dramatic studio lighting, crisp reflections, and minimal props. Highlight materials and craft with macro details.',
    fields: [
      {
        id: 'product_name',
        key: 'product_name',
        label: 'Product Name',
        type: 'text',
        placeholder: 'Nimbus Studio headphones'
      },
      {
        id: 'key_features',
        key: 'key_features',
        label: 'Key Features',
        type: 'textarea',
        placeholder: 'List the differentiators or specs you want to show.'
      },
      {
        id: 'background_direction',
        key: 'background_direction',
        label: 'Background Direction',
        type: 'text',
        placeholder: 'Soft gradient with floating particles'
      }
    ]
  },
  {
    id: 'website_hero',
    name: 'Website Hero Banner',
    description: 'Wide hero visual for landing pages with compositional balance for text overlays.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    prompt:
      'Design a web hero scene with ample negative space for text overlays, cinematic lighting, and layered depth. Lean into modern gradients, set design, or subtle 3D elements.',
    fields: [
      {
        id: 'hero_headline',
        key: 'hero_headline',
        label: 'Hero Headline',
        type: 'text',
        placeholder: 'Design systems that scale'
      },
      {
        id: 'hero_subheadline',
        key: 'hero_subheadline',
        label: 'Subheadline',
        type: 'textarea',
        placeholder: 'Describe the product promise or mission in one sentence.'
      },
      {
        id: 'visual_elements',
        key: 'visual_elements',
        label: 'Visual Elements',
        type: 'text',
        placeholder: 'Floating interface panels, neon accents, soft gradients'
      }
    ]
  }
];

const brandStyleSchema = [
  {
    key: 'brandName',
    label: 'Brand Name',
    type: 'text',
    placeholder: 'Nimbus Studio'
  },
  {
    key: 'logoUrl',
    label: 'Logo URL',
    type: 'text',
    placeholder: 'https://assets.nimbus.studio/logo.svg'
  },
  {
    key: 'voice',
    label: 'Voice & Tone',
    type: 'textarea',
    placeholder: 'Bold, optimistic, rooted in innovation with a touch of playfulness.'
  },
  {
    key: 'visualGuidelines',
    label: 'Visual Guidelines',
    type: 'textarea',
    placeholder: 'Color palette, textures, lighting direction, iconography, etc.'
  },
  {
    key: 'typography',
    label: 'Typography Preferences',
    type: 'text',
    placeholder: 'Geometric sans-serif, condensed headings, high legibility body copy.'
  },
  {
    key: 'keywords',
    label: 'Keywords',
    type: 'textarea',
    placeholder: 'Comma-separated brand attributes you want injected into every prompt.'
  }
];

const emptyBrandStyle = brandStyleSchema.reduce((acc, field) => {
  acc[field.key] = '';
  return acc;
}, {});

function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template));
}

function ViewLayout({ className = '', children }) {
  const classes = ['page'];
  if (className) classes.push(className);
  return <section className={classes.join(' ')}>{children}</section>;
}

function base64ToBlob(base64, contentType = 'image/png') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authMode, setAuthMode] = useState('sign_in');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState('');

  const [brandStyle, setBrandStyle] = useState(emptyBrandStyle);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateFormValues, setTemplateFormValues] = useState({});
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [expandedTemplateEditor, setExpandedTemplateEditor] = useState(null);
  const [editingTemplates, setEditingTemplates] = useState({});
  const [imageResult, setImageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');
  const [configError, setConfigError] = useState('');

  const selectedTemplate = useMemo(
    () => templates.find(template => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const normaliseTemplate = useCallback(template => {
    if (!template) return null;
    return {
      id: template.id,
      name: template.name ?? '',
      description: template.description ?? '',
      image: template.image ?? '',
      prompt: template.prompt ?? '',
      fields: Array.isArray(template.fields) ? template.fields : []
    };
  }, [supabase]);

  const fetchTemplates = useCallback(async () => {
    if (!user || !supabase) return;
    setTemplatesLoading(true);
    setTemplatesError('');
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Failed to load templates', error);
      setTemplatesError('Unable to load templates from Supabase.');
      setTemplates([]);
    } else {
      setTemplates((data ?? []).map(entry => normaliseTemplate(entry)).filter(Boolean));
    }
    setTemplatesLoading(false);
  }, [normaliseTemplate, supabase, user]);

  const fetchBrandStyle = useCallback(async () => {
    if (!user || !supabase) return;
    setBrandLoading(true);
    setBrandError('');
    const { data, error } = await supabase
      .from('brand_styles')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load brand style', error);
      setBrandError('Unable to load brand style from Supabase.');
    }
    const payload = data?.data && typeof data.data === 'object' ? data.data : emptyBrandStyle;
    setBrandStyle({ ...emptyBrandStyle, ...payload });
    setBrandLoading(false);
  }, [supabase, user]);

  const fetchHistory = useCallback(async () => {
    if (!user || !supabase) return;
    setHistoryLoading(true);
    setHistoryError('');
    const { data, error } = await supabase
      .from('image_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) {
      console.error('Failed to load history', error);
      setHistoryError('Unable to load recent generations.');
      setHistory([]);
    } else {
      setHistory(
        (data ?? []).map(entry => ({
          id: entry.id,
          url: entry.image_url,
          previewUrl: entry.image_preview || entry.image_url,
          prompt: entry.prompt,
          templateId: entry.template_id,
          templateName: entry.template_name,
          createdAt: entry.created_at,
          formValues: entry.form_values || {}
        }))
      );
    }
    setHistoryLoading(false);
  }, [supabase, user]);

  const fetchProfile = useCallback(async () => {
    if (!user || !supabase) return;
    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load profile', error);
    }
    if (!data) {
      const { data: inserted, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email ?? null }, { onConflict: 'id' })
        .select('id, email, is_admin')
        .maybeSingle();
      if (upsertError) {
        console.error('Failed to upsert profile', upsertError);
        setProfile(null);
      } else {
        setProfile(inserted ?? null);
      }
    } else {
      setProfile(data);
    }
    setProfileLoading(false);
  }, [supabase, user]);

  const isAdmin = useMemo(() => {
    if (profile?.is_admin) return true;
    if (!user?.email) return false;
    if (!adminEmailEnv.length) return false;
    return adminEmailEnv.includes(user.email.toLowerCase());
  }, [profile, user]);

  useEffect(() => {
    if (!globalMessage) return undefined;
    const timer = setTimeout(() => setGlobalMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [globalMessage]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setConfigError('Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setAuthInitialized(true);
      return;
    }

    let isMounted = true;

    async function initialiseAuth() {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        console.warn('Failed to get Supabase session', error);
      }
      setUser(data?.session?.user ?? null);
      setAuthInitialized(true);
    }

    initialiseAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authInitialized) return;
    if (!isSupabaseConfigured || !supabase) return;
    if (!user) {
      setTemplates([]);
      setTemplatesError('');
      setBrandStyle(emptyBrandStyle);
      setBrandError('');
      setHistory([]);
      setHistoryError('');
      setProfile(null);
      setActiveView('home');
      setSelectedTemplateId(null);
      setIsAdminMode(false);
      setEditingTemplates({});
      setExpandedTemplateEditor(null);
      return;
    }

    fetchTemplates();
    fetchBrandStyle();
    fetchHistory();
    fetchProfile();
  }, [authInitialized, fetchBrandStyle, fetchHistory, fetchProfile, fetchTemplates, user]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setTemplateFormValues(prev => {
      const next = {};
      selectedTemplate.fields.forEach(field => {
        next[field.key] = Object.prototype.hasOwnProperty.call(prev, field.key) ? prev[field.key] : '';
      });
      return next;
    });
  }, [selectedTemplate]);

  const brandStyleSummary = useMemo(() => {
    return brandStyleSchema
      .map(field => {
        const rawValue = brandStyle[field.key] ?? '';
        if (!rawValue || rawValue.trim().length === 0) return null;
        const trimmed = rawValue.trim();
        if (field.key === 'logoUrl') {
          return {
            label: 'Brand Logo Reference',
            value: `Use this logo asset: ${trimmed}`
          };
        }
        return {
          label: field.label,
          value: trimmed
        };
      })
      .filter(Boolean);
  }, [brandStyle]);

  const promptPreview = useMemo(() => {
    if (!selectedTemplate) return '';
    const fieldText = selectedTemplate.fields
      .map(field => {
        const value = templateFormValues[field.key]?.trim();
        if (!value) return null;
        return `${field.label}: ${value}`;
      })
      .filter(Boolean)
      .join('\n');

    const brandText = brandStyleSummary.length
      ? `Brand Style Guidelines:\n${brandStyleSummary
          .map(entry => `${entry.label}: ${entry.value.trim()}`)
          .join('\n')}`
      : '';

    return [selectedTemplate.prompt, fieldText, brandText]
      .filter(section => section && section.trim().length > 0)
      .join('\n\n');
  }, [selectedTemplate, templateFormValues, brandStyleSummary]);

  const isGenerateDisabled = useMemo(() => {
    if (!selectedTemplate) return true;
    const missingField = selectedTemplate.fields.some(field => !templateFormValues[field.key]?.trim());
    return missingField || loading;
  }, [selectedTemplate, templateFormValues, loading]);

  function resetToTemplates() {
    setActiveView('templates');
    setSelectedTemplateId(null);
    setTemplateFormValues({});
    setImageResult(null);
    setGenerateError('');
  }

  function goHome() {
    setActiveView('home');
    setIsAdminMode(false);
    setExpandedTemplateEditor(null);
    setEditingTemplates({});
    setGenerateError('');
    setLoading(false);
  }

  function showBrandView() {
    setActiveView('brand');
    setIsAdminMode(false);
    setExpandedTemplateEditor(null);
    setEditingTemplates({});
    setGenerateError('');
    setLoading(false);
  }

  function toggleAdminMode() {
    if (!isAdmin) return;
    setIsAdminMode(prev => !prev);
    setExpandedTemplateEditor(null);
    setEditingTemplates({});
  }

  function handleSelectTemplate(templateId) {
    setSelectedTemplateId(templateId);
    setActiveView('generate');
    setImageResult(null);
    setGenerateError('');
  }

  function handleTemplateFormChange(key, value) {
    setTemplateFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function handleOpenImage(url) {
    if (typeof window === 'undefined' || !url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleReuseHistoryEntry(entry) {
    if (!entry) return;
    const templateExists = templates.some(template => template.id === entry.templateId);
    if (!templateExists) return;
    setSelectedTemplateId(entry.templateId);
    setTemplateFormValues(entry.formValues ?? {});
    setActiveView('generate');
    setImageResult({ ...entry, url: entry.previewUrl || entry.url });
    setGenerateError('');
    setLoading(false);
  }

  function handleBrandStyleChange(key, value) {
    setBrandError('');
    setBrandStyle(prev => ({
      ...prev,
      [key]: value
    }));
  }

  async function handleBrandStyleSubmit() {
    if (!user || !supabase) return;
    setBrandSaving(true);
    setBrandError('');
    const payload = {
      user_id: user.id,
      data: brandStyle,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('brand_styles').upsert(payload);
    if (error) {
      console.error('Failed to save brand style', error);
      setBrandError('Unable to save brand style.');
    } else {
      setGlobalMessage('Brand style saved.');
      resetToTemplates();
    }
    setBrandSaving(false);
  }

  function handleAuthFormChange(field, value) {
    setAuthForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleAuthModeChange(nextMode) {
    setAuthMode(nextMode);
    setAuthError('');
  }

  async function handleAuthSubmit() {
    const email = authForm.email.trim();
    const password = authForm.password;
    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'sign_up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setGlobalMessage('Check your inbox to confirm your email before signing in.');
        setAuthMode('sign_in');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        setGlobalMessage('Signed in successfully.');
      }
      setAuthForm({ email: '', password: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Failed to sign out', error);
      setGlobalMessage('Sign out failed. Please try again.');
    } else {
      setGlobalMessage('Signed out.');
    }
  }

  function normalizeFieldKey(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .trim();
  }

  function updateTemplateDraft(templateId, updater) {
    setEditingTemplates(prev => {
      const draft = prev[templateId];
      if (!draft) return prev;
      const nextDraft = updater(cloneTemplate(draft));
      return {
        ...prev,
        [templateId]: nextDraft
      };
    });
  }

  function handleTemplateMetaChange(templateId, key, value) {
    updateTemplateDraft(templateId, draft => ({
      ...draft,
      [key]: value
    }));
  }

  useEffect(() => {
    if (!isAdmin) {
      setIsAdminMode(false);
      setExpandedTemplateEditor(null);
      setEditingTemplates({});
    }
  }, [isAdmin]);

  function handleTemplateFieldChange(templateId, fieldId, key, value) {
    updateTemplateDraft(templateId, draft => ({
      ...draft,
      fields: draft.fields.map(field => {
        if (field.id !== fieldId) return field;
        if (key === 'key') {
          const safeKey = normalizeFieldKey(value || field.key);
          return {
            ...field,
            key: safeKey || field.key
          };
        }
        return {
          ...field,
          [key]: value
        };
      })
    }));
  }

  function handleAddField(templateId) {
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `field_${Date.now()}`;
    const safeId = normalizeFieldKey(randomId) || `field_${Date.now()}`;
    const newField = {
      id: safeId,
      key: safeId,
      label: 'New Field',
      type: 'text',
      placeholder: 'Describe what should go here'
    };
    updateTemplateDraft(templateId, draft => ({
      ...draft,
      fields: [...draft.fields, newField]
    }));
  }

  function handleRemoveField(templateId, fieldId) {
    updateTemplateDraft(templateId, draft => ({
      ...draft,
      fields: draft.fields.filter(field => field.id !== fieldId)
    }));
  }

  async function handleCreateTemplate() {
    if (!isAdmin || !user || !supabase) return;
    setTemplatesError('');
    const payload = {
      name: 'New Template',
      description: 'Describe the intended use for this template.',
      image: '',
      prompt: '',
      fields: [],
      created_by: user.id
    };
    const { data, error } = await supabase.from('templates').insert(payload).select().maybeSingle();
    if (error) {
      console.error('Failed to create template', error);
      setTemplatesError('Unable to create a new template.');
      return;
    }
    const normalised = normaliseTemplate(data);
    if (!normalised?.id) {
      await fetchTemplates();
      return;
    }
    setTemplates(current => {
      const next = [...current.filter(template => template.id !== normalised.id), normalised];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setIsAdminMode(true);
    setEditingTemplates(prev => ({
      ...prev,
      [normalised.id]: cloneTemplate(normalised)
    }));
    setExpandedTemplateEditor(normalised.id);
    setActiveView('templates');
    setGlobalMessage('Template created.');
  }

  async function handleDeleteTemplate(templateId) {
    if (!isAdmin || !user || !supabase) return;
    setTemplatesError('');
    const { error } = await supabase.from('templates').delete().eq('id', templateId);
    if (error) {
      console.error('Failed to delete template', error);
      setTemplatesError('Unable to delete template.');
      return;
    }
    setTemplates(current => current.filter(template => template.id !== templateId));
    setEditingTemplates(prev => {
      const next = { ...prev };
      delete next[templateId];
      return next;
    });
    if (selectedTemplateId === templateId) {
      resetToTemplates();
    }
    setGlobalMessage('Template deleted.');
  }

  function handleToggleTemplateEditor(template) {
    if (!isAdmin) return;
    setExpandedTemplateEditor(prev => {
      if (prev === template.id) {
        setEditingTemplates(current => {
          const next = { ...current };
          delete next[template.id];
          return next;
        });
        return null;
      }
      setEditingTemplates(current => ({
        ...current,
        [template.id]: cloneTemplate(template)
      }));
      return template.id;
    });
  }

  function handleCancelTemplateEdit(templateId) {
    setExpandedTemplateEditor(prev => (prev === templateId ? null : prev));
    setEditingTemplates(prev => {
      const next = { ...prev };
      delete next[templateId];
      return next;
    });
  }

  async function handleSaveTemplateEdit(templateId) {
    const draft = editingTemplates[templateId];
    if (!draft || !isAdmin || !supabase) return;
    setTemplatesError('');
    const payload = {
      name: draft.name,
      description: draft.description,
      image: draft.image,
      prompt: draft.prompt,
      fields: draft.fields
    };
    const { data, error } = await supabase
      .from('templates')
      .update(payload)
      .eq('id', templateId)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Failed to save template', error);
      setTemplatesError('Unable to save template changes.');
      return;
    }
    const updated = data ? normaliseTemplate(data) : draft;
    setTemplates(current => {
      const next = current.map(template => (template.id === templateId ? updated : template));
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditingTemplates(prev => {
      const next = { ...prev };
      delete next[templateId];
      return next;
    });
    setExpandedTemplateEditor(currentExpanded => (currentExpanded === templateId ? null : currentExpanded));
    setGlobalMessage('Template saved.');
  }

  useEffect(() => {
    if (!isAdminMode) {
      setExpandedTemplateEditor(null);
      setEditingTemplates({});
    }
  }, [isAdminMode]);

  async function handleGenerate() {
    if (!selectedTemplate || !promptPreview || !user) return;
    setLoading(true);
    setGenerateError('');
    setImageResult(null);
    try {
      const response = await generateImage({ prompt: promptPreview });
      const base64Image = response?.data?.[0]?.b64_json || null;
      if (!base64Image) {
        throw new Error('No image returned from the API.');
      }
      const dataUrl = `data:image/png;base64,${base64Image}`;
      const formValuesSnapshot = selectedTemplate.fields.reduce((acc, field) => {
        acc[field.key] = templateFormValues[field.key] ?? '';
        return acc;
      }, {});
      const entryId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `history_${Date.now()}`;
      const createdAt = new Date().toISOString();
      let storedImageUrl = dataUrl;

      if (supabase && imageBucketName) {
        try {
          const blob = base64ToBlob(base64Image);
          const filePath = `${user.id}/${entryId}.png`;
          const { error: uploadError } = await supabase.storage
            .from(imageBucketName)
            .upload(filePath, blob, {
              cacheControl: '3600',
              contentType: 'image/png',
              upsert: true
            });
          if (uploadError) {
            console.error('Failed to upload image to Supabase storage', uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage.from(imageBucketName).getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              storedImageUrl = publicUrlData.publicUrl;
            }
          }
        } catch (uploadErr) {
          console.error('Unexpected error uploading image to Supabase storage', uploadErr);
        }
      }

      const historyEntry = {
        id: entryId,
        url: storedImageUrl,
        previewUrl: dataUrl,
        prompt: promptPreview,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        createdAt,
        formValues: formValuesSnapshot
      };
      if (supabase) {
        const { error: insertError } = await supabase.from('image_history').insert({
          id: entryId,
          user_id: user.id,
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          prompt: promptPreview,
          form_values: formValuesSnapshot,
          image_url: storedImageUrl,
          created_at: createdAt
        });
        if (insertError) {
          console.error('Failed to persist history', insertError);
        }
      }
      setHistory(prev => {
        const base = Array.isArray(prev) ? prev : [];
        const next = [historyEntry, ...base];
        return next.slice(0, 30);
      });
      setImageResult({ ...historyEntry, url: dataUrl, storedUrl: storedImageUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image.';
      setGenerateError(message);
    } finally {
      setLoading(false);
    }
  }

  const homeViewComponent = (
    <HomeView
      history={history}
      templates={templates}
      onBrowseTemplates={resetToTemplates}
      onOpenImage={handleOpenImage}
      onReuseHistoryEntry={handleReuseHistoryEntry}
      isLoading={historyLoading}
      error={historyError}
    />
  );

  let viewClassName = '';
  let viewContent = null;

  if (!authInitialized) {
    viewClassName = 'auth-view';
    viewContent = (
      <div className="loading-block" role="status">
        Initialising workspace…
      </div>
    );
  } else if (configError) {
    viewClassName = 'auth-view';
    viewContent = (
      <div className="config-error">
        <h1>Configuration required</h1>
        <p className="muted">Supabase environment variables are missing. Set them and redeploy.</p>
      </div>
    );
  } else if (!user) {
    viewClassName = 'auth-view';
    viewContent = (
      <AuthView
        mode={authMode}
        onModeChange={handleAuthModeChange}
        onSubmit={handleAuthSubmit}
        formValues={authForm}
        onChange={handleAuthFormChange}
        error={authError}
        loading={authLoading}
      />
    );
  } else if (activeView === 'home') {
    viewClassName = 'home-view';
    viewContent = homeViewComponent;
  } else if (activeView === 'templates') {
    viewClassName = 'templates-view';
    viewContent = (
      <TemplatesView
        templates={templates}
        editingTemplates={editingTemplates}
        expandedTemplateEditor={expandedTemplateEditor}
        isAdminMode={isAdminMode}
        isLoading={templatesLoading}
        error={templatesError}
        canManageTemplates={isAdmin && !profileLoading}
        onCreateTemplate={handleCreateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSelectTemplate={handleSelectTemplate}
        onToggleTemplateEditor={handleToggleTemplateEditor}
        onTemplateMetaChange={handleTemplateMetaChange}
        onTemplateFieldChange={handleTemplateFieldChange}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
        onCancelTemplateEdit={handleCancelTemplateEdit}
        onSaveTemplateEdit={handleSaveTemplateEdit}
      />
    );
  } else if (activeView === 'brand') {
    viewClassName = 'brand-view';
    viewContent = (
      <BrandView
        brandStyleSchema={brandStyleSchema}
        brandStyle={brandStyle}
        onChange={handleBrandStyleChange}
        onSubmit={handleBrandStyleSubmit}
        loading={brandLoading}
        isSaving={brandSaving}
        error={brandError}
      />
    );
  } else if (activeView === 'generate' && selectedTemplate) {
    viewClassName = 'generate-view';
    viewContent = (
      <GenerateView
        selectedTemplate={selectedTemplate}
        templateFormValues={templateFormValues}
        onTemplateFormChange={handleTemplateFormChange}
        onGenerate={handleGenerate}
        isGenerateDisabled={isGenerateDisabled}
        loading={loading}
        error={generateError}
        brandStyleSummary={brandStyleSummary}
        promptPreview={promptPreview}
        imageResult={imageResult}
        onBack={resetToTemplates}
        onEditBrand={showBrandView}
        onOpenImage={handleOpenImage}
      />
    );
  }

  if (user && !viewContent) {
    viewClassName = 'home-view';
    viewContent = homeViewComponent;
  }

  return (
    <div className="app-shell">
      {configError || !authInitialized ? null : (
        <HeaderNav
          activeView={activeView}
          isAdminMode={isAdminMode}
          canEditTemplates={isAdmin && !profileLoading}
          user={user}
          onHome={goHome}
          onTemplates={resetToTemplates}
          onBrand={showBrandView}
          onToggleAdmin={toggleAdminMode}
          onLogout={handleLogout}
        />
      )}
      <main className="page-area">
        {globalMessage && <div className="app-banner success">{globalMessage}</div>}
        {configError && <div className="app-banner error">{configError}</div>}
        {viewContent && <ViewLayout className={viewClassName}>{viewContent}</ViewLayout>}
      </main>
    </div>
  );
}
