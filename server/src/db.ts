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
type TagCreationAttributes = Optional<TagAttributes, 'id'>;

export class Tag extends Model<TagAttributes, TagCreationAttributes> {
  declare id: number;
  declare name: string;
  declare spaceKey: string;

  public declare addDocument: BelongsToManyAddAssociationMixin<
    Document,
    number
  >;
  public declare removeDocument: BelongsToManyRemoveAssociationMixin<
    Document,
    number
  >;
  public declare setDocuments: BelongsToManySetAssociationsMixin<
    Document,
    number
  >;
  public declare getDocuments: BelongsToManyGetAssociationsMixin<Document>;
  public declare addDocuments: BelongsToManyAddAssociationsMixin<
    Document,
    number
  >;
}

interface DocAttributeAttributes {
  id: number;
  spaceKey: string;
  key: string;
  value: string;
}

type DocAttributeCreationAttributes = Optional<DocAttributeAttributes, 'id'>;

export class DocAttribute extends Model<
  DocAttributeAttributes,
  DocAttributeCreationAttributes
> {
  public declare id: number;
  public declare spaceKey: string;
  public declare key: string;
  public declare value: string;
}

interface DocumentAttributes {
  id: number;
  spaceKey: string;
  documentPath: string;
}

type DocumentCreationAttributes = Optional<DocumentAttributes, 'id'>;

export class Document extends Model<
  DocumentAttributes,
  DocumentCreationAttributes
> {
  public declare id: number;
  public declare spaceKey: string;
  public declare documentPath: string;

  public declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;
  public declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>;
  public declare setTags: BelongsToManySetAssociationsMixin<Tag, number>;
  public declare getTags: BelongsToManyGetAssociationsMixin<Tag>;
  public declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>;

  public declare createDocAttribute: HasManyCreateAssociationMixin<DocAttribute>;
  public declare addDocAttribute: HasManyAddAssociationMixin<
    DocAttribute,
    number
  >;
  public declare removeDocAttribute: HasManyRemoveAssociationMixin<
    DocAttribute,
    number
  >;
  public declare setDocAttributes: HasManySetAssociationsMixin<
    DocAttribute,
    number
  >;
  public declare getDocAttributes: HasManyGetAssociationsMixin<DocAttribute>;
  public declare addDocAttributes: HasManyAddAssociationsMixin<
    DocAttribute,
    number
  >;
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
