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
