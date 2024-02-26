# Application

The InkStain application is a document management system designed for efficient interaction with local documents through a web browser. The application emphasizes space efficiency and user experience with specialized document viewing modes and metadata editing capabilities.

## MenuBar

The MenuBar is a condensed top-level navigation component that provides access to core features:

- InkStain Logo: Doubles as a home button, redirecting users to the Main page.
- Menu Items: Dropdowns for quick access to 'Spaces', 'Recent Documents', 'Settings', and 'Search'.
- User Profile: Allows users to manage their account settings and log out.

## Primary Sidebar (Collapsible)

Provides navigational capabilities within the chosen 'Space':

- Space Explorer: A tree view for document and folder navigation.
- Collapse/Expand Toggle: Allows users to adjust sidebar visibility.

## Main Area

The main working area of the application.

### Tab Container (Document Viewer)

The main area mainly consist of a Tab Container for viewing and editing the opened documents:

- Document Tabs: Tabs for each opened document.
- Viewer/Editor: Space adapts to display the viewer or editor suitable for the document type.

#### Space Management

A page for managing 'Spaces', where users can organize groups of related documents:

- 'Spaces' List: Shows existing 'Spaces', with options like open, edit, and delete.
- Create 'Space' Button: Initiates the creation of a new 'Space', prompting the user to provide a name.
- Open 'Folder' Button: Open an existing folder that is a inkstain space.

#### Settings Page

A page for presenting settings options for the user:

- Application Preferences: Customise application behavior and appearance.
- Metadata Templates: Set up structures for custom metadata fields and tags.

## Secondary Sidebar (Metadata Panel)

Displays and allows editing of the metadata for the active document in the Main Area:

- Metadata Display: Shows the document's tags, notes, and custom metadata.
- Edit Metadata Button: Enables direct metadata editing from the Main Page.
