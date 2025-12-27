import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { Exercise } from '../../exercise/model';

const EXERCISES_INDEX = 'exercises';

@Injectable()
export class IndexExerciseService {
  constructor(private elasticsearchService: ElasticsearchService) {}

  async createIndex(): Promise<void> {
    const mappings = {
      properties: {
        id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'standard' },
        description: { type: 'text', analyzer: 'standard' },
        muscleGroups: { type: 'keyword' },
        equipmentType: { type: 'keyword' },
        instructions: { type: 'text', analyzer: 'standard' },
        difficultyLevel: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    await this.elasticsearchService.createIndex(EXERCISES_INDEX, mappings);
  }

  async indexExercise(exercise: Exercise): Promise<void> {
    await this.elasticsearchService.indexDocument(
      EXERCISES_INDEX,
      exercise.id,
      {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        muscleGroups: exercise.muscleGroups,
        equipmentType: exercise.equipmentType,
        instructions: exercise.instructions,
        difficultyLevel: exercise.difficultyLevel,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
    );
  }

  async updateExercise(exercise: Exercise): Promise<void> {
    await this.elasticsearchService.updateDocument(
      EXERCISES_INDEX,
      exercise.id,
      {
        name: exercise.name,
        description: exercise.description,
        muscleGroups: exercise.muscleGroups,
        equipmentType: exercise.equipmentType,
        instructions: exercise.instructions,
        difficultyLevel: exercise.difficultyLevel,
        updatedAt: exercise.updatedAt,
      },
    );
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await this.elasticsearchService.deleteDocument(EXERCISES_INDEX, exerciseId);
  }

  async bulkIndexExercises(exercises: Exercise[]): Promise<void> {
    const documents = exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      muscleGroups: exercise.muscleGroups,
      equipmentType: exercise.equipmentType,
      instructions: exercise.instructions,
      difficultyLevel: exercise.difficultyLevel,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    }));

    await this.elasticsearchService.bulkIndex(EXERCISES_INDEX, documents);
  }
}
