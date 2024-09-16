import path from 'path';
import { SpaceService } from '~/server/services/SpaceService';
import fs from 'fs/promises';
import { Space } from '~/server/types';

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
    throw new Error(
      `Invalid file path: ${space.path}, ${documentPath}, ${resolvedPath}, ${relative}`
    );
  }
  return resolvedPath;
};

export function getDocumentPath(space: Space, documentPath: string) {
  const documentDirectory = documentPath + '.ink';
  return path.join(space.path, documentDirectory);
}

export async function traverseDirectory(
  spaceRoot: string,
  targetPath: string,
  documentsToIndex: string[]
) {
  const files = await fs.readdir(targetPath);
  for (const file of files) {
    const fullPath = path.join(targetPath, file);
    const stat = await fs.lstat(fullPath);
    if (stat.isDirectory()) {
      if (file.endsWith('.ink')) {
        const docPath = path.relative(spaceRoot, fullPath).slice(0, -4);
        documentsToIndex.push(docPath);
      } else {
        traverseDirectory(spaceRoot, fullPath, documentsToIndex);
      }
    }
  }
}
