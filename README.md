# InkStain

## Overview

InkStain is a comprehensive document management tool designed to serve and interact with documents directly from a user's local file system through a web browser interface. It enables users to view various document types such as PDFs, images, and inkstain webclips, etc.

- **Local First**: InkStain stores your documents locally as normal files.
- **Retrievable**: InkStain uses AI to help you understand your documents.
- **Intelligent**: InkStain indexes your documents using meta data to make them searchable.

## Key Features

- **Document Management**: Manage your documents in a local folder as a InkStain space.
- **Document Indexing**: InkStain indexes your documents using meta data, such as title, author, tags, etc. to make them searchable.
- **Document Annotation**: Add annotations to your documents.
- **Browser Extension**: Download documents or clip web pages to your InkStain space with a browser extension.
- **Document Intelligence**: Run document layout analysis and OCR on your documents, and chat with them to gain insights.

## Getting Started

```bash
git clone https://github.com/t-benze/inkstain
cd inkstain
npm install
npm run build
npm run start
```

## License

This project is licensed under the GPL-3.0-or-later license. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgments

- [Fluent UI React](https://github.com/microsoft/fluentui) for the UI components.
- [Surya OCR](https://github.com/ankane/surya) for the Local OCR solutions. Model weights by Vikas Paruchuri is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Available at: [HuggingFace](https://huggingface.co/vikp).
