import { OpenAI } from 'openai';
import * as readline from 'readline';
import { IntelligenceService } from './IntelligenceService';
import logger from '~/server/logger';
import { FileService } from './FileService';
import { ChatMessage } from '@inkstain/client-api';

// type ChatSession = {
//   messages: {
//     role: string;
//     content: string;
//   }[];
//   documentPath: string;
//   //   documentContentPrompt: OpenAI.Chat.ChatCompletionMessageParam;
//   spaceKey: string;
//   sessionId: string;
// };

// const tools: OpenAI.Chat.ChatCompletionTool[] = [
//   {
//     type: 'function',
//     function: {
//       name: 'retrieve_document',
//       description:
//         'Retrieve the document content for answering user questions.',
//       parameters: {},
//     },
//   },
// ];

export class ChatService {
  openai: OpenAI;

  constructor(
    private readonly intelligenceService: IntelligenceService,
    private readonly fileService: FileService
  ) {
    this.openai = new OpenAI();
  }

  async loadChatSession(
    spaceKey: string,
    documentPath: string,
    sessionId: string
  ) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const readStream = fileManager.createReadStream(
      documentPath,
      `${sessionId}.jsonl`
    );
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });
    const messages: ChatMessage[] = [];
    for await (const line of rl) {
      const session = JSON.parse(line) as ChatMessage;
      messages.push(session);
    }
    return messages;
  }

  async saveChatSession(
    spaceKey: string,
    documentPath: string,
    sessionId: string,
    messages: ChatMessage[]
  ) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    await fileManager.writeFile(
      documentPath,
      `${sessionId}.jsonl`,
      messages.map((m) => JSON.stringify(m)).join('\n')
    );
  }

  async getChatSessionList(spaceKey: string, documentPath: string) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const files = await fileManager.listChatSessions(documentPath);
    return files;
  }

  async createSession(spaceKey: string, documentPath: string, query: string) {
    const sessionId = `chat-${new Date().getTime().toString()}`;
    try {
      const documentContent =
        await this.intelligenceService.extractDocTextContent({
          spaceKey,
          documentPath,
        });
      //   const initPrompt = {
      //     role: 'system',
      //     content: `You are an assistant with access to a document. Use the document only if the question can't be answered from prior conversation context.`,
      //   } as OpenAI.Chat.ChatCompletionMessageParam;
      const initPrompt = {
        role: 'system',
        id: new Date().getTime().toString(),
        content: `You are a helpful assistant answering questions about a specific document. 
        Here is the content of the document:
        
        ${documentContent}

        When answering questions, only use information from this document. If the answer cannot be 
        found in the document, say so. Maintain consistent answers across the conversation. Only
        use information outside of the document when the user suggests so.`,
      };
      //   const documentContentPrompt = {
      //     role: 'system',
      //     content: `Document Content:  \n\n ${documentContent}\n`,
      //   } as OpenAI.Chat.ChatCompletionMessageParam;
      const initMessages = [
        initPrompt,
        // documentContentPrompt,
      ];
      // await this.saveChatSession(
      //   spaceKey,
      //   documentPath,
      //   sessionId,
      //   initMessages
      // );
      const response = await this.handleUserQuery(
        spaceKey,
        documentPath,
        sessionId,
        query,
        initMessages
      );
      return { sessionId, response };
    } catch (error) {
      logger.error('Failed to create chat session:', error);
      throw error;
    }
  }

  async summarizeHistory(
    messageHistory: OpenAI.Chat.ChatCompletionMessageParam[]
  ) {
    const summaryResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Summarize the following conversation to retain key context:',
        },
        ...messageHistory,
      ],
    });
    return summaryResponse.choices[0].message.content;
  }

  async handleUserQuery(
    spaceKey: string,
    documePath: string,
    sessionId: string,
    query: string,
    messageHistory?: ChatMessage[]
  ): Promise<ChatMessage> {
    let sessionMessages = messageHistory;
    if (!sessionMessages) {
      sessionMessages = await this.loadChatSession(
        spaceKey,
        documePath,
        sessionId
      );
    }
    sessionMessages = [
      ...sessionMessages,
      {
        role: 'user',
        content: query,
        id: new Date().getTime().toString(),
      },
    ];
    // Make the API call, passing the registered function for potential use
    const response = await this.openai.chat.completions.create(
      {
        model: 'gpt-4o',
        messages: sessionMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        //   tools: tools,
      },
      {
        stream: false,
      }
    );

    logger.info(
      `LLM API Call, model: gpt-4o, prompt_tokens: ${response.usage?.prompt_tokens}, cached_tokens: ${response.usage?.prompt_tokens_details?.cached_tokens}, total_tokens: ${response.usage?.total_tokens}`
    );
    // Check if the assistant calls the function to retrieve the document
    const choice = response.choices[0];
    // No function call, return the assistant's response
    if (!choice.message.content)
      throw new Error(" Assistant's response is empty");
    const assistantMessage = choice.message.content;
    const newMessage = {
      role: 'assistant',
      content: assistantMessage,
      id: new Date().getTime().toString(),
    } as ChatMessage;
    sessionMessages = [...sessionMessages, newMessage];
    //   const summary = await this.summarizeHistory(messageHistory);
    //   if (!summary) throw new Error('Summary is empty');

    //   logger.debug('Summary:', summary);
    //   this.sessions[sessionId].messages = [
    //     messageHistory[0],
    //     {
    //       role: 'system',
    //       content: summary,
    //     },
    //   ];
    await this.saveChatSession(
      spaceKey,
      documePath,
      sessionId,
      sessionMessages
    );
    return newMessage;
  }
}
