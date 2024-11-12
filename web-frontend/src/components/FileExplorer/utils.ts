export const getFolderPath = (
  {
    value,
    itemType,
  }: {
    value: string;
    itemType: string;
  },
  pathSep: string
) => {
  if (itemType === 'branch') {
    return value;
  }
  const path = value;
  if (path.lastIndexOf(pathSep) !== -1) {
    return path.slice(0, path.lastIndexOf(pathSep));
  }
  return '';
};
