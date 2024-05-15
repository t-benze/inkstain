import path from 'path';
import spaceService from '~/server/services/spaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
// Helper function to get the full file path
export const getFullPath = async (
  spaceKey: string,
  filePath: string
): Promise<string> => {
  const spaces = await spaceService.loadSpaceData();
  const space = spaces[spaceKey];

  if (!space) {
    logger.info('spaces data' + JSON.stringify(spaces));
    throw new Error(`The space '${spaceKey}' does not exist.`);
  }

  const resolvedPath = path.resolve(space.path, filePath);
  const relative = path.relative(space.path, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid file path. Possible directory traversal attempt.');
  }

  return resolvedPath;
};
