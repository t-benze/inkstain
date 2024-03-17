List of reusable UI components.

# DirectoryPickerDialog

Props:

- currentDirectory: a file path indicating the current selected folder, provided by the page showing the dialog
- onSelectDirectory: a callback function to pass the selected directory path.

State:

- currentDirectoryInner: keep track of the current directory selected, initialized from the currentDirectory props.

UI:

- The top part will be a component to show the currentDirectory, it breaks the path of the current directory into segments and render each segements as a MenuButton, with an icon > as the separators.
- The bottom part shows the directories under the current directory (fetched from server), which can be selected and update the currentDirectoryInner state.
- Two action buttons:
  - confirm: confirm the selection, and call the onSelectDirectory to pass the currentDirectoryInner
  - cancel: dismiss dialog without doing anything.

# PDFViewer

The `PDFViewer` component wraps the functionality of pdf.js as a React component.

Props:

- `pdfUrl`: A string representing the URL of the PDF document to be displayed within the viewer.
- `onDocumentLoadSuccess`: An optional function that is called when a PDF document is successfully loaded.
- `onDocumentLoadFailure`: An optional function that is called when there is an error while loading the PDF document.
- `initialPage`: An optional number indicating the page number to be displayed initially (defaults to 1).

State:

- `pdfDocument`: An instance of the PDF document obtained from pdf.js after loading the document from the given URL.
- `currentPageNumber`: The current page number being displayed in the viewer.
- `numPages`: The total number of pages in the loaded PDF document.
- `scale`: The current scale factor applied to the displayed pages (zoom level).
- `loading`: A boolean indicating if the PDF is still loading.

Methods:

- `loadDocument(url)`: A method to load a PDF document from a given URL.
- `renderPage(pageNumber)`: A method to render a page given its page number.
- `goToPage(pageNumber)`: A method to navigate to a specific page, updating the `currentPageNumber`.
- `zoomIn()`: A method to increase the `scale` of the PDF pages.
- `zoomOut()`: A method to decrease the `scale` of the PDF pages.
- `setPageFit()`: A method to fit the displayed page to the viewer width/height.

UI Components:

The `PDFViewer` component essentially consists of the following UI components:

1. **PDF Canvas Display**:
   - A canvas (or series of canvases) highlighting the rendered PDF page(s).
   - Uses pdf.js to paint the PDF content on canvas elements.
2. **Loading Indicator**:
   - Displays when the PDF is being fetched and disappears once rendering begins.
   - Provides visual feedback to users that the document is in the process of loading.
3. **Navigation Controls**:
   - Previous and Next buttons to navigate between pages.
   - An input field for entering a specific page number directly.
   - Current page number and total pages displayed.
4. **Zoom Controls**:
   - Buttons for zooming in and out and for resetting the zoom level.
   - May include additional options for fitting to page or width.
5. **Thumbnails Panel** (Optional):
   - A scrollable list displaying thumbnails of pages for quick navigation.
   - Thumbnails can be clicked to navigate to the respective full-size page.
6. **Error Message Display** (Optional):
   - Shows an error message if the PDF fails to load or if an error occurs during rendering.
7. **Toolbar** (Optional):
   - Collects various control buttons and input fields in a convenient tool area.
