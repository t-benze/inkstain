import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation, Translation } from 'react-i18next';
import {
  makeStyles,
  Button,
  tokens,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { DismissCircleRegular } from '@fluentui/react-icons';
import { Document } from '~/web/types';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import {
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  Input,
  Link,
  createTableColumn,
} from '@fluentui/react-components';
import { DocumentAttribute } from './types';

const useClasses = makeStyles({
  grid: {
    width: '100%',
  },
  gridRow: {
    '& > :first-child': {
      maxWidth: '50px',
    },
    '& .fui-Input': {
      width: '100%',
    },
  },
  editButton: {
    marginTop: tokens.spacingVerticalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingLeft: tokens.spacingVerticalS,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

interface DocumentAttributesViewProps {
  document: Document;
}

interface DocumentAttributeItem {
  name: string;
  value: string;
  isNew: boolean;
  onUpdate: (attr: { name: string; value: string }) => void;
  onRemove: () => void;
}

const isUrl = (value: string) => {
  return value.startsWith('http://') || value.startsWith('https://');
};

const NewAttributeNameDropdown = ({
  attribute,
  updateAttribute,
}: {
  attribute: DocumentAttribute;
  updateAttribute: (attribute: DocumentAttribute) => void;
}) => {
  const { t } = useTranslation();
  const appContext = React.useContext(AppContext);
  const attributes = appContext.platform.attributes.attributes;
  return (
    <Dropdown
      data-test="documentAttributesView-attributeNameDropdown"
      size="small"
      style={{ minWidth: '50px' }}
      value={attribute.name !== '' ? t(`system.${attribute.name}`) : ''}
      onOptionSelect={(e, option) => {
        updateAttribute({
          ...attribute,
          name: option.optionValue as string,
        });
      }}
    >
      {attributes.map((attr) => (
        <Option
          key={attr}
          value={attr}
          data-test="documentAttributesView-attributeNameDropdownOption"
        >
          {t(`system.${attr}`)}
        </Option>
      ))}
    </Dropdown>
  );
};

const columns: TableColumnDefinition<DocumentAttributeItem>[] = [
  createTableColumn<DocumentAttributeItem>({
    columnId: 'name',
    compare: (a, b) => a.name.localeCompare(b.name),
    renderCell: (attribute) => {
      return (
        <Translation>
          {(t) => {
            return t(`system.${attribute.name}`);
          }}
        </Translation>
      );
    },
  }),
  createTableColumn<DocumentAttributeItem>({
    columnId: 'value',
    compare: (a, b) => a.value.localeCompare(b.value),
    renderCell: (attribute) => {
      return isUrl(attribute.value) ? (
        <Link href={attribute.value} target="_blank" rel="noopener noreferrer">
          {attribute.value}
        </Link>
      ) : (
        attribute.value
      );
    },
  }),
];

const columnsEditMode: TableColumnDefinition<DocumentAttributeItem>[] = [
  createTableColumn<DocumentAttributeItem>({
    columnId: 'remove',
    renderCell: (attribute) => {
      return (
        <DismissCircleRegular
          data-test="documentAttributesView-removeButton"
          style={{ cursor: 'pointer' }}
          fontSize={16}
          onClick={() => {
            attribute.onRemove();
          }}
        />
      );
    },
  }),
  createTableColumn<DocumentAttributeItem>({
    columnId: 'name',
    compare: (a, b) => a.name.localeCompare(b.name),
    renderCell: (attribute) => {
      return attribute.isNew ? (
        <NewAttributeNameDropdown
          attribute={{ name: attribute.name, value: attribute.value }}
          updateAttribute={attribute.onUpdate}
        />
      ) : (
        <Translation>
          {(t) => {
            return t(`system.${attribute.name}`);
          }}
        </Translation>
      );
    },
  }),
  createTableColumn<DocumentAttributeItem>({
    columnId: 'value',
    compare: (a, b) => a.value.localeCompare(b.value),
    renderCell: (attribute) => {
      return (
        <Input
          data-test="documentAttributesView-attributeInput"
          value={attribute.value}
          onChange={(e, data) => {
            attribute.onUpdate({
              name: attribute.name,
              value: data.value,
            });
          }}
        />
      );
    },
  }),
];

const columnSizingOptions = {
  remove: {
    minWidth: 16,
    defaultWidth: 16,
    idealWidth: 16,
  },
  name: {
    minWidth: 50,
    defaultWidth: 50,
    idealWidth: 50,
  },
  value: {
    idealWidth: 100,
  },
};

const ContentView = ({
  attributes,
  onSaveAttributes,
}: {
  attributes: DocumentAttribute[] | undefined;
  onSaveAttributes: (params: {
    delete: Array<string>;
    addOrUpdate: Array<DocumentAttribute>;
  }) => void;
}) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  const [updates, setUpdates] = React.useState<Record<string, string>>({});
  const [newAttributes, setNewAttributes] = React.useState<
    Array<DocumentAttribute>
  >([]);
  const [deleteAttributes, setDeleteAttributes] = React.useState<Array<string>>(
    []
  );
  if (!attributes) return null;

  const existingItems: DocumentAttributeItem[] = attributes.map(
    (item, index) => ({
      ...item,
      isNew: false,
      onUpdate: (attr: { name: string; value: string }) =>
        setUpdates({ ...updates, [attr.name]: attr.value }),
      onRemove: () => {
        setDeleteAttributes([...deleteAttributes, item.name]);
      },
    })
  );
  const newItems: DocumentAttributeItem[] = newAttributes.map(
    (item, index) => ({
      ...item,
      isNew: true,
      onUpdate: (newAttr: { name: string; value: string }) => {
        setNewAttributes(
          newAttributes.map((attr, i) => (i === index ? newAttr : attr))
        );
      },
      onRemove: () => {
        setNewAttributes(newAttributes.filter((_, i) => i !== index));
      },
    })
  );

  const clearState = () => {
    setUpdates({});
    setDeleteAttributes([]);
    setNewAttributes([]);
    setIsEditing(false);
  };

  const handleEditAttributes = () => {
    const attributesToUpdateOrAdd: DocumentAttribute[] = Object.keys(updates)
      .map((key) => ({
        name: key,
        value: updates[key],
      }))
      .concat(newAttributes);
    onSaveAttributes({
      delete: deleteAttributes,
      addOrUpdate: attributesToUpdateOrAdd,
    });
  };

  return (
    <>
      <DataGrid
        className={classes.grid}
        size="small"
        items={[
          ...existingItems.filter(
            (item) => !deleteAttributes.includes(item.name)
          ),
          ...newItems,
        ]}
        columns={isEditing ? columnsEditMode : columns}
        columnSizingOptions={columnSizingOptions}
        resizableColumns
      >
        <DataGridBody<DocumentAttribute>>
          {({ item, rowId }) => (
            <DataGridRow<DocumentAttribute>
              key={rowId}
              className={classes.gridRow}
              data-test="documentAttributesView-attribute"
            >
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>

      {isEditing && (
        <div className={classes.editButton}>
          <Button
            data-test="documentAttributesView-addAttributeButton"
            style={{ flexGrow: 1 }}
            onClick={() => {
              setNewAttributes([
                ...newAttributes,
                {
                  name: '',
                  value: '',
                },
              ]);
            }}
          >
            {t('add')}
          </Button>
        </div>
      )}
      {isEditing && (
        <div className={classes.editButton}>
          <Button
            data-test="documentAttributesView-saveButton"
            onClick={() => {
              handleEditAttributes();
              clearState();
            }}
          >
            {t('save')}
          </Button>
          <Button
            data-test="documentAttributesView-cancelButton"
            onClick={() => {
              clearState();
            }}
          >
            {t('cancel')}
          </Button>
        </div>
      )}
      {!isEditing && (
        <div className={classes.editButton}>
          <Button
            data-test="documentAttributesView-editButton"
            style={{ flexGrow: 1 }}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            {t('edit')}
          </Button>
        </div>
      )}
    </>
  );
};
export const DocumentAttributesView = ({
  document,
}: DocumentAttributesViewProps) => {
  const appContext = React.useContext(AppContext);
  const { t } = useTranslation();

  const { data: attributes } = useQuery<Array<DocumentAttribute>>({
    queryKey: ['document-attributes', document.name],
    queryFn: async () => {
      if (!appContext.activeSpace) throw new Error('Active space is not set');

      const attributes = await documentsApi.getDocumentAttributes({
        spaceKey: appContext.activeSpace.key,
        path: document.name,
      });

      return Object.entries(attributes)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .reduce((acc, attribute) => {
          if (Array.isArray(attribute.value)) {
            return [
              ...acc,
              ...attribute.value.map((value, index) => ({
                name: attribute.name,
                value,
              })),
            ];
          }
          return [
            ...acc,
            {
              ...attribute,
            },
          ];
        }, [] as Array<DocumentAttribute>);
    },
  });

  const queryClient = useQueryClient();
  const addOrUpdateMutation = useMutation({
    mutationFn: async (addOrUpdates: Array<DocumentAttribute>) => {
      if (!appContext.activeSpace) throw new Error('Active space is not set');
      const updates: Record<string, string> = {};
      addOrUpdates.forEach((attr) => {
        updates[attr.name] = attr.value;
      });
      await documentsApi.addUpdateDocumentAttributes({
        spaceKey: appContext.activeSpace.key,
        path: document.name,
        addUpdateDocumentAttributesRequest: {
          attributes: updates,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-attributes', document.name],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (deleteAttributes: Array<string>) => {
      if (!appContext.activeSpace) throw new Error('Active space is not set');
      await documentsApi.deleteDocumentAttributes({
        requestBody: deleteAttributes,
        spaceKey: appContext.activeSpace.key,
        path: document.name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-attributes', document.name],
      });
    },
  });

  const handleSaveAttributes = React.useCallback(
    ({
      delete: deleteAttributes,
      addOrUpdate,
    }: {
      delete: Array<string>;
      addOrUpdate: Array<DocumentAttribute>;
    }) => {
      addOrUpdateMutation.mutate(addOrUpdate);
      if (deleteAttributes.length > 0) {
        deleteMutation.mutate(deleteAttributes);
      }
    },
    [addOrUpdateMutation, deleteMutation]
  );

  return (
    <SidebarAccordionItem
      headerText={t('document_attributes')}
      panel={
        <ContentView
          attributes={attributes}
          onSaveAttributes={handleSaveAttributes}
        />
      }
    ></SidebarAccordionItem>
  );
};
