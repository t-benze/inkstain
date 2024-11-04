import * as React from 'react';
import { Marked } from 'marked';
// import { markedHighlight } from 'marked-highlight';
// import hljs from 'highlight.js';
import { Button, makeStyles } from '@fluentui/react-components';
import {
  CodeRegular,
  PlayRegular,
  PinRegular,
  PinFilled,
} from '@fluentui/react-icons';
import { CodeBlock, Message as MessageType } from './types';
import { ChatMessage } from '@inkstain/client-api';
import { useTranslation } from 'react-i18next';

// const useStyles = makeStyles({
//   buttonSectionInCodeBlock: {
//     position: 'absolute',
//     right: '0',
//     top: '0',
//   },
// });

const marked = new Marked();
// markedHighlight({
//   langPrefix: 'hljs language-',
//   highlight(code, lang, info) {
//     const language = hljs.getLanguage(lang) ? lang : 'markdown';
//     const value = hljs.highlight(code, { language }).value;
//     return value;
//   },
// })

const Content = ({
  content,
  messageId,
}: {
  content: string;
  messageId: string;
}) => {
  const html = content ? marked.parse(content) : '';
  // const styles = useStyles();
  // const discussionContenxt = React.useContext(DiscussionContext);
  const contentRef = React.useRef<HTMLParagraphElement>(null);
  // const [codeElements, setCodeElements] = React.useState<HTMLPreElement[]>([]);

  // React.useEffect(() => {
  //   if (contentRef.current) {
  //     const codeElements = contentRef.current.querySelectorAll('pre');
  //     if (codeElements.length) {
  //       codeElements.forEach((codeElement) => {
  //         codeElement.style.position = 'relative';
  //         const codeEle = codeElement.getElementsByTagName('code')[0];
  //         if (codeEle.className === '') {
  //           codeEle.className = 'hljs language-markdown';
  //         }
  //       });
  //       setCodeElements(Array.from(codeElements));
  //     }
  //   }
  // }, [content]);

  return <p dangerouslySetInnerHTML={{ __html: html }} ref={contentRef}></p>;
};

const Message = ({
  message,
  messageId,
}: {
  message: ChatMessage;
  messageId: string;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <h4>{t(`system.${message.role}`)}</h4>
      <Content content={message.content} messageId={messageId} />
    </>
  );
};

export const MessageList = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message key={message.id} message={message} messageId={message.id} />
      ))}
    </div>
  );
};
