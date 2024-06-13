import * as React from 'react';
import {
  InteractionTag,
  InteractionTagPrimary,
  TagGroup,
  Button,
  Input,
  makeStyles,
  tokens,
  shorthands,
  InteractionTagSecondary,
} from '@fluentui/react-components';
import { Document } from '~/web/types';
import { AppContext } from '~/web/app/context';
import { useTranslation } from 'react-i18next';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';

const useClasses = makeStyles({
  root: {
    width: '100%',
    ...shorthands.padding(tokens.spacingVerticalS, '0'),
  },
  tagList: {
    marginBottom: tokens.spacingVerticalS,
  },
  addTag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addTagSpacer: {
    width: tokens.spacingHorizontalSNudge,
    height: tokens.spacingVerticalSNudge,
  },
  addTagInput: {
    width: '0px',
    flexGrow: 1,
    marginRight: tokens.spacingHorizontalSNudge,
  },
});
interface DocumentTagViewProps {
  document: Document;
}

export const DocumentTagView = ({ document }: DocumentTagViewProps) => {
  const appContext = React.useContext(AppContext);
  const { t } = useTranslation();
  const classes = useClasses();
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = React.useState<string>('');

  const { data: tags } = useQuery({
    queryKey: ['document-tags', document.name],
    queryFn: async () => {
      if (!appContext.activeSpace) {
        return null;
      }
      return documentsApi.getDocumentTags({
        spaceKey: appContext.activeSpace?.key,
        path: document.name,
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!appContext.activeSpace) {
        return;
      }
      if (!newTag || newTag === '') {
        return;
      }
      await documentsApi.addDocumentTags({
        spaceKey: appContext.activeSpace.key,
        path: document.name,
        addDocumentTagsRequest: {
          tags: [newTag],
        },
      });
    },
    onSuccess: () => {
      setNewTag('');
      queryClient.invalidateQueries({
        queryKey: ['document-tags', document.name],
      });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      if (!appContext.activeSpace) {
        return;
      }
      await documentsApi.removeDocumentTags({
        spaceKey: appContext.activeSpace.key,
        path: document.name,
        removeDocumentTagsRequest: {
          tags: [tag],
        },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-tags', document.name],
      });
    },
  });

  return (
    <SidebarAccordionItem
      headerButtons={null}
      headerText={t('document_tags')}
      panel={
        document && !document.type.startsWith('@inkstain') ? (
          <div className={classes.root}>
            <div className={classes.tagList}>
              <TagGroup
                onDismiss={(_, { value }) => {
                  removeTagMutation.mutate(value);
                }}
              >
                {tags?.map((tag) => (
                  <InteractionTag
                    data-test="documentTagView-tag"
                    shape="circular"
                    appearance="filled"
                    value={tag}
                    key={tag}
                  >
                    <InteractionTagPrimary hasSecondaryAction>
                      {tag}
                    </InteractionTagPrimary>
                    <InteractionTagSecondary aria-label="remove" />
                  </InteractionTag>
                ))}
              </TagGroup>
            </div>
            <div className={classes.addTag}>
              <Input
                data-test="documentTagView-addTagInput"
                className={classes.addTagInput}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button
                data-test="documentTagView-addTagBtn"
                onClick={() => {
                  mutation.mutate();
                }}
              >
                {t('add')}
              </Button>
            </div>
          </div>
        ) : (
          <div>{t('no_active_document')}</div>
        )
      }
    />
  );
};
