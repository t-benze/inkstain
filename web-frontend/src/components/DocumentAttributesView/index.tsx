import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation } from 'react-i18next';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { Document } from '~/web/types';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import {
  DataGrid,
  DataGridBody,
  DataGridRow,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
} from '@fluentui/react-components';

const useClasses = makeStyles({});

interface DocumentAttributesViewProps {
  document: Document;
}

interface DocumentAttribute {
  name: string;
  value: string;
}

export const DocumentAttributesView = ({
  document,
}: DocumentAttributesViewProps) => {
  const appContext = React.useContext(AppContext);
  const { t } = useTranslation();
  const { data: attributes } = useQuery<DocumentAttribute[]>({
    queryKey: ['document-attributes', document.name],
    queryFn: async () => {
      if (!appContext.activeSpace) {
        return [] as DocumentAttribute[];
      }
      const attributes = await documentsApi.getDocumentAttributes({
        spaceKey: appContext.activeSpace?.key,
        path: document.name,
      });
      return Object.entries(attributes).map(([name, value]) => ({
        name,
        value,
      })) as DocumentAttribute[];
    },
  });

  const columns: TableColumnDefinition<DocumentAttribute>[] = [
    createTableColumn<DocumentAttribute>({
      columnId: 'name',
      compare: (a, b) => a.name.localeCompare(b.name),
      renderCell: (attribute) => attribute.name,
    }),
    createTableColumn<DocumentAttribute>({
      columnId: 'value',
      compare: (a, b) => a.value.localeCompare(b.value),
      renderCell: (attribute) => attribute.value,
    }),
  ];

  const panel = attributes ? (
    <DataGrid
      items={attributes || []}
      columns={columns}
      sortable
      getRowId={(attribute) => attribute.name}
    >
      <DataGridBody<DocumentAttribute>>
        {({ item, rowId }) => (
          <DataGridRow<DocumentAttribute>
            key={rowId}
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
