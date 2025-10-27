// IMPORTANT: This file has been updated to use the OpenRouter API instead of Gemini.
// The filename is kept as is to avoid breaking imports, but the functionality has changed.
import { type Message, Role } from '../types';

const API_KEY = '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';
const MODEL = 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageToGemini = async (newMessage: string, conversationHistory: Message[]): Promise<string> => {
  // Map our internal Message format to the OpenRouter API format
  const apiHistory = [
    {
      role: 'system',
      content: 'You are Maverick, a helpful and slightly witty AI assistant from IQROGUEREX. Keep your responses concise and friendly.'
    },
    ...conversationHistory
      .filter(msg => msg.role !== Role.Model || msg.text !== "Hello! I'm Maverick. I can help with code, answer questions, or just chat. What's on your mind?") // Filter out initial message for API
      .map(msg => ({
      role: msg.role === Role.User ? 'user' : 'assistant',
      content: msg.text
    })),
    { role: 'user', content: newMessage } // Add the new user message
  ];

  // Increased retries and initial delay to better handle heavy rate-limiting
  const maxRetries = 4;
  let delay = 3000; // Start with a 3-second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: apiHistory,
        })
      });

      // If the request was successful, process the response
      if (response.ok) {
        const data = await response.json();
        const botResponseText = data.choices[0]?.message?.content;

        if (!botResponseText) {
          throw new Error("Invalid response structure from API.");
        }

        return botResponseText;
      }

      // Handle rate-limiting error (429)
      if (response.status === 429) {
        if (attempt === maxRetries) {
          console.error(`API rate limit exceeded. All ${maxRetries} retries failed.`);
          // Updated error message to be more informative
          return "The model is currently experiencing high traffic and I couldn't get a response. This can happen with popular free models. Please try again in a few moments.";
        }
        
        const errorBody = await response.text();
        console.warn(`Rate limit hit (attempt ${attempt}/${maxRetries}). Retrying in ${delay / 1000}s...`);
        console.warn("Raw error:", errorBody);
        
        await sleep(delay);
        delay *= 2; // Double the delay for the next attempt (exponential backoff)
        continue; // Move to the next iteration of the loop
      }
      
      // Handle other non-OK HTTP statuses
      const errorBody = await response.text();
      console.error("OpenRouter API Error:", response.status, errorBody);
      throw new Error(`API request failed with status ${response.status}`);

    } catch (error) {
      console.error(`Error sending message to OpenRouter (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) {
        break; // Exit loop if max retries are reached on network errors etc.
      }
       await sleep(delay);
       delay *= 2;
    }
  }

  // This is reached if all retries fail
  return "I'm having a little trouble connecting. Please check your connection and try again.";
};
