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

## Feature - Space

### User Stories

- As a user, I want to create a 'Space' within InkStain to have a dedicated area where I can organize and manage a group of related documents.
- As a user, I want to easily add documents to a 'Space' to ensure that all relevant materials are together and easily accessible.
- As a user, I want to view all documents within a 'Space' so that I can quickly locate the files I need within the context of a specific project or subject area.
- As a user, I want to manage the documents in a 'Space' (such as renaming, deleting, or moving files) to maintain an organized and efficient workspace.

### Functional Requirements

- Provide the functionality to create and name a new 'Space' as a dedicated document management area.
- Allow users to add existing documents or new documents to a 'Space'.
- Implement a browsing interface specific to each 'Space' that displays all contained documents.
- Enable document management within a 'Space', including renaming, deleting, and moving files.

### Non-Functional Requirements

- **Expandability**: Ensure the 'Space' feature can be extended in the future for additional functionalities such as shared collaboration or advanced permissions.
- **Data Organization**: Maintain a structured and intuitive organization of 'Spaces' and their contents, so users can effectively manage their documents.
- **Performance**: The document management operations within a 'Space' should be swift and responsive to facilitate a smooth user experience.
- **Isolation**: Ensure the documents and data in one 'Space' are isolated from others for clean separation of projects or topics.

## Feature - File Explorer

### User Stories

1. **Intuitive File Browsing**:

   - As a user, I want a file explorer integrated into 'Space' to navigate through my files and folders with ease, promoting better organization of my documents.

2. **File and Folder Operations**:

   - As a user, I want to perform standard file operations such as copy, move, rename, and delete within the file explorer to manage my documents efficiently.

3. **Folder Creation and Management**:
   - As a user, I want to create new folders and organize files into them within 'Space' to better structure my work.

### Functional Requirements

1. **Explorer Interface**:
   - Provide a graphical file explorer as part of the 'Space' feature.
   - Enable navigation through documents and folders within the explorer.
2. **File Operations**:
   - Implement file operations such as copy, paste, move, rename, and delete.
   - Allow users to perform these operations through right-click context menus and drag-and-drop actions.
3. **Folder Management**:
   - Enable users to create new folders, nest folders, and organize files accordingly.
   - Provide a clear way to navigate back and forth between parent and child folders.

### Non-Functional Requirements

1. **Usability**:
   - The file explorer should be user-friendly and easy to use, following well-established conventions for file browsing experiences.
2. **Responsiveness**:
   - The file explorer should load quickly and react promptly to user commands to ensure a smooth experience.
3. **Visual Clarity**:
   - Use clear, distinct icons and a tidy layout to represent files, folders, and operations to avoid user confusion.
4. **Accessibility**:
   - Support keyboard navigation and comply with accessibility standards to accommodate all users.

## Feature - Document Viewer

This design document outlines the user stories, functional, and non-functional requirements for the Document Viewer feature of the InkStain document management application.

### User Stories

- As a user, I need a unified way to view different types of documents within the InkStain app to simplify my workflow and avoid switching between multiple programs.
- As a user, I want interactive viewing features like zoom and text search that adjust based on the document type for a better reading and exploration experience.
- As a user, I require quick and easy navigation options within documents that can cater to longer or more complex documents without affecting my ability to manage and organize them within InkStain.

### Functional Requirements

**File Support and Viewing Interface**

1. Support generic viewing capabilities for diverse document types including, but not limited to, PDFs, images, and text-based documents like Markdown files.
2. Customize viewer interface components based on document characteristics; for instance, text selection for PDFs.

**Interaction Features**

1. Navigational tools such as page thumbnails or content/table-of-contents sidebar scalable to the document format in use (e.g., PDFs or Markdown files with defined headers).
2. Search function capable of matching text patterns appropriate to the document type, like exact text search in text-heavy documents.
3. For image documents, include a viewer with pan, zoom, and possibly rotate functionalities to examine graphical content in detail.

**Integration with Other Features**

1. Ability to incorporate InkStain’s features such as tagging, and metadata into the viewer, ensuring document management remains cohesive across the application.
2. Implement annotation tools scalable to the document type, allowing for markup on images or comments within text-based documents.

### Non-Functional Requirements

**Performance**

1. Document loading and interaction must be efficient, minimizing latency for a seamless user viewing experience across all supported document types.
2. Handling large documents or high-resolution images with minimal performance impact to the application.

**Usability**

1. Maintain a unified set of interaction patterns throughout the various document viewer interfaces for ease of use.
2. Introduce a clean and accessible UI that complements the InkStain environment, promoting a distraction-free viewing experience.

**Reliability**

1. Consistent and accurate rendering of all supported document types, maintaining the integrity of the document’s original format.
2. Implement resilient features for document interaction to ensure consistent performance despite varied user actions.

**Extensibility**

1. Build a modular viewer interface that can be easily adapted or extended to support additional document types in the future without a comprehensive redesign.
2. Allow for future enhancements like collaborative features or advanced editing options within the viewer framework.

### Feature - PDF View

#### Functional Requirements:

**Basic Viewing and Navigation**

1. **Open and Display**: Support seamless opening and displaying of PDF documents, ensuring formatting fidelity.
2. **Navigation Controls**: Provide tools for page navigation, including previous/next, direct page entry, continuous scroll, and an overview panel with page thumbnails.
3. **Zoom and Page Fit**: Offer zooming capabilities and page fit options like fit-to-width/page for diverse screen sizes and detailed document inspection.

**Advanced Interaction**

1. **Text Interaction**: Allow selection, copying, and in-document text search functionality.
2. **Hyperlink Support**: Embed clickable links within the PDF, enabling direct navigation to referenced websites.
3. **Annotation System**: Implement a system for users to highlight, take notes, and draw onto the PDF document, facilitating interactive reading and content review.

#### Non-Functional Requirements:

1. **Fast Rendering**: Ensuring quick load times and smooth interaction, even for content-rich PDFs.

#### Feature - PDF Outline

Shows the outline of the active pdf document in the primary sidebar.

#### Feature - PDF Thumbnail

Shows the thumbnail of the active pdf document in the primary sidebar.
