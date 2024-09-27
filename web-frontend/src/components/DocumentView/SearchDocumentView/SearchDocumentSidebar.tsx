import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  Button,
  DataGridBody,
  DataGridCell,
  DataGridRow,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useTranslation, Translation } from 'react-i18next';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import { searchApi } from '~/web/apiClient';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { useTaskProgressToast } from '~/web/components/TaskProgressToast';

interface GridRowItem {
  name: string;
  count: number;
}

const useClasses = makeStyles({
  root: {},
  button: {
    width: '100%',
    marginTop: tokens.spacingVerticalS,
  },
});

const columns: TableColumnDefinition<GridRowItem>[] = [
  createTableColumn({
    columnId: 'name',
    renderCell: (item) => (
      <Translation>
        {(t) => {
          return t(`system.${item.name}`);
        }}
      </Translation>
    ),
  }),
  createTableColumn({
    columnId: 'count',
    renderCell: (item) => item.count,
  }),
];

export const SearchDocumentSidebar = () => {
  const queryClient = useQueryClient();
  const { activeSpace } = useAppContext();
  const { t } = useTranslation();
  const classes = useClasses();
  const showTaskProgressToast = useTaskProgressToast();
  const { data } = useQuery({
    queryKey: ['space-search-overview', activeSpace?.key],
    queryFn: async () => {
      if (!activeSpace?.key) {
        return null;
      }
      const response = await searchApi.getSpaceOverview({
        spaceKey: activeSpace.key,
      });
      return response.data;
    },
  });

  const items = data
    ? Object.entries(data).map(([name, count]) => ({ name, count }))
    : [];

  const panel = (
    <div>
      <DataGrid columns={columns} items={items} getRowId={(row) => row.name}>
        <DataGridBody<GridRowItem>>
          {({ item, rowId }) => (
            <DataGridRow<GridRowItem> key={rowId}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
      <Button
        className={classes.button}
        appearance="primary"
        onClick={async () => {
          if (!activeSpace?.key) {
            return;
          }
          const response = await searchApi.reindexSpace({
            spaceKey: activeSpace.key,
          });
          showTaskProgressToast({
            taskId: response.taskId,
            taskTitle: t('search_reindex'),
            taskSuccessMessage: t('search_reindex_success'),
            taskFailureMessage: t('search_reindex_failure'),
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ['space-search-overview', activeSpace?.key],
              });
            },
          });
        }}
      >
        {t('search_reindex')}
      </Button>
    </div>
  );

  return <SidebarAccordionItem headerText={t('overview')} panel={panel} />;
};
