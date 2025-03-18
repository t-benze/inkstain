import * as React from 'react';

export const useChatOverlay = () => {
  const [showChat, setShowChat] = React.useState(false);
  const [chatQuote, setChatQuote] = React.useState<string | null>(null);
  const openChatOverlay = (quote?: string) => {
    quote && setChatQuote(quote);
    setShowChat(true);
  };
  const closeChatOverlay = () => {
    setChatQuote(null);
    setShowChat(false);
  };
  console.log('chat overlya', chatQuote);
  return {
    showChat,
    openChatOverlay,
    closeChatOverlay,
    chatQuote,
  };
};
