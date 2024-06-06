// models/Document.ts
import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyGetAssociationsMixin,
  Sequelize,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';

interface TagAttributes {
  id: number;
  name: string;
  spaceKey: string;
}
interface TagCreationAttributes extends Optional<TagAttributes, 'id'> {}

export class Tag
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes
{
  public id!: number;
  public name!: string;
  public spaceKey!: string;

  public addDocument!: BelongsToManyAddAssociationMixin<Document, number>;
  public removeDocument!: BelongsToManyRemoveAssociationMixin<Document, number>;
  public setDocuments!: BelongsToManySetAssociationsMixin<Document, number>;
  public getDocuments!: BelongsToManyGetAssociationsMixin<Document>;
  public addDocuments!: BelongsToManyAddAssociationsMixin<Document, number>;
}

interface DocAttributeAttributes {
  id: number;
  spaceKey: string;
  key: string;
  value: string;
}

interface DocAttributeCreationAttributes
  extends Optional<DocAttributeAttributes, 'id'> {}

export class DocAttribute
  extends Model<DocAttributeAttributes, DocAttributeCreationAttributes>
  implements DocAttributeAttributes
{
  public id!: number;
  public spaceKey!: string;
  public key!: string;
  public value!: string;

  // public setDocument!: BelongsToSetAssociationMixin<Document, number>;
  // public getDocument!: BelongsToGetAssociationMixin<Document>;
}

interface DocumentAttributes {
  id: number;
  spaceKey: string;
  documentPath: string;
}

interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, 'id'> {}

export class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  public id!: number;
  public spaceKey!: string;
  public documentPath!: string;

  public addTag!: BelongsToManyAddAssociationMixin<Tag, number>;
  public removeTag!: BelongsToManyRemoveAssociationMixin<Tag, number>;
  public setTags!: BelongsToManySetAssociationsMixin<Tag, number>;
  public getTags!: BelongsToManyGetAssociationsMixin<Tag>;
  public addTags!: BelongsToManyAddAssociationsMixin<Tag, number>;

  public createDocAttribute!: HasManyCreateAssociationMixin<DocAttribute>;
  public addDocAttribute!: HasManyAddAssociationMixin<DocAttribute, number>;
  public removeDocAttribute!: HasManyRemoveAssociationMixin<
    DocAttribute,
    number
  >;
  public setDocAttributes!: HasManySetAssociationsMixin<DocAttribute, number>;
  public getDocAttributes!: HasManyGetAssociationsMixin<DocAttribute>;
  public addDocAttributes!: HasManyAddAssociationsMixin<DocAttribute, number>;
}

export async function initDB(sequelize: Sequelize) {
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      spaceKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentPath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Document',
      indexes: [
        {
          fields: ['spaceKey', 'documentPath'],
          unique: true,
          using: 'BTREE',
        },
      ],
    }
  );

  Tag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      spaceKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Tag',
      indexes: [
        {
          fields: ['spaceKey', 'name'],
          unique: true,
          using: 'BTREE',
        },
      ],
    }
  );

  DocAttribute.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      spaceKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'DocAttribute',
      indexes: [
        {
          fields: ['spaceKey', 'key', 'value'],
          unique: true,
          using: 'GIN',
        },
      ],
    }
  );
  Document.belongsToMany(Tag, {
    through: 'DocumentTags',
  });
  Tag.belongsToMany(Document, {
    through: 'DocumentTags',
  });
  Document.hasMany(DocAttribute);
  DocAttribute.belongsTo(Document);
  await sequelize.sync();
  return sequelize;
}
