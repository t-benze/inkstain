import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation, Translation } from 'react-i18next';
import { makeStyles } from '@fluentui/react-components';
import { Document } from '~/web/types';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import {
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  Input,
  createTableColumn,
} from '@fluentui/react-components';

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
});

interface DocumentAttributesViewProps {
  document: Document;
}

interface DocumentAttribute {
  name: string;
  value: string;
}
interface DocumentAttributeItem {
  name: string;
  value: string;
  isSystemAttribute: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

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
      return (
        <Input
          data-test="documentAttributesView-attributeInput"
          value={attribute.value}
          onChange={(e, data) => {
            attribute.onChange(data.value);
          }}
          onBlur={(e) => {
            attribute.onBlur();
          }}
        />
      );
    },
  }),
];

export const DocumentAttributesView = ({
  document,
}: DocumentAttributesViewProps) => {
  const appContext = React.useContext(AppContext);
  const classes = useClasses();
  const { t } = useTranslation();
  const { data: attributes } = useQuery<Array<DocumentAttribute>>({
    queryKey: ['document-attributes', document.name],
    queryFn: async () => {
      const attributes = await documentsApi.getDocumentAttributes({
        spaceKey: appContext.activeSpace!.key,
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

  const handleValueChange = React.useCallback(
    (position: number, value: string) => {
      if (items === undefined)
        throw new Error('Error editing state, items is undefined');
      const target = items[position];
      setItems([
        ...items.slice(0, position),
        { ...target, value },
        ...items.slice(position + 1),
      ]);
    },
    [items]
  );

  React.useEffect(() => {
    setItems(attributes);
  }, [attributes]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (attributes: Array<DocumentAttribute>) => {
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
        spaceKey: appContext.activeSpace!.key,
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

  const handleBlur = React.useCallback(() => {
    if (items) {
      mutation.mutate(items);
    }
  }, [mutation, items]);

  const panel = items ? (
    <DataGrid
      className={classes.grid}
      items={items.map((item, index) => ({
        ...item,
        onChange: (value: string) => handleValueChange(index, value),
        onBlur: handleBlur,
        isSystemAttribute: appContext.platform.systemAttributes.includes(
          item.name
        ),
      }))}
      columns={columns}
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
  ) : null;

  return (
    <SidebarAccordionItem
      headerText={t('document_attributes')}
      panel={panel}
    ></SidebarAccordionItem>
  );
};
