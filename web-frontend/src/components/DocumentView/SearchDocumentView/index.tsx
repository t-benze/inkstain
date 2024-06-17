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
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { Translation } from 'react-i18next';

import { FilterRegular, FilterFilled } from '@fluentui/react-icons';
import { AppContext } from '~/web/app/context';
import { documentsApi, spacesApi } from '~/web/apiClient';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DocumentSearchResult } from '@inkstain/client-api';

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
    '& .fui-Dropdown': {
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

const HeaderCell = ({
  renderHeaderCell,
  hasFilterApplied,
  renderInput,
  onApplyClick,
  onClearClick,
}: {
  renderHeaderCell: () => React.ReactNode;
  renderInput: () => React.ReactNode;
  hasFilterApplied: boolean;
  onApplyClick: () => void;
  onClearClick: () => void;
}) => {
  const [open, setOpen] = React.useState(false);
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
          {renderInput()}
          <div className="button-container">
            <Button
              size="small"
              onClick={() => {
                onClearClick();
                setOpen(false);
              }}
            >
              {t('clear')}
            </Button>
            <Button
              size="small"
              appearance="primary"
              onClick={() => {
                onApplyClick();
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
const GridHeaderAttributeCell = ({
  columnId,
  renderHeaderCell,
  attributeFilters,
  onApplyAttributeFilter,
}: {
  columnId: string;
  attributeFilters: Record<string, string>;
  renderHeaderCell: () => React.ReactNode;
  onApplyAttributeFilter: (key: string, value: string | undefined) => void;
}) => {
  const hasFilterApplied = attributeFilters[columnId] !== undefined;
  const filterValue = attributeFilters[columnId];
  const [value, setValue] = React.useState(filterValue);
  return (
    <HeaderCell
      hasFilterApplied={hasFilterApplied}
      renderHeaderCell={renderHeaderCell}
      renderInput={() => {
        return (
          <Input
            value={value}
            onChange={(e, data) => {
              setValue(data.value);
            }}
          />
        );
      }}
      onApplyClick={() => {
        onApplyAttributeFilter(columnId, value);
      }}
      onClearClick={() => {
        onApplyAttributeFilter(columnId, undefined);
      }}
    />
  );
};

const GridHeaderTagCell = ({
  renderHeaderCell,
  tagFilter,
  onApplyTagFilter,
}: {
  tagFilter: Array<string> | undefined;
  renderHeaderCell: () => React.ReactNode;
  onApplyTagFilter: (value: Array<string> | undefined) => void;
}) => {
  const hasFilterApplied = tagFilter ? tagFilter.length > 0 : false;
  const appContext = React.useContext(AppContext);
  const { data: tags } = useQuery({
    queryKey: ['documentTags', appContext.activeSpace!.key],
    queryFn: async () => {
      if (!appContext.activeSpace) throw new Error('No activeSpace');
      const result = await spacesApi.getSpaceDocumentTags({
        key: appContext.activeSpace.key,
      });
      return result;
    },
  });
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(
    tagFilter ?? []
  );
  const [value, setValue] = React.useState('');

  return (
    <HeaderCell
      hasFilterApplied={hasFilterApplied}
      renderHeaderCell={renderHeaderCell}
      renderInput={() => {
        return (
          <Dropdown
            size="small"
            value={value}
            multiselect={true}
            placeholder={t('search_document.select_tags')}
            selectedOptions={selectedOptions}
            onOptionSelect={(e, data) => {
              setSelectedOptions(data.selectedOptions);
              setValue(data.selectedOptions.join(', '));
            }}
          >
            {tags
              ? tags.map((tag) => {
                  return (
                    <Option key={tag.name} value={tag.name}>
                      {tag.name}
                    </Option>
                  );
                })
              : null}
          </Dropdown>
        );
      }}
      onApplyClick={() => {
        onApplyTagFilter(selectedOptions);
      }}
      onClearClick={() => {
        onApplyTagFilter(undefined);
        setValue('');
      }}
    />
  );
};

export const SearchDocumentView = () => {
  const classes = useClasses();
  const { activeSpace, openDocument } = React.useContext(AppContext);
  const [tagFilter, setTagFilter] = React.useState<Array<string> | undefined>(
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
  const handleApplyAttributeFilter = React.useCallback(
    (key: string, value: string | undefined) => {
      setAttributeFilters((prev) => {
        if (value === undefined) {
          const filters = {
            ...prev,
          };
          delete filters[key];
          return filters;
        }
        return {
          ...prev,
          [key]: value,
        };
      });
    },
    []
  );

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
              if (columnId === 'tags') {
                return (
                  <GridHeaderTagCell
                    tagFilter={tagFilter}
                    renderHeaderCell={renderHeaderCell}
                    onApplyTagFilter={setTagFilter}
                  />
                );
              } else {
                return (
                  <GridHeaderAttributeCell
                    attributeFilters={attributeFilters}
                    columnId={columnId as string}
                    renderHeaderCell={renderHeaderCell}
                    onApplyAttributeFilter={handleApplyAttributeFilter}
                  />
                );
              }
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
