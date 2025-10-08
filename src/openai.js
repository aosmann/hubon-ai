// Utility to call OpenAI's GPT-4o/gpt-image-1 API for image generation
// Set your API key in .env as VITE_OPENAI_API_KEY

function dataUrlToBlob(dataUrl, fallbackType = 'image/png') {
  if (typeof dataUrl !== 'string' || !dataUrl.includes(',')) return null;
  const [meta, base64Data] = dataUrl.split(',');
  if (!base64Data) return null;
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : fallbackType;
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function generateImage({ prompt, logoAsset = null, useGptImage = false }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');

  if (useGptImage && logoAsset?.dataUrl) {
    const blob = dataUrlToBlob(logoAsset.dataUrl, logoAsset.type || 'image/png');
    if (!blob) {
      throw new Error('Unable to prepare uploaded logo for GPT Image request.');
    }

    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    const filename = logoAsset.name || 'brand-logo.png';
    formData.append('image[]', blob, filename);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate image';
      try {
        const err = await response.json();
        if (err?.error?.message) errorMessage = err.error.message;
      } catch (parseErr) {
        console.error('Unable to parse GPT Image error response', parseErr);
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  const body = {
    model: useGptImage ? 'gpt-image-1' : 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json'
  };

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to generate image');
  }
  return response.json();
}
