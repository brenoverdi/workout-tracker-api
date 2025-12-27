import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from '../model';
import { ElasticsearchService } from '../../../services/elasticsearch.service';

const TUTORIALS_INDEX = 'tutorials';

@Injectable()
export class IndexTutorialService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialRepository: Repository<Tutorial>,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async createIndex(): Promise<void> {
    const mappings = {
      properties: {
        tutorialId: { type: 'keyword' },
        title: {
          type: 'text',
          fields: {
            keyword: { type: 'keyword' },
          },
        },
        summary: { type: 'text' },
        content: { type: 'text' },
        type: { type: 'keyword' },
        difficulty: { type: 'keyword' },
        tags: { type: 'keyword' },
        exerciseIds: { type: 'keyword' },
        exerciseNames: { type: 'text' },
        muscleGroups: { type: 'keyword' },
        videoDuration: { type: 'integer' },
        videoUrl: { type: 'keyword' },
        thumbnailUrl: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
      },
    };

    await this.elasticsearchService.createIndex(TUTORIALS_INDEX, mappings);
  }

  async deleteIndex(): Promise<void> {
    await this.elasticsearchService.deleteIndex(TUTORIALS_INDEX);
  }

  async indexTutorial(tutorial: Tutorial): Promise<void> {
    // Get related data
    const tutorialWithRelations = await this.tutorialRepository.findOne({
      where: { id: tutorial.id },
      relations: [
        'tutorialExercises',
        'tutorialExercises.exercise',
        'tutorialMuscleGroups',
        'tutorialMedia',
      ],
    });

    if (!tutorialWithRelations) {
      return;
    }

    const exerciseIds =
      tutorialWithRelations.tutorialExercises?.map((te) => te.exerciseId) || [];
    const exerciseNames =
      tutorialWithRelations.tutorialExercises
        ?.map((te) => te.exercise?.name)
        .filter(Boolean) || [];
    const muscleGroups =
      tutorialWithRelations.tutorialMuscleGroups?.map(
        (tmg) => tmg.muscleGroup,
      ) || [];
    const primaryMedia = tutorialWithRelations.tutorialMedia?.find(
      (m) => m.isPrimary,
    );

    const document = {
      tutorialId: tutorial.id,
      title: tutorial.title,
      summary: tutorial.summary,
      content: tutorial.content,
      type: tutorial.type,
      difficulty: tutorial.difficulty,
      tags: tutorial.tags || [],
      exerciseIds,
      exerciseNames,
      muscleGroups,
      hasVideo:
        tutorialWithRelations.tutorialMedia &&
        tutorialWithRelations.tutorialMedia.length > 0,
      videoDuration: primaryMedia?.duration || null,
      videoUrl: primaryMedia?.url || null,
      thumbnailUrl: primaryMedia?.thumbnailUrl || null,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
    };

    await this.elasticsearchService.indexDocument(
      TUTORIALS_INDEX,
      tutorial.id,
      document,
    );
  }

  async updateTutorial(tutorial: Tutorial): Promise<void> {
    await this.indexTutorial(tutorial);
  }

  async deleteTutorial(tutorialId: string): Promise<void> {
    await this.elasticsearchService.deleteDocument(TUTORIALS_INDEX, tutorialId);
  }

  async bulkIndexTutorials(tutorials: Tutorial[]): Promise<void> {
    // Fetch all tutorials with relations
    const tutorialIds = tutorials.map((t) => t.id);
    const tutorialsWithRelations = await this.tutorialRepository.find({
      where: tutorialIds.map((id) => ({ id })),
      relations: [
        'tutorialExercises',
        'tutorialExercises.exercise',
        'tutorialMuscleGroups',
        'tutorialMedia',
      ],
    });

    const documents = tutorialsWithRelations.map((tutorial) => {
      const exerciseIds =
        tutorial.tutorialExercises?.map((te) => te.exerciseId) || [];
      const exerciseNames =
        tutorial.tutorialExercises
          ?.map((te) => te.exercise?.name)
          .filter(Boolean) || [];
      const muscleGroups =
        tutorial.tutorialMuscleGroups?.map((tmg) => tmg.muscleGroup) || [];
      const primaryMedia = tutorial.tutorialMedia?.find((m) => m.isPrimary);

      return {
        id: tutorial.id,
        tutorialId: tutorial.id,
        title: tutorial.title,
        summary: tutorial.summary,
        content: tutorial.content,
        type: tutorial.type,
        difficulty: tutorial.difficulty,
        tags: tutorial.tags || [],
        exerciseIds,
        exerciseNames,
        muscleGroups,
        hasVideo: tutorial.tutorialMedia && tutorial.tutorialMedia.length > 0,
        videoDuration: primaryMedia?.duration || null,
        videoUrl: primaryMedia?.url || null,
        thumbnailUrl: primaryMedia?.thumbnailUrl || null,
        createdAt: tutorial.createdAt,
        updatedAt: tutorial.updatedAt,
      };
    });

    await this.elasticsearchService.bulkIndex(TUTORIALS_INDEX, documents);
  }
}
