import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { config } from '../config/env.config';

const envConfig = config();

@Injectable()
export class GroqService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: envConfig.groq.apiKey,
    });
  }

  async generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const messages: any[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const completion = await this.client.chat.completions.create({
      model: options?.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateWorkoutPlan(userProfile: any, goal: string): Promise<string> {
    const systemPrompt = `You are an expert fitness coach. Generate personalized workout plans based on user profiles and goals. 
    Provide structured, actionable plans with exercises, sets, reps, and rest times.`;

    const prompt = `Generate a workout plan for:
    - Experience Level: ${userProfile.experienceLevel}
    - Goal: ${goal}
    - Available Days: ${userProfile.availableDays || 'Not specified'}
    
    Provide a detailed weekly plan with exercises, sets, reps, and rest times.`;

    return await this.generateCompletion(prompt, systemPrompt);
  }

  async summarizeTraining(sessions: any[]): Promise<string> {
    const systemPrompt = `You are a fitness analytics expert. Analyze workout data and provide insightful summaries.`;

    const prompt = `Summarize the following training sessions:
    ${JSON.stringify(sessions, null, 2)}
    
    Provide insights on:
    - Total volume and intensity
    - Muscle group distribution
    - Progress trends
    - Recommendations for improvement`;

    return await this.generateCompletion(prompt, systemPrompt);
  }

  async answerQuestion(question: string, context: any): Promise<string> {
    const systemPrompt = `You are a knowledgeable fitness assistant. Answer questions based on the user's training data.`;

    const prompt = `User Question: ${question}
    
    Context (User's Training Data):
    ${JSON.stringify(context, null, 2)}
    
    Provide a helpful, accurate answer.`;

    return await this.generateCompletion(prompt, systemPrompt);
  }
}
