import { OPENAI_API_KEY } from "@env";
export async function generateImage(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      //TODO: Add your OpenAI API key here
      Authorization: `Bearer OPENAI_API_KEY`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "512x512",
    }),
  });

  const data = await response.json();
  console.log(data);
  return data.data[0].url;
}
