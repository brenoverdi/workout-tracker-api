import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { GroqService } from '../../../services/groq.service';
import { WorkoutSession } from '../../session/model';
import { User } from '../../user/model';

@Injectable()
export class AnalyzeProgressService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private groqService: GroqService,
  ) {}

  async execute(
    userId: string,
    daysToAnalyze: number = 30,
  ): Promise<{ analysis: string; insights: any }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);

    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        sessionDate: MoreThanOrEqual(startDate),
      },
      relations: [
        'sessionExercises',
        'sessionExercises.exercise',
        'sessionExercises.sessionSets',
      ],
      order: { sessionDate: 'ASC' },
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (sessions.length === 0) {
      return {
        analysis:
          'No completed workouts found in the specified period. Start logging your workouts to get personalized insights!',
        insights: {
          workoutsAnalyzed: 0,
          period: `${daysToAnalyze} days`,
        },
      };
    }

    // Prepare training data summary
    const trainingData = sessions.map((session) => {
      const totalVolume = session.sessionExercises.reduce((vol, se) => {
        return (
          vol +
          se.sessionSets.reduce(
            (svol, set) => svol + Number(set.weight) * set.reps,
            0,
          )
        );
      }, 0);

      return {
        date: session.sessionDate,
        duration: session.duration,
        volume: totalVolume,
        exercises: session.sessionExercises.map((se) => ({
          name: se.exercise.name,
          muscleGroups: se.exercise.muscleGroups,
          sets: se.sessionSets.length,
          topWeight: Math.max(
            ...se.sessionSets.map((sl) => Number(sl.weight)),
            0,
          ),
        })),
      };
    });

    const totalPeriodVolume = trainingData.reduce(
      (sum, s) => sum + s.volume,
      0,
    );
    const averageDuration = Math.round(
      trainingData.reduce((sum, s) => sum + (s.duration || 0), 0) /
        sessions.length,
    );

    const systemPrompt = `You are an expert fitness coach and data analyst.
Analyze the user's training data and provide actionable insights.
Be encouraging but honest about areas for improvement.
Focus on patterns, consistency, progress, and recommendations.`;

    const prompt = `Analyze the following training data from the last ${daysToAnalyze} days:

**User Profile:**
- Experience Level: ${user?.experienceLevel || 'intermediate'}
- Goal: General fitness improvement

**Training Summary:**
- Total workouts: ${sessions.length}
- Average duration: ${averageDuration} minutes
- Total volume lifted: ${totalPeriodVolume} kg

**Detailed Sessions:**
${JSON.stringify(trainingData.slice(-10), null, 2)}

Please provide:
1. **Consistency Analysis**: How consistent is the training?
2. **Volume Progression**: Is the training volume increasing over time?
3. **Muscle Balance**: Are all muscle groups being trained adequately?
4. **Strengths**: What is the user doing well?
5. **Areas for Improvement**: What could be better?
6. **Recommendations**: Specific, actionable suggestions for the next 2 weeks.`;

    const analysis = await this.groqService.generateCompletion(
      prompt,
      systemPrompt,
    );

    const insights = {
      workoutsAnalyzed: sessions.length,
      period: `${daysToAnalyze} days`,
      totalVolume: totalPeriodVolume,
      averageDuration,
      workoutsPerWeek:
        Math.round((sessions.length / (daysToAnalyze / 7)) * 10) / 10,
    };

    return { analysis, insights };
  }
}
