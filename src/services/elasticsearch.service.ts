import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { elasticsearchConfig } from '../config/elasticsearch.config';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;

  async onModuleInit() {
    this.client = new Client(elasticsearchConfig as any);

    try {
      await this.client.ping();
      console.log('Elasticsearch connected successfully');
    } catch (error) {
      console.error('Elasticsearch connection error:', error);
    }
  }

  getClient(): Client {
    return this.client;
  }

  async createIndex(index: string, mappings: any): Promise<void> {
    const exists = await this.client.indices.exists({ index });

    if (!exists) {
      await this.client.indices.create({
        index,
        body: {
          mappings,
        },
      });
      console.log(`Index ${index} created successfully`);
    }
  }

  async deleteIndex(index: string): Promise<void> {
    const exists = await this.client.indices.exists({ index });
    if (exists) {
      await this.client.indices.delete({ index });
      console.log(`Index ${index} deleted successfully`);
    }
  }

  async indexDocument(index: string, id: string, document: any): Promise<void> {
    await this.client.index({
      index,
      id,
      body: document,
      refresh: true,
    });
  }

  async updateDocument(
    index: string,
    id: string,
    document: any,
  ): Promise<void> {
    await this.client.update({
      index,
      id,
      body: {
        doc: document,
      },
      refresh: true,
    });
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    await this.client.delete({
      index,
      id,
      refresh: true,
    });
  }

  async search<T>(index: string, query: any): Promise<T[]> {
    const result = await this.client.search({
      index,
      body: query,
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  }

  async aggregate(index: string, aggregations: any): Promise<any> {
    const result = await this.client.search({
      index,
      body: {
        size: 0,
        aggs: aggregations,
      } as any,
    });

    return result.aggregations;
  }

  async bulkIndex(index: string, documents: any[]): Promise<void> {
    const body = documents.flatMap((doc) => [
      { index: { _index: index, _id: doc.id } },
      doc,
    ]);

    await this.client.bulk({
      body,
      refresh: true,
    });
  }
}
