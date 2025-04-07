import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const answerMyQuestion = async (prompt: string) => {
  const { textStream } = await streamText({
    model: google('gemini-1.5-flash'),
    prompt,
  });

  for await (const text of textStream) {
    process.stdout.write(text);
  }

  return textStream;
};

await answerMyQuestion('What is the color of the sun?');
