import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { GroqService } from '../../../services/groq.service';
import { WorkoutSession } from '../../session/model';
import { User } from '../../user/model';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private groqService: GroqService,
  ) {}

  async execute(question: string, userId: string): Promise<{ answer: string }> {
    // Get recent training context
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [sessions, user] = await Promise.all([
      this.sessionRepository.find({
        where: {
          userId,
          sessionDate: MoreThanOrEqual(thirtyDaysAgo),
        },
        relations: [
          'sessionExercises',
          'sessionExercises.exercise',
          'sessionExercises.sessionSets',
        ],
        order: { sessionDate: 'DESC' },
        take: 10,
      }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    // Build context from training data
    const trainingContext =
      sessions.length > 0
        ? {
            recentWorkouts: sessions.length,
            totalVolume: sessions.reduce((sum, s) => {
              return (
                sum +
                s.sessionExercises.reduce((seVol, se) => {
                  return (
                    seVol +
                    se.sessionSets.reduce(
                      (ssVol, ss) => ssVol + Number(ss.weight) * ss.reps,
                      0,
                    )
                  );
                }, 0)
              );
            }, 0),
            averageDuration: Math.round(
              sessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
                sessions.length,
            ),
            muscleGroupsTrained: [
              ...new Set(
                sessions.flatMap((s) =>
                  s.sessionExercises.flatMap((se) => se.exercise.muscleGroups),
                ),
              ),
            ],
            lastWorkout: sessions[0]
              ? {
                  date: sessions[0].sessionDate,
                  exercises: sessions[0].sessionExercises.map(
                    (se) => se.exercise.name,
                  ),
                }
              : null,
          }
        : null;

    const systemPrompt = `You are a friendly and knowledgeable AI fitness coach.
Answer questions about fitness, training, nutrition, and recovery.
When relevant, reference the user's training data to provide personalized advice.
Be encouraging, supportive, and provide actionable recommendations.
Keep responses concise but helpful.`;

    const prompt = `User Question: "${question}"

**User Profile:**
- Experience Level: ${user?.experienceLevel || 'Not specified'}
- Age: ${user?.age || 'Not specified'}

**Recent Training Data (last 30 days):**
${trainingContext ? JSON.stringify(trainingContext, null, 2) : 'No recent training data available'}

Please provide a helpful, personalized answer to the user's question.`;

    const answer = await this.groqService.generateCompletion(
      prompt,
      systemPrompt,
      {
        maxTokens: 1024,
      },
    );

    return { answer };
  }
}
