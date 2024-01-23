# InkStain

InkStain is a document management tool that allows user to serve local file to the browser for viewing and edting. It also provides some built-in functions to create meta data for the documents, such as tagging and annotations. 

## Principles

1. It serves document from your local file system and allows you the view the document using a browser.
2. For each type of document, it associates a special view that provides additional functionalities to augment the viewing experience. For example a. PDF: create highlights and annotation b. Image: draw markup c. Markdown: view and edit mode
3. A generic solution to add tag, custom data and notes to your document, which can help you organize your documents and generate insights.

## User Stories

- As a user, I want to serve documents from my local file system so that I can easily access and manage my files using a web browser.
- As a user, I want to view PDF documents with the ability to create highlights and annotations so that I can interact with the content and capture my thoughts and observations.
- As a user, I want to view and markup images to highlight and comment on specific parts of the image for better understanding or communication.
- As a user, I want to have a view and edit mode for Markdown documents to easily modify and see the changes in real-time.
- As a user, I want to add tags, custom data, and notes to documents to improve organization and help generate insights from my files.

## Functional Requirements

1. Access local file system to serve documents through the software interface.
2. Implement specialized viewing components for PDFs, images, and Markdown files.
3. PDF Viewer:
   - Highlight text.
   - Annotate with comments.
4. Image Viewer:
   - Draw and add markup.
5. Markdown Editor:
   - View mode and edit mode with live preview.
6. Document Management:
   - Tagging system for categorization.
   - Custom metadata fields for additional information.
   - Notes attaching capability for documents.
7. Search Functionality:
   - Search by tags, custom data, and note content.
8. Save System:
   - Save changes to highlights, annotations, and markup.
   - Ensure original documents remain unaltered.

## Non-Functional Requirements

1. **Performance**: Software should have fast response times for loading documents and applying user modifications.
2. **Usability**: Intuitive user interface for a streamlined experience across all functionalities.
3. **Scalability**: Capable of managing a growing library of documents and increasing user base.
4. **Portability**: Compatible across different operating systems and accessible via standard web browsers.
5. **Security**: Robust data protection measures to ensure user data privacy and prevent unauthorized file access.
6. **Reliability**: High system uptime with consistent and accurate document rendering.
7. **Data Integrity**: Reliable storage and retrieval of annotations, highlights, and custom user data.
