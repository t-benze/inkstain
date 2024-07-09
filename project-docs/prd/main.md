# InkStain

InkStain is a document management software that allows users to serve local files in the browser for viewing and provides functionalities to assist the user in managing and interacting with the documents. It also provides some built-in functions to create meta data for the documents, such as tagging and annotations.

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
- Allow users to open an existing space folder and reindex documents

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

1. **Open and Display**: Support seamless opening and displaying of PDF documents, ensuring formatting fidelity.
2. **Navigation Controls**: Provide tools for page navigation, including previous/next, direct page entry, continuous scroll, and an overview panel with page thumbnails.
3. **Zoom and Page Fit**: Offer zooming capabilities and page fit options like fit-to-width/page for diverse screen sizes and detailed document inspection.

#### Non-Functional Requirements:

1. **Fast Rendering**: Ensuring quick load times and smooth interaction, even for content-rich PDFs.

#### Feature - PDF Outline

Shows the outline of the active pdf document in the primary sidebar.

#### Feature - PDF Thumbnail

Shows the thumbnail of the active pdf document in the primary sidebar.

#### Feature - PDF Text Layer

Utilise AWS Textract service to detect texts and analyze the page layout using machine intelligence, and then renders a text layer. Because this feature relies on AWS service,
it should only be enabled for authenticated users who subscribe for it.

##### Function Requirements

1. **Text Interaction**: Allow selection, copying, and text highlight functionality.

## Feature: Document Tagging

### Overview

The document tagging feature allows users to categorize their documents efficiently by adding tags, assisting in organization and retrieval processes.

### User Stories

- **US1: Add Tags to a Document**
  - As a user, I want to add tags to a document so that I can categorize it for easier access and organization.
- **US2: Remove Tags from a Document**
  - As a user, I want to remove tags from a document to update its categorization or correct a tagging mistake.
- **US3: Filter Documents by Tags**
  - As a user, I want to filter documents based on tags so that I can quickly find a group of documents under the same category.
- **US4: Display Tags on Documents**
  - As a user, I want to view all tags on a document to understand its categorization and context quickly.
- **US5: Autocomplete Tags**
  - As a user, I want a tag autocomplete feature when adding tags to minimize typing and ensure tag consistency.

### Functional Requirements

1. **Tagging System**

   - Provide an interface for the user to add, remove, and view tags associated with a document.
   - Tags should be visible on the document's entry in the file system and in the dedicated document viewer/editor.
   - Implement an autocomplete feature that suggests the existing tags as the user types.
   - Allow users to add multiple tags to a document.

2. **Filter by Tags**
   - Implement a search or filter interface where users can select one or more tags to filter the document list accordingly.
   - Update the document viewer dynamically based on the tags selected by the user.

### Non-Functional Requirements

1. **Usability**

   - The tagging interface should be intuitive and easily accessible via the document's detailed view.
   - Implement tagging with minimal clicks and typing to enhance user experience.
   - Autocomplete suggestions should populate quickly and accurately as the user begins typing.

2. **Performance**

   - Tagging operations and tag-based filtering should be efficient and must not degrade performance as the number of documents or tags increases.
   - The system should handle a high volume of documents and tags without any delays or performance bottlenecks.

3. **Scalability**

   - The system should support scaling both in terms of the number of documents handled and the number of concurrent users tagging documents.
   - Ensure that tagging and filtering systems can scale as the document repository grows.

4. **Reliability**
   - Ensure that all tagging actions are processed reliably and users see consistent tag-related information across different views of the document.

**Note**: Each tag should be stored in a centralized database management system to ensure uniformity and consistency across the application.

## Feature: Document Attributes

### Overview

The "Document Attributes" feature allows users to view and manage meta-information associated with their documents. This metadata can be automatically extracted from the documents or manually entered by the users, providing detailed insights and context about the document content.

### User Stories

- **US1: View Document Attributes**
  - As a user, I want to view the attributes associated with a document to understand its metadata and context.
- **US2: Edit Document Attributes**
  - As a user, I want to manually add or modify attributes of a document to ensure the metadata is accurate and up-to-date.
- **US3: Auto-extract Document Attributes**
  - As a user, I want certain attributes of the document to be automatically extracted (such as author, creation date, etc.) to save time and effort.
- **US4: Search by Document Attributes**
  - As a user, I want to search documents based on their attributes so that I can quickly find documents based on specific criteria.

### Functional Requirements

1. **Attribute Management System**

   - Provide an interface for users to view, add, and edit attributes associated with a document.
   - Some attributes should be auto-extracted using content recognition technologies when a document is first loaded or uploaded to the system.
   - Allow the addition of custom attributes where users can define both the attribute name and its value.

2. **Auto-extraction of Attributes**

   - Implement algorithms or integrate with third-party services to extract common metadata such as title, author, created date, modified date, and keywords from documents, especially from structured formats like PDF, Word, and others.

3. **Search Integration**
   - Enhance the existing search system to include document attributes in the search criteria, allowing filtering and searching by both standard and custom attributes.

### Non-Functional Requirements

1. **Usability**

   - The interface for managing document attributes should be user-friendly and integrated seamlessly within the existing document management system.
   - Attribute editing should be straightforward, with type-ahead support and dropdown selections for predefined attribute types to prevent entry errors.

2. **Performance**

   - The auto-extraction of document attributes should be performed efficiently to minimize processing time and not affect the user's experience negatively.
   - Ensure the search functionality remains fast and accurate even as the complexity of metadata and volume of documents increase.

3. **Scalability**

   - The system should efficiently handle an increasing volume of documents and metadata without degradation in performance.
   - It should support a wide range of document types and sizes for attribute extraction and searching.

4. **Reliability**
   - Ensure accurate and consistent auto-extraction of attributes across various document types.
   - Maintain data integrity when attributes are added, edited, or deleted to ensure that metadata consistently reflects the document's content.

## Feature: Document Indexing and Searching

### Overview

This document outlines the design for the document indexing and searching feature in InkStain, focusing on utilizing document tags and attributes to enhance document retrieval and organization.

### User Stories

- As a user, I want to search documents by tags so that I can quickly find documents related to a specific topic.
- As a user, I want to filter documents by attribute values (e.g., author, creation date) to narrow down search results.
- As a user, I want autocomplete suggestions while searching to reduce typing and ensure consistent tag usage.

### Functional Requirements

#### Indexing

1. **Tag Indexing**: Automatically index new and modified tags.
2. **Attribute Indexing**: Index system-extracted and user-defined attributes.
3. **Real-Time Updates**: Reflect changes in tags and attributes in the indexes immediately.

#### Searching

1. **Search Interface**:
   - Search bar for keyword searches.
   - Filter options for tags and attributes.
   - Display results with highlights and metadata.
2. **Backend Search Logic**:
   - Interpret and parse user search queries.
   - Perform efficient lookups in indexes.
   - Rank and sort search results based on relevance.
   - Return structured results to the frontend.

### Non-Functional Requirements

1. **Performance**: Fast indexing and retrieval times.
2. **Scalability**: Handle a large volume of documents and concurrent users.
3. **Usability**: Intuitive and responsive search interface.
4. **Reliability**: Consistent and accurate indexing and search results.
5. **Extensibility**: Capability to extend the system to include more document types and metadata in the future.

## Feature - Document Annotation

A system for users to highlight, take notes, and draw onto the PDF document, facilitating interactive reading and content review.

Technically, the annotation system consists of two parts: objects and comments. Users can create a few types of objects: page bookmarks, text highlights, and drawings. And comments are text associated with an object. (Based on the document type, the object types could be extended).

### User Stories

- **US1**: As a user, I want to highlight text within a PDF document so that I can mark important information.
- **US2**: As a user, I want to add comments or notes to specific sections of a PDF for better contextual understanding and reference.
- **US3**: As a user, I want to draw shapes and freehand annotations on a PDF to illustrate or emphasize content visually.
- **US4**: As a user, I want to manage my annotations, including editing and deleting them, to keep my document annotations relevant and up to date.
- **US5**: As a user, I want to view a summary or list of all annotations within a PDF to quickly navigate to relevant sections.

### Functional Requirements

1. **Text Highlighting**

   - Allow users to select text and apply different highlight colors.
   - Provide a color picker or a predefined palette of colors for highlights.

2. **Adding Comments and Notes**

   - Enable users to attach comments or notes to specific points in the PDF.
   - Support both text-based comments and rich text formatting (bold, italics, bullet points).

3. **Drawing and Freehand Annotations**

   - Offer tools for drawing shapes (rectangle, ellipse, lines) and freehand drawings.
   - Provide options to adjust the thickness and color of drawn annotations.

4. **Annotation Management**

   - Allow users to edit existing annotations, including changing colors, shapes, and text content.
   - Enable users to delete unwanted annotations.

5. **Annotation Summary and Navigation**

   - Create a sidebar or overlay that summarizes all annotations in the document.
   - Enable users to click on an entry in the summary to navigate directly to the annotated section.

6. **Saving and Exporting Annotations**
   - Ensure all annotations are saved locally to allow persistence across sessions.
   - Offer an option to export the annotated PDF or a separate file containing the annotations.

### Non-Functional Requirements

1. **Performance**

   - Ensure annotations are applied and rendered quickly without lag, even on large PDFs.
   - Optimize storage and retrieval of annotations for quick access.

2. **Usability**

   - Design an intuitive and user-friendly interface for applying and managing annotations.
   - Provide tooltips and guides to help users understand the functionality of various annotation tools.

3. **Accessibility**

   - Ensure the annotation tools are accessible via keyboard shortcuts.
   - Comply with accessibility standards to support users with disabilities.

4. **Portability**

   - Ensure compatibility across different operating systems and web browsers.
   - Maintain consistent annotation functionality and appearance across platforms.

5. **Security**

   - Implement data protection measures to secure user annotations and prevent unauthorized access.
   - Encrypt annotations data when saved locally or transmitted over the network.

6. **Reliability**
   - Ensure the consistency and accuracy of annotations, preserving their positions and formatting across different viewing sessions.
   - Prevent loss of annotations due to application crashes or unintended actions.
