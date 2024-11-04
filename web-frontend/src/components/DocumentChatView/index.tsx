import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  makeStyles,
  Button,
  tokens,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  MenuList,
  MenuItem,
  Textarea,
} from '@fluentui/react-components';
import {
  Send24Regular,
  AddSquareRegular,
  HistoryRegular,
} from '@fluentui/react-icons';
import { MessageList } from './MessageList';
import { chatApi } from '~/web/apiClient';
import { ChatMessage } from '@inkstain/client-api';
import { useTranslation } from 'react-i18next';

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
});

interface ChatViewProps {
  spaceKey: string;
  documentPath: string;
}

export const ChatView = ({ spaceKey, documentPath }: ChatViewProps) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [message, setMessage] = React.useState('');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value);
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    if (sessionList && sessionList.length > 0) {
      setSessionId(sessionList[0]);
      // queryClient.invalidateQueries({
      //   queryKey: ['chatSession', spaceKey, documentPath, sessionList[0]],
      // });
    }
  }, [sessionList, spaceKey, documentPath, queryClient]);

  const { data: messages } = useQuery({
    queryKey: ['chatSession', spaceKey, documentPath, sessionId],
    queryFn: async () => {
      // const data = await chatApi.intelligenceChatSession
      if (!sessionId) return [] as ChatMessage[];
      const data = await chatApi.getChatSession({
        spaceKey,
        path: documentPath,
        sessionId,
      });
      return data.data;
    },
  });

  const newSessionMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await chatApi.chatNewSession({
        spaceKey,
        path: documentPath,
        chatNewSessionRequest: {
          message,
        },
      });
      return response;
    },
    onMutate: async (message) => {
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, null],
        [{ content: message, role: 'user' }]
      );
    },
    onSuccess: (data) => {
      const currentMessages = sessionId
        ? (queryClient.getQueryData([
            'chatSession',
            spaceKey,
            documentPath,
            sessionId,
          ]) as ChatMessage[])
        : [];
      setSessionId(data.sessionId);
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, data.sessionId],
        [...currentMessages, data.data]
      );
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
      const currentMessages = queryClient.getQueryData([
        'chatSession',
        spaceKey,
        documentPath,
        sessionId,
      ]) as ChatMessage[];
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, sessionId],
        [...currentMessages, { content: message, role: 'user' }]
      );
    },
    onSuccess: (data, params) => {
      const currentMessages = queryClient.getQueryData([
        'chatSession',
        spaceKey,
        documentPath,
        params.sessionId,
      ]) as ChatMessage[];
      queryClient.setQueryData(
        ['chatSession', spaceKey, documentPath, params.sessionId],
        [...currentMessages, data]
      );
    },
  });

  const handleSend = () => {
    if (newSessionMutation.isPending || messageMutation.isPending) {
      return;
    }
    const content = message.trim();
    if (content.length > 0) {
      if (!sessionId) {
        newSessionMutation.mutate(content);
      } else {
        messageMutation.mutate({ sessionId, message: content });
      }
      setMessage(''); // Clearing input after send
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  return (
    <div className={classes.chatInterface}>
      <div className={classes.topButtons}>
        <Button
          icon={<AddSquareRegular />}
          onClick={() => {
            console.log('Add new session');
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
            disabled={newSessionMutation.isPending}
            icon={<Send24Regular />}
            onClick={() => handleSend()}
          />
        </div>
      </div>
    </div>
  );
};

export { ToolbarChatButton } from './ToolbarChatButton';
