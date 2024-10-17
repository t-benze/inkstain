import * as React from 'react';
import { Document, SystemDocumentType, PlatformData } from '~/web/types';

export const useDocuments = (platform: PlatformData | undefined) => {
  const [documentsAlive, setDocumentsAlive] = React.useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = React.useState<string | null>(
    documentsAlive[0] ? documentsAlive[0].name : null
  );
  const activeDocumentViewRef = React.useRef<unknown>(null);

  React.useEffect(() => {
    const document = documentsAlive.find(
      (document) => document.name === activeDocument
    );
    if (!document) {
      setActiveDocument(documentsAlive[0] ? documentsAlive[0].name : null);
    }
  }, [documentsAlive, activeDocument]);

  const openSystemDocument = React.useCallback(
    (type: SystemDocumentType) => {
      setDocumentsAlive((documentsAlive) => {
        if (documentsAlive.find((document) => document.name === type))
          return documentsAlive;
        const newDocumentsAlive = [...documentsAlive];
        newDocumentsAlive.push({ type, name: type });
        return newDocumentsAlive;
      });
      setActiveDocument(type);
    },
    [setDocumentsAlive]
  );

  const openDocument = React.useCallback(
    (name: string) => {
      setDocumentsAlive((documentsAlive) => {
        const documentType = name.split('.').pop();
        if (!documentType)
          throw new Error('Document type not recognized: ' + name);
        if (documentsAlive.find((document) => document.name === name))
          return documentsAlive;
        const newDocumentsAlive = [...documentsAlive];
        newDocumentsAlive.push({ type: documentType, name });
        return newDocumentsAlive;
      });
      setActiveDocument(name);
    },
    [setDocumentsAlive, setActiveDocument]
  );

  const closeDocument = React.useCallback(
    (name: string) => {
      setDocumentsAlive((documentsAlive) => {
        const index = documentsAlive.findIndex(
          (document) => document.name === name
        );
        const newDocumentsAlive = [
          ...documentsAlive.slice(0, index),
          ...documentsAlive.slice(index + 1),
        ];
        return newDocumentsAlive;
      });
    },
    [setDocumentsAlive]
  );

  const setActiveDocumentViewRef = React.useCallback(
    (documentViewRef: unknown) => {
      activeDocumentViewRef.current = documentViewRef;
    },
    []
  );

  const renameDocumentPath = React.useCallback(
    ({
      target,
      newName,
      isFolder,
    }: {
      target: string;
      newName: string;
      isFolder: boolean;
    }) => {
      if (!platform) throw new Error('Platform data not loaded');
      const pathSep = platform.pathSep;
      const newPath = target
        .split(pathSep)
        .slice(0, -1)
        .concat([newName])
        .join(pathSep);
      setDocumentsAlive((documentsAlive) => {
        return documentsAlive.map((document) => {
          if (document.name.startsWith(target)) {
            return {
              ...document,
              name: document.name.replace(target, newPath),
            };
          }
          return document;
        });
      });
      setActiveDocument((activeDocument) => {
        if (activeDocument && activeDocument.startsWith(target)) {
          return activeDocument.replace(target, newPath);
        }
        return activeDocument;
      });
    },
    [setDocumentsAlive, setActiveDocument, platform]
  );

  return {
    openSystemDocument,
    openDocument,
    closeDocument,
    documentsAlive,
    activeDocument,
    setActiveDocument,
    activeDocumentViewRef,
    setActiveDocumentViewRef,
    renameDocumentPath,
  };
};
