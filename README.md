# InkStain Project README

## Overview

InkStain is a comprehensive document management tool designed to serve and interact with documents directly from a user's local file system through a web browser interface. It enables users to view various document types such as PDFs, images, and Markdown files, and provides functionalities for creating metadata like annotations and highlights. The core features focus on accessibility, organization, interactivity, and enhanced user experience.

## Key Features

- **Local Document Serving**: Enable users to access documents from their system within a browser.
- **Specialized Document Viewing**: Tailored components for different document types.
  - PDFs: Text highlights and annotations
  - Images: Markup drawing capabilities
  - Markdown: Real-time view and edit modes
- **Document Organization**: Tagging, custom metadata, and notes to improve file management.
- **Search**: Look up documents by tags, custom data, and attached notes.
- **Data I integrity**: Annotations, highlights, and custom data are stored in a way that does not alter the original documents.
- **Document Management Directory**: `.inkstain` folders encapsulating documents and their metadata for easy management and potential cloud syncing.
- **Scalability**: Designed to manage a growing number of documents and users.

## Technical Architecture

- **Server-Side**: Built using Node.js and TypeScript with Koa as the web framework and Winston for logging.
- **Web Client-Side**: React-based client with @fluentui/react-components for UI design and react-router-dom for client-side routing.
- **Project Structure**: Monorepo managed with NX tooling, containing both client and server codebase for efficient integration and build processes.

## Terminology

- **Document**: Any viewable file, e.g., PDFs, images, Markdown files.
- **InkStain Folder**: A `.inkstain` directory that houses the document and associated data.
- **InkStain File**: A JSON configuration file within the InkStain folder containing metadata.

## Development Principles

1. User convenience and seamless document access.
2. Augmented viewing and editing experiences for document interactions.
3. Efficient document management through metadata creation and search capabilities.
4. Emphasis on non-functional requirements such as performance, security, and reliability.

## User Stories

- Users who need to manage a multitude of documents efficiently.
- Individuals requiring an interactive platform for document annotations and notes.
- Teams looking for a scalable solution for document organization and accessibility.

## Conclusion

InkStain stands out for its thoughtful approach to document management, providing users with a powerful tool to manage, view, and interact with their files without compromising the integrity of the documents. The use of modern technologies ensures a flexible, scalable, and user-friendly platform that adapts to the ever-growing needs of document management.
