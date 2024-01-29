# Application

The InkStain application is a document management system designed for efficient interaction with local documents through a web browser. The application emphasizes space efficiency and user experience with specialized document viewing modes and metadata editing capabilities.

## MenuBar

The MenuBar is a condensed top-level navigation component that provides access to core features:

- InkStain Logo: Doubles as a home button, redirecting users to the Main page.
- Menu Items: Dropdowns for quick access to 'Spaces', 'Recent Documents', 'Settings', and 'Search'.
- User Profile: Allows users to manage their account settings and log out.

<<<<<<< HEAD

## Space Management Page

A page dedicated to the management of 'Spaces', where users can organize groups of related documents:

- 'Spaces' List: Shows existing 'Spaces', with options like open, edit, and delete.
- Create 'Space' Button: Initiates the creation of a new 'Space', prompting the user to provide a name.

=======

> > > > > > > ef38652 (feat: space management)

## Main Page

The Main Page serves as the workspace after selecting a 'Space', featuring a file explorer, tabs for documents, and a metadata sidebar:

### Primary Sidebar (Collapsible)

Provides navigational capabilities within the chosen 'Space':

- Space Explorer: A tree view for document and folder navigation.
- Collapse/Expand Toggle: Allows users to adjust sidebar visibility.

### Tab List (Document Viewer)

The main area for managing and editing documents:

- Document Tabs: Tabs for each opened document.
- Viewer/Editor: Space adapts to display the viewer or editor suitable for the document type.

### Secondary Sidebar (Metadata Panel)

Displays and allows editing of the metadata for the active document:

- Metadata Display: Shows the document's tags, notes, and custom metadata.
- Edit Metadata Button: Enables direct metadata editing from the Main Page.

## Settings Dialog

<<<<<<< HEAD
An overlay that can be brought up from the MenuBar, presenting settings options for the user:
=======
A dialog that can be brought up from the MenuBar, presenting settings options for the user:

> > > > > > > ef38652 (feat: space management)

- Account Settings: Update user profile and security settings.
- Application Preferences: Customise application behavior and appearance.
- Metadata Templates: Set up structures for custom metadata fields and tags.
  <<<<<<< HEAD
  =======

## Space Management Page

A page dedicated to the management of 'Spaces', where users can organize groups of related documents:

- Recent 'Spaces' List: Shows recent 'Spaces' that have been opened
- Create 'Space' Button: Initiates the creation of a new 'Space', prompting the user to provide a name.
- Open 'Space': Open an existing space on the file system.
- Import folder as "Space": convert an existing file folder into InkStain Space

### DirectoryPicker Dialog

A dialog to pick a directory on local file system and return the file path.

> > > > > > > ef38652 (feat: space management)
