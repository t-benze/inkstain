export interface Message {
  message: string;
  role: 'user' | 'assistant';
}

export interface CodeBlock {
  code: string;
  extension: string;
  id: string;
}
