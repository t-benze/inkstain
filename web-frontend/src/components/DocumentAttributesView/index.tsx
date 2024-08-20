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
import { useNewAttributes } from './AddAttribute';

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

const isValidUrl = (value: string) => {
  const urlRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlRegex.test(value);
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
  const systemAttributes = appContext.platform.systemAttributes;
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
      {systemAttributes.map((attr) => (
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
      return isValidUrl(attribute.value) ? (
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
export const DocumentAttributesView = ({
  document,
}: DocumentAttributesViewProps) => {
  const appContext = React.useContext(AppContext);
  const classes = useClasses();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);
  const {
    newAttributes,
    addAttribute,
    removeAttribute,
    clearNewAttributes,
    updateAttribute,
  } = useNewAttributes();
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

  const [items, setItems] = React.useState<
    Array<DocumentAttribute> | undefined
  >(undefined);

  React.useEffect(() => {
    setItems(attributes);
  }, [attributes]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (attributes: Array<DocumentAttribute>) => {
      if (!appContext.activeSpace) throw new Error('Active space is not set');

      const newAttributes = attributes.reduce(
        (acc: Record<string, string | string[]>, item) => {
          if (acc[item.name]) {
            if (Array.isArray(acc[item.name])) {
              return {
                ...acc,
                [item.name]: [...acc[item.name], item.value],
              };
            }
            return {
              ...acc,
              [item.name]: [acc[item.name] as string, item.value],
            };
          }
          return {
            ...acc,
            [item.name]: item.value,
          };
        },
        {} as Record<string, string | string[]>
      );
      await documentsApi.addUpdateDocumentAttributes({
        spaceKey: appContext.activeSpace.key,
        path: document.name,
        addUpdateDocumentAttributesRequest: {
          attributes: newAttributes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-attributes', document.name],
      });
    },
  });

  const handleUpdateAttributes = React.useCallback(() => {
    if (items) {
      if (newAttributes && newAttributes.length > 0) {
        mutation.mutate([
          ...items,
          ...newAttributes.filter(
            (attr) => attr.name !== '' && attr.value !== ''
          ),
        ]);
      } else {
        mutation.mutate(items);
      }
    }
  }, [mutation, items, newAttributes]);

  const renderPanel = () => {
    if (!items) return null;
    const existingItems: DocumentAttributeItem[] = items.map((item, index) => ({
      ...item,
      isNew: false,
      onUpdate: (attr: { name: string; value: string }) =>
        setItems(
          items.map((item, i) => (i === index ? { ...item, ...attr } : item))
        ),
      onRemove: () => setItems(items.filter((_, i) => i !== index)),
    }));
    const newItems: DocumentAttributeItem[] = newAttributes.map(
      (item, index) => ({
        ...item,
        isNew: true,
        onUpdate: (attr: { name: string; value: string }) =>
          updateAttribute(index, { ...item, ...attr }),
        onRemove: () => removeAttribute(index),
      })
    );

    return (
      <>
        <DataGrid
          className={classes.grid}
          size="small"
          items={[...existingItems, ...newItems]}
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
                addAttribute({
                  name: '',
                  value: '',
                });
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
                handleUpdateAttributes();
                clearNewAttributes();
                setIsEditing(false);
              }}
            >
              {t('save')}
            </Button>
            <Button
              data-test="documentAttributesView-cancelButton"
              onClick={() => {
                setItems(attributes);
                clearNewAttributes();
                setIsEditing(false);
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

  return (
    <SidebarAccordionItem
      headerText={t('document_attributes')}
      panel={renderPanel()}
    ></SidebarAccordionItem>
  );
};
