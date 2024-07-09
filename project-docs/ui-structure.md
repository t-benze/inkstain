# Application

The InkStain application is a document management system designed for efficient interaction with local documents through a web browser. The application emphasizes space efficiency and user experience with specialized document viewing modes and metadata editing capabilities.

## MenuBar

The MenuBar is a condensed top-level navigation component that provides access to core features:

## Primary Sidebar (Collapsible)

Provides navigational capabilities within the chosen 'Space':

- File Explorer: A tree view for document and folder navigation.
- Other views depending on the active document type

## Main Area

The main working area of the application.

### Tab Container (Document Viewer)

The main area mainly consist of a Tab Container for viewing and editing the opened documents:

- Document Tabs: Tabs for each opened document.
- Viewer/Editor: Space adapts to display the viewer or editor suitable for the document type.

#### Space Management

A view for managing 'Spaces', where users can organize groups of related documents:

- 'Spaces' List: Shows existing 'Spaces', with options like open, edit, and delete.
- Create 'Space' Button: Initiates the creation of a new 'Space', prompting the user to provide a name.
- Open 'Folder' Button: Open an existing folder that is a inkstain space.

#### Search Document

A view to search documents in the active space via tags and document attributes

#### PDF Document View

A view for displaying PDF document and tools for annotating and navigating in the document.

## Secondary Sidebar (Metadata Panel)

Displays and allows editing of the metadata (tags, attributes) for the active document in the Main Area:

- Metadata Display: Shows the document's tags, notes, and custom metadata.
- Edit Metadata Button: Enables direct metadata editing from the Main Page.
