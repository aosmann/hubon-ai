// Utility to call OpenAI's GPT-4o/gpt-image-1 API for image generation
// Set your API key in .env as VITE_OPENAI_API_KEY



export async function generateImage({ prompt }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');

  const body = {
    model: 'dall-e-3', // Using DALL-E 3 as gpt-image-1 may not be generally available
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
