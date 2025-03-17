import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  makeStyles,
  Toast,
  ToastBody,
  ToastTitle,
  Button,
  tokens,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  MenuList,
  MenuItem,
  Textarea,
  useToastController,
  Checkbox,
  Caption1,
} from '@fluentui/react-components';
import {
  Send24Regular,
  AddSquareRegular,
  HistoryRegular,
} from '@fluentui/react-icons';
import { MessageList } from './MessageList';
import { chatApi } from '~/web/apiClient';
import { ChatMessage, ResponseError } from '@inkstain/client-api';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '~/web/app/hooks/useAppContext';

type ChatSessionData = {
  withDocument: boolean | null;
  data: ChatMessage[];
};

const useClasses = makeStyles({
  chatInterface: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
    boxShadow: tokens.shadow4,
  },

  messageList: {
    flexGrow: 1,
    minWidth: '640px',
    width: '960px',
    maxWidth: '90%',
    paddingBottom: '100px',
  },

  inputOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    backgroundColor: tokens.colorNeutralBackground1,
  },

  messageInput: {
    bottom: 0,
    left: `50%`,
    transform: `translateX(-50%)`,
    height: '80px',
    minWidth: '640px',
    width: '960px',
    maxWidth: '90%',
    position: 'absolute',
  },

  messageInputTextArea: {
    width: '100%',
    height: '100%',
    paddingRight: '60px',
  },

  sendButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: tokens.spacingHorizontalS,
  },

  topButtons: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    right: tokens.spacingHorizontalXXXL,
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
  },

  quoteBlock: {
    position: 'absolute',
    display: 'block',
    bottom: '90px',
    width: '960px',
    minWidth: '640px',
    maxWidth: '90%',
    left: `50%`,
    transform: `translateX(-50%)`,
    padding: '10px 20px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: `5px solid ${tokens.colorBrandBackground}`,
    fontStyle: 'italic',
    '::before': {
      content: '"“"',
      fontSize: '2em',
      lineHeight: '0.1em',
      marginRight: '10px',
      verticalAlign: '-0.4em',
    },
  },
});

interface ChatViewProps {
  spaceKey: string;
  documentPath: string;
  quote?: string;
}

export const ChatView = ({ spaceKey, documentPath, quote }: ChatViewProps) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [message, setMessage] = React.useState('');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value);
  const { toasterId } = useAppContext();
  const { dispatchToast } = useToastController(toasterId);
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [withDocument, setWithDocument] = React.useState(false);
  const { data: sessionList } = useQuery({
    queryKey: ['chatSessionList', spaceKey, documentPath],
    queryFn: async () => {
      const data = await chatApi.getSessionList({
        spaceKey,
        path: documentPath,
      });
      return data;
    },
  });
  const showErrorToast = React.useCallback(
    (title: string, message: string) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{title}</ToastTitle>
          <ToastBody>{message}</ToastBody>
        </Toast>,
        {
          position: 'top',
          intent: 'error',
          timeout: 2000,
        }
      );
    },
    [dispatchToast]
  );

  React.useEffect(() => {
    if (sessionList && sessionList.length > 0) {
      setSessionId(sessionList[0]);
    }
  }, [sessionList, spaceKey, documentPath, queryClient]);

  const { data: sessionData } = useQuery({
    queryKey: ['chatSession', spaceKey, documentPath, sessionId],
    queryFn: async () => {
      // const data = await chatApi.intelligenceChatSession
      if (!sessionId) return { data: [] as ChatMessage[], withDocument: null };
      const data = await chatApi.getChatSession({
        spaceKey,
        path: documentPath,
        sessionId,
      });
      return data as ChatSessionData;
    },
  });
  const messages = sessionData?.data;

  const newSessionMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await chatApi.chatNewSession({
        spaceKey,
        path: documentPath,
        withDocument: withDocument ? '1' : '0',
        chatNewSessionRequest: {
          message,
        },
      });
      return response;
    },
    onMutate: async (message) => {
      queryClient.setQueryData(['chatSession', spaceKey, documentPath, null], {
        withDocument,
        data: [{ content: message, role: 'user' }],
      });
    },
    onSuccess: (data, query) => {
      setSessionId(data.sessionId);
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, data.sessionId],
        {
          withDocument,
          data: [{ content: query, role: 'user' }, data.data],
        } as ChatSessionData
      );
    },
    onError: async (error) => {
      if (error instanceof ResponseError) {
        const errorData = await error.response.json();
        if (errorData.error === 'NotInitialized') {
          showErrorToast(
            t('chat_service_not_initialized'),
            t('chat_service_need_api_key')
          );
          return;
        }
      }
      showErrorToast(t('unknown_error'), '');
    },
  });

  const messageMutation = useMutation({
    mutationFn: async ({
      sessionId,
      message,
    }: {
      sessionId: string;
      message: string;
    }) => {
      const response = await chatApi.chatNewMessage({
        spaceKey,
        path: documentPath,
        chatNewMessageRequest: {
          sessionId,
          message,
        },
      });
      return response;
    },
    onMutate: async ({ sessionId, message }) => {
      const currentData = queryClient.getQueryData([
        'chatSession',
        spaceKey,
        documentPath,
        sessionId,
      ]) as ChatSessionData;
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, sessionId],
        {
          ...currentData,
          data: [...currentData.data, { content: message, role: 'user' }],
        }
      );
    },
    onSuccess: (data, params) => {
      const currentData = queryClient.getQueryData([
        'chatSession',
        spaceKey,
        documentPath,
        params.sessionId,
      ]) as ChatSessionData;
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, params.sessionId],
        {
          ...currentData,
          data: [...currentData.data, data],
        }
      );
    },
    onError: async (error) => {
      if (error instanceof ResponseError) {
        const errorData = await error.response.json();
        if (errorData.error === 'NotInitialized') {
          showErrorToast(
            t('chat_service_not_initialized'),
            t('chat_service_need_api_key')
          );
          return;
        }
      }
      console.error(error);
    },
  });

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [quoteState, setQuoteState] = React.useState<string | undefined>(quote);

  const handleSend = () => {
    console.log(
      'sending',
      newSessionMutation.isPending,
      messageMutation.isPending
    );
    if (newSessionMutation.isPending || messageMutation.isPending) {
      return;
    }
    let content = message.trim();
    if (quoteState) {
      content = `> ${quoteState}\n\n${content}`;
    }
    if (content.length > 0) {
      if (!sessionId) {
        newSessionMutation.mutate(content);
      } else {
        messageMutation.mutate({ sessionId, message: content });
      }
      setQuoteState(undefined);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className={classes.chatInterface}>
      <div className={classes.topButtons}>
        <Checkbox
          label={t('chat_with_document_content')}
          size="large"
          checked={sessionData?.withDocument ?? withDocument}
          disabled={sessionData?.withDocument !== null}
          onChange={(e, data) => {
            setWithDocument(data.checked as boolean);
          }}
        />
        <Button
          icon={<AddSquareRegular />}
          onClick={() => {
            queryClient.setQueryData(
              ['chatSession', spaceKey, documentPath, null],
              []
            );
            setSessionId(null);
          }}
        />
        <Popover
          positioning={'below-start'}
          open={isPopoverOpen}
          onOpenChange={(e, data) => {
            setIsPopoverOpen(data.open);
          }}
        >
          <PopoverTrigger>
            <Button icon={<HistoryRegular />} />
          </PopoverTrigger>
          <PopoverSurface>
            <MenuList>
              {sessionList?.map((sessionId) => (
                <MenuItem
                  key={sessionId}
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setSessionId(sessionId);
                  }}
                >
                  {new Date(
                    parseInt(sessionId.replace('chat-', ''))
                  ).toLocaleString()}
                </MenuItem>
              ))}
            </MenuList>
          </PopoverSurface>
        </Popover>
      </div>

      <div className={classes.messageList}>
        <MessageList messages={messages || []} />
      </div>
      {quoteState && (
        <Caption1
          className={classes.quoteBlock}
          block={true}
          truncate={true}
          wrap={false}
        >
          {quoteState}
        </Caption1>
      )}
      <div className={classes.inputOverlay} />
      <div className={classes.messageInput}>
        <Textarea
          root={{
            className: classes.messageInputTextArea,
          }}
          onKeyDown={handleKeyPress}
          value={message}
          placeholder={t('chat_input_placeholder')}
          onChange={handleChange}
        />
        <div className={classes.sendButton}>
          <Button
            disabled={newSessionMutation.isPending || messageMutation.isPending}
            icon={<Send24Regular />}
            onClick={() => handleSend()}
          />
        </div>
      </div>
    </div>
  );
};

export { ToolbarChatButton } from './ToolbarChatButton';
