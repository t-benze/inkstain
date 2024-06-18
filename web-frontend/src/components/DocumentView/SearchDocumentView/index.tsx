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
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  DocumentSearchResult,
  SearchDocuments200Response,
} from '@inkstain/client-api';

type Item = DocumentSearchResult;

const PAGE_SIZE = 25;
const useClasses = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
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
  columnId,
}: {
  renderHeaderCell: () => React.ReactNode;
  renderInput: () => React.ReactNode;
  hasFilterApplied: boolean;
  onApplyClick: () => void;
  onClearClick: () => void;
  columnId: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const classes = useClasses();
  const { t } = useTranslation();

  const filterButton = (
    <Button
      appearance={'transparent'}
      data-test={`searchDocumentView-filterBtn-${columnId}`}
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
              data-test={`searchDocumentView-clearFilterBtn`}
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
              data-test={`searchDocumentView-applyFilterBtn`}
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
      columnId={columnId}
      hasFilterApplied={hasFilterApplied}
      renderHeaderCell={renderHeaderCell}
      renderInput={() => {
        return (
          <Input
            data-test="searchDocumentView-attributeFilterInput"
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
      columnId="tags"
      renderInput={() => {
        return (
          <Dropdown
            data-test="searchDocumentView-tagFilterDropdown"
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
                    <Option
                      data-test="searchDocumentView-tagFilterOption"
                      key={tag.name}
                      value={tag.name}
                    >
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

  const attributeFilterString = JSON.stringify(attributeFilters);
  const spaceKey = activeSpace!.key;

  const [numOfPagesReached, setNumOfPagesReached] = React.useState(0);
  const { data } = useQuery({
    queryKey: [
      'searchDocuments',
      spaceKey,
      tagFilter,
      attributeFilterString,
      numOfPagesReached,
    ],
    queryFn: async () => {
      const existingData: SearchDocuments200Response['data'] = data
        ? data.documents
        : [];
      const result = await documentsApi.searchDocuments({
        spaceKey,
        tagFilter,
        attributeFilters: attributeFilterString,
        offset: numOfPagesReached * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      systemAttributesRef.current = result.systemAttributes;
      return {
        documents: [...existingData, ...result.data],
        noMore: result.data.length < PAGE_SIZE,
      };
    },
    placeholderData: keepPreviousData,
  });

  const boudingElementRef = React.useRef<HTMLDivElement>(null);
  const bottomElementRef = React.useRef<HTMLDivElement>(null);
  const bottomElementObserver = React.useRef<IntersectionObserver | null>(null);
  React.useEffect(() => {
    bottomElementObserver.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (data && data.documents.length) {
            const pageLoaded = data.documents.length / PAGE_SIZE;
            if (!data.noMore) {
              setNumOfPagesReached(pageLoaded);
            }
          }
        }
      },
      {
        rootMargin: '0px',
        threshold: 0.5,
      }
    );
    const bottomElement = bottomElementRef.current;
    if (bottomElement) {
      bottomElementObserver.current.observe(bottomElement);
    }
    return () => {
      if (bottomElementObserver.current && bottomElement) {
        bottomElementObserver.current.unobserve(bottomElement);
      }
    };
  }, [bottomElementRef, data, numOfPagesReached]);

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
    <div
      className={classes.root}
      ref={boudingElementRef}
      data-test="searchDocumentView"
    >
      <DataGrid
        items={data ? data.documents : []}
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
              <DataGridRow<Item>
                key={rowId}
                data-test="searchDocumentView-result"
              >
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
      {data ? (
        data.noMore ? null : (
          <div
            data-test="searchDocumentView-bottomElement"
            style={{ height: '50px', visibility: 'hidden' }}
            ref={bottomElementRef}
          ></div>
        )
      ) : null}
    </div>
  );
};
