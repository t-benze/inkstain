import path from 'path';
import { Sequelize, Op, Includeable } from 'sequelize';
import { readFile } from 'fs/promises';
import { MetaData } from '~/server/types';
import { Document, DocAttribute, Tag } from '~/server/db';
import { SpaceService } from './SpaceService';
import { traverseDirectory } from '~/server/utils';

export class DocumentSearchService {
  private attributesWithIndex = ['title', 'author'];
  private attributes = [...this.attributesWithIndex, 'url'];

  constructor(
    private readonly sequelize: Sequelize,
    private readonly spaceService: SpaceService
  ) {}

  getAttributes() {
    return {
      attributesWithIndex: this.attributesWithIndex,
      attributes: this.attributes,
    };
  }

  async getDocumentTags(spaceKey: string) {
    return await Tag.findAll({
      where: { spaceKey },
    });
  }

  async clearIndex(spaceKey: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    await this.sequelize.transaction(async (transaction) => {
      await Document.destroy({
        where: { spaceKey: space.key },
        transaction,
      });
      await Tag.destroy({
        where: { spaceKey: space.key },
        transaction,
      });
      await DocAttribute.destroy({
        where: { spaceKey: space.key },
        transaction,
      });
    });
  }

  async indexSpace(
    spaceKey: string,
    progressCallback: (progress: number) => void
  ) {
    const space = await this.spaceService.getSpace(spaceKey);
    await this.clearIndex(spaceKey);
    const documentsToIndex = [];
    await traverseDirectory(space.path, '', documentsToIndex);
    const totalDocuments = documentsToIndex.length;
    for (const [index, doc] of documentsToIndex.entries()) {
      await this.indexDocument(spaceKey, doc);
      progressCallback((index / totalDocuments) * 100);
    }
  }

  async indexDocument(spaceKey: string, documentPath: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    const fullPath = path.join(space.path, documentPath);
    const metaPath = path.join(`${fullPath}.ink`, 'meta.json');
    const metaData = JSON.parse(await readFile(metaPath, 'utf-8')) as MetaData;

    await this.sequelize.transaction(async (transaction) => {
      const tags = metaData.tags ?? [];
      const attributes = metaData.attributes ?? {};
      let document = await Document.findOne({
        where: { spaceKey, documentPath },
        transaction,
      });
      if (!document) {
        document = await Document.create(
          {
            spaceKey,
            documentPath,
          },
          { transaction }
        );
      }

      for (const tagName of tags) {
        let tag = await Tag.findOne({
          where: { spaceKey, name: tagName },
          transaction,
        });
        if (!tag) {
          tag = await Tag.create({ spaceKey, name: tagName }, { transaction });
        }
        await document.addTag(tag, { transaction });
      }

      for (const [key, value] of Object.entries(attributes)) {
        if (!this.attributesWithIndex.includes(key)) {
          break;
        }
        const values = Array.isArray(value) ? value : [value];
        for (const val of values) {
          let attr = await DocAttribute.findOne({
            where: { spaceKey, key, value: val },
            transaction,
          });
          if (!attr) {
            attr = await DocAttribute.create(
              { spaceKey, key, value: val },
              { transaction }
            );
          }
          await document.addDocAttribute(attr, { transaction });
        }
      }
    });
  }

  async deleteDocument(spaceKey: string, documentPath: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    await this.sequelize.transaction(async (transaction) => {
      const document = await Document.findOne({
        where: { spaceKey: space.key, documentPath },
        transaction,
      });
      if (document) {
        await document.destroy({ transaction });
      }
    });
  }

  async updateDocumentPath(spaceKey: string, oldPath: string, newPath: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    await this.sequelize.transaction(async (transaction) => {
      await Document.update(
        { documentPath: newPath },
        { where: { spaceKey: space.key, documentPath: oldPath }, transaction }
      );
    });
  }

  async searchDocuments(
    spaceKey: string,
    query: {
      tagFilter?: string[];
      attributeFilters?: Record<string, string>;
      offset?: number;
      limit?: number;
    }
  ) {
    // Build query filters for tags and attributes
    const tagCondition =
      query.tagFilter && query.tagFilter.length
        ? { [Op.in]: query.tagFilter }
        : undefined;
    const attributeConditions = query.attributeFilters
      ? Object.entries(query.attributeFilters).map(([key, value]) => ({
          key,
          value: {
            [Op.like]: `%${value}%`,
          },
        }))
      : [];
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    // // Perform the search using Sequelize queries
    const includes: Includeable[] = [];
    if (tagCondition) {
      includes.push({
        model: Tag,
        where: {
          name: tagCondition,
        },
      });
    }
    if (attributeConditions.length) {
      includes.push({
        model: DocAttribute,
        where: { [Op.and]: attributeConditions },
      });
    }
    return Document.findAll({
      limit,
      offset,
      where: {
        spaceKey,
      },
      include: includes,
    });
  }

  async getOverView(spaceKey: string) {
    const documentCount = await Document.count({
      where: {
        spaceKey,
      },
    });
    const tagCount = await Tag.count({
      where: {
        spaceKey,
      },
    });
    const distinctAttr = await DocAttribute.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('key')), 'key']],
      where: {
        spaceKey,
      },
    });

    return {
      documentCount,
      tagCount,
      attributeCount: distinctAttr.length,
    };
  }
}
