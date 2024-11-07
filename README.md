# InkStain

## Overview

InkStain is a comprehensive document management tool designed to serve and interact with documents directly from a user's local file system. It makes your documents retrievable and provides document
intelligence features like layout analysis and chatting with the document.

## Get Started

```bash
git clone https://github.com/t-benze/inkstain.git
cd inkstain
npm install
npm run build
cp .env.example .env
# fill in your own OPENAI_API_KEY if you'd like to use the chat with document feature
npm run start
```

## Key Features

**Filter documents by tags and attributes**
![filter-documents](https://www.inkstain.io/images/features/filter-documents.png)

**Add Annotations to document**
![add-annotation](https://www.inkstain.io/images/features/document-annotations.png)

**Extract text with OCR**
![document-ocr](https://www.inkstain.io/images/features/document-ocr.png)

**Chat with Document**
![chat-with-document](https://www.inkstain.io/images/features/chat-with-doc.png)

**Download document using browser extension**
![download-with-extension](https://www.inkstain.io/images/features/download-document.png)

**Clip a webpage**
![clip-web-page](https://www.inkstain.io/images/features/webclip.png)

## License

This project is licensed under the GPL-3.0-or-later license. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgments

- [Surya OCR](https://github.com/ankane/surya) for the Local OCR solutions. Model weights by Vikas Paruchuri is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Available at: [HuggingFace](https://huggingface.co/vikp).
- [Fluent UI](https://github.com/microsoft/fluentui), for the UI library used to bulid the frontend.
