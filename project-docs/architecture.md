# Introduction

The InkStain project aims to provide a software solution that allows users to serve, manage, and interact with documents straight from their local file system using a web browser. The core feature set includes viewing different types of documents (PDFs, images, Markdown), and providing user interaction capabilities such as annotations, highlights, and markups. Organization features such as tagging, adding custom metadata, and notes to documents are also integral to the system. The application is designed with scalability and ease of synchronization with cloud-based storage solutions in mind.

# Problem Analysis

One of the main challenges is storing metadata and user-generated content, like annotations, in a manner that is both manageable on a local file system and conducive to syncing with cloud storage services. To address this, we will implement a novel file-based storage approach. The solution encapsulates each document within its own directory, with a `.ink` suffix, containing both the original document and a JSON file to store associated data. This structure preserves the integrity of the original document and facilitates easy syncing with cloud services.

An example file `test.txt` under the folder 'test folder' as below:

```
> test folder
  > test.txt.ink
    > content.txt
    > meta.json
```

# Terminology

- **Document**: Any file that contains information for viewing, such as PDFs, images or Markdown files.

# Tech Stack

## Server-Side

The server-side of InkStain will be built using Node.js and TypeScript for robust back-end functionality. Koa will be used as our lightweight web framework to handle HTTP requests and middleware. For logging, Winston will be used to provide a versatile logging library capable of outputting logs in different formats and handling transport mechanisms for log data.

Dependencies:

- **Node.js**: Runtime environment.
- **TypeScript**: Typed superset of JavaScript for writing clearer, more reliable code.
- **Koa**: Web framework optimized for building efficient and scalable web APIs.
- **Winston**: Library for logging purposes.

## Web Client-Side

The web client will be implemented using React, to provide a modern user interface with a component-based architecture. For user interface design, we will utilize the @fluentui/react-components library which provides a set of pre-made, customizable components conforming to Microsoft's Fluent UI system. Additionally, `react-router-dom` is used for declarative client-side routing, allowing us to build a single-page application with navigation between different components.

Dependencies:

- **React**: Framework for building the user interface.
- **@fluentui/react-components**: Microsoft's Fluent UI component library for React.
- **react-router-dom**: Declarative routing for React applications, facilitating navigation between components.
- **i18next**: i18n framework.

## Testing

This project uses cypress for e2e testing (both api and ui) and UI component testing.

## Project Utilities

- **NX**: Tooling to support a monorepo structure, improve build times, and manage the linking of library dependencies in an Integrated Repos manner.
- **Monorepo**: A strategy for organizing the project that houses both the client-side and server-side code in a single repository for easier management and cross-dependency integration.

## Cloud Services

- AWS Textract: For document intelligence, i.e., text detection and layout analysis.

# Solution Details

## Meta Data

Each document is associated with a meta.json file that stores its meta data. This section defines the legitimate schema of the meta data.

- mimetype: the media type of the document
- tags: for document tagging
- attributes: document attributes
