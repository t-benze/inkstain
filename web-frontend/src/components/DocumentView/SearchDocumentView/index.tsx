import * as React from 'react';
import {
  makeStyles,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridCell,
  DataGridBody,
  createTableColumn,
  DataGridHeaderCell,
  shorthands,
  tokens,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Input,
} from '@fluentui/react-components';
import { Translation } from 'react-i18next';

import { FilterRegular, FilterFilled } from '@fluentui/react-icons';
import { AppContext } from '~/web/app/context';
import { documentsApi } from '~/web/apiClient';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DocumentSearchResult } from '@inkstain/client-api';
import { t } from 'i18next';

type Item = DocumentSearchResult;

const useClasses = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    '& .fui-DataGridRow': {
      cursor: 'pointer',
    },
  },
  filterInput: {
    '& .fui-Input': {
      width: '100%',
      marginBottom: tokens.spacingVerticalS,
    },
    '& .button-container': {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    '& .fui-Button': {
      marginLeft: tokens.spacingHorizontalS,
      textTransform: 'capitalize',
    },
  },
});

function makeColumns(columnKeys: string[]) {
  const columnSizingOptions = {
    title: {
      minWidth: 150,
      defaultWidth: 250,
      idealWidth: 250,
    },
    author: {
      minWidth: 150,
      defaultWidth: 200,
      idealWidth: 200,
    },
    tags: {
      minWidth: 80,
      defaultWidth: 100,
      idealWidth: 100,
    },
  };
  const columns = columnKeys.map((key) => {
    return createTableColumn({
      columnId: key,
      renderCell: (item: Item) => {
        if (key === 'tags') {
          return (item.meta.tags ?? []).join(', ');
        } else {
          const attrValue = item.meta.attributes && item.meta.attributes[key];
          if (Array.isArray(attrValue)) {
            return attrValue.join(', ');
          } else {
            return attrValue as string;
          }
        }
      },
      renderHeaderCell() {
        return (
          <Translation>
            {(t) => {
              return t(`system.${key}`);
            }}
          </Translation>
        );
      },
    });
  });
  return {
    columns,
    columnSizingOptions,
  } as const;
}

const GridHeaderCell = ({
  renderHeaderCell,
  hasFilterApplied,
  filterValue,
  onApplyFilter,
}: {
  hasFilterApplied: boolean;
  filterValue: string;
  renderHeaderCell: () => React.ReactNode;
  onApplyFilter: (value: string | undefined) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(filterValue);
  const classes = useClasses();
  const { t } = useTranslation();
  const filterButton = (
    <Button
      appearance={'transparent'}
      icon={
        hasFilterApplied ? (
          <FilterFilled primaryFill={tokens.colorBrandBackground} />
        ) : (
          <FilterRegular />
        )
      }
    />
  );
  return (
    <Popover
      positioning={'below'}
      open={open}
      onOpenChange={(e, data) => {
        setOpen(data.open);
      }}
    >
      <DataGridHeaderCell>
        {renderHeaderCell()}
        <PopoverTrigger>{filterButton}</PopoverTrigger>
      </DataGridHeaderCell>
      <PopoverSurface>
        <div className={classes.filterInput}>
          <Input
            value={value}
            onChange={(e, data) => {
              setValue(data.value);
            }}
          />
          <div className="button-container">
            <Button
              size="small"
              onClick={() => {
                onApplyFilter(undefined);
                setOpen(false);
              }}
            >
              {t('clear')}
            </Button>
            <Button
              size="small"
              appearance="primary"
              onClick={() => {
                onApplyFilter(value);
                setOpen(false);
              }}
            >
              {t('apply')}
            </Button>
          </div>
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export const SearchDocumentView = () => {
  const classes = useClasses();
  const { activeSpace, openDocument } = React.useContext(AppContext);
  const [tagFilter, setTagFilter] = React.useState<string | undefined>(
    undefined
  );
  const [attributeFilters, setAttributeFilters] = React.useState<
    Record<string, string>
  >({});
  const systemAttributesRef = React.useRef<null | string[]>(null);
  if (activeSpace === null) throw new Error('No activeSpace');
  const attributeFilterString = JSON.stringify(attributeFilters);
  const spaceKey = activeSpace.key;
  const { data: documents } = useQuery({
    queryKey: ['searchDocuments', spaceKey, tagFilter, attributeFilterString],
    queryFn: async () => {
      const result = await documentsApi.searchDocuments({
        spaceKey,
        tagFilter,
        attributeFilters: attributeFilterString,
      });
      systemAttributesRef.current = result.systemAttributes;
      return result.data;
    },
  });

  if (!systemAttributesRef.current) return null;
  const { columns, columnSizingOptions } = makeColumns([
    ...systemAttributesRef.current,
    'tags',
  ]);

  return (
    <div className={classes.root}>
      <DataGrid
        items={documents || []}
        columns={columns}
        resizableColumns
        columnSizingOptions={columnSizingOptions}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell, columnId }) => {
              const hasFilterApplied =
                columnId === 'tags'
                  ? tagFilter !== undefined
                  : attributeFilters[columnId] !== undefined;
              const filterValue =
                columnId === 'tags' ? tagFilter : attributeFilters[columnId];
              const onApplyFilter = (value: string | undefined) => {
                if (columnId === 'tags') {
                  setTagFilter(value);
                } else {
                  setAttributeFilters((prev) => {
                    if (value === undefined) {
                      const filters = {
                        ...prev,
                      };
                      delete filters[columnId];
                      return filters;
                    }
                    return {
                      ...prev,
                      [columnId]: value,
                    };
                  });
                }
              };
              return (
                <GridHeaderCell
                  filterValue={filterValue || ''}
                  renderHeaderCell={renderHeaderCell}
                  hasFilterApplied={hasFilterApplied}
                  onApplyFilter={onApplyFilter}
                />
              );
            }}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<Item>>
          {({ item, rowId }) => {
            return (
              <DataGridRow<Item> key={rowId}>
                {({ renderCell }) => {
                  return (
                    <DataGridCell
                      onClick={() => {
                        openDocument(item.documentPath);
                      }}
                    >
                      {renderCell(item)}
                    </DataGridCell>
                  );
                }}
              </DataGridRow>
            );
          }}
        </DataGridBody>
      </DataGrid>
    </div>
  );
};
