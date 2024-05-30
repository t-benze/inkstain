import path from 'path';
import { SpaceService } from '~/server/services/SpaceService';
// Helper function to get the full file path
export const getFullPath = async (
  spaceService: SpaceService,
  spaceKey: string,
  documentPath: string
): Promise<string> => {
  const space = await spaceService.getSpace(spaceKey);

  if (!space) {
    throw new Error(`The space '${spaceKey}' does not exist.`);
  }

  const resolvedPath = path.resolve(space.path, documentPath);
  const relative = path.relative(space.path, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid file path. Possible directory traversal attempt.');
  }

  return resolvedPath;
};
