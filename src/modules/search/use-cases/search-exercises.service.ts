import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../../services/elasticsearch.service';
import { MuscleGroup, Equipment, Difficulty } from '../../exercise/model';

interface SearchExercisesDto {
  query?: string;
  muscleGroups?: MuscleGroup;
  equipmentType?: Equipment;
  difficultyLevel?: Difficulty;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup;
  equipmentType: Equipment;
  difficultyLevel: Difficulty;
  score: number;
}

const EXERCISES_INDEX = 'exercises';

@Injectable()
export class SearchExercisesService {
  constructor(private elasticsearchService: ElasticsearchService) {}

  async execute(
    dto: SearchExercisesDto,
  ): Promise<{ results: SearchResult[]; total: number }> {
    const {
      query,
      muscleGroups,
      equipmentType,
      difficultyLevel,
      page = 1,
      limit = 20,
    } = dto;

    const must: any[] = [];
    const filter: any[] = [];

    // Full-text search on name, description, and instructions
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description^2', 'instructions'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (muscleGroups) {
      filter.push({ term: { muscleGroups } });
    }

    if (equipmentType) {
      filter.push({ term: { equipmentType } });
    }

    if (difficultyLevel) {
      filter.push({ term: { difficultyLevel } });
    }

    const esQuery = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter,
        },
      },
      from: (page - 1) * limit,
      size: limit,
      sort: query ? [{ _score: 'desc' }] : [{ name: 'asc' }],
    };

    try {
      const results = await this.elasticsearchService.search<any>(
        EXERCISES_INDEX,
        esQuery,
      );

      return {
        results: results.map((hit: any) => ({
          id: hit.id,
          name: hit.name,
          description: hit.description,
          muscleGroups: hit.muscleGroups,
          equipmentType: hit.equipmentType,
          difficultyLevel: hit.difficultyLevel,
          score: hit._score || 0,
        })),
        total: results.length,
      };
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      return { results: [], total: 0 };
    }
  }

  async searchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const esQuery = {
      query: {
        bool: {
          must: [
            {
              prefix: {
                name: {
                  value: query.toLowerCase(),
                },
              },
            },
          ],
        },
      },
      size: 5,
      _source: ['name'],
    };

    try {
      const results = await this.elasticsearchService.search<any>(
        EXERCISES_INDEX,
        esQuery,
      );
      return results.map((hit: any) => hit.name);
    } catch (error) {
      console.error('Elasticsearch suggestion error:', error);
      return [];
    }
  }
}
