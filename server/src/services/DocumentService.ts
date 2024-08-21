import path from 'path';
import { Sequelize, Op, Includeable } from 'sequelize';
import { readFile } from 'fs/promises';
import { MetaData } from '~/server/types';
import { Document, DocAttribute, Tag } from '~/server/db';
import { Space } from './SpaceService';

export class DocumentService {
  private sequelize: Sequelize;
  private systemAttributes = ['title', 'author', 'url'];

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  getSystemAttributes() {
    return this.systemAttributes;
  }

  async getDocumentTags(spaceKey: string) {
    return await Tag.findAll({
      where: { spaceKey },
    });
  }

  async clearIndex(space: Space) {
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

  async indexDocument(space: Space, documentPath: string) {
    const spaceKey = space.key;
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
        if (!this.systemAttributes.includes(key)) {
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

  async deleteDocument(space: Space, documentPath: string) {
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

  async updateDocumentPath(space: Space, oldPath: string, newPath: string) {
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
}
