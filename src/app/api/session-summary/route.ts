// pages/api/session-summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { messages } = req.body;

      // Convert messages to a summary text
      const summaryText = messages.map(
        (msg: any) => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`
      ).join('\n');

      // Generate a concise summary using Groq
      const summaryChatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Provide a concise, sensitive summary of the mental health conversation. Focus on key themes and emotional context without revealing specific details.'
          },
          {
            role: 'user',
            content: summaryText
          }
        ],
        model: ''
      });

      console.log('Session Summary:', summaryChatCompletion.choices[0]?.message?.content);

      res.status(200).json({ 
        success: true, 
        summary: summaryChatCompletion.choices[0]?.message?.content 
      });
    } catch (error) {
      console.error('Session Summary Error:', error);
      res.status(500).json({ error: 'Failed to generate session summary' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}