declare module '@env' {
    export const OPENAI_API_KEY: string;
  }
export async function generateImage(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '512x512',
    }),
  });

  const data = await response.json();
  return data.data[0].url;
}