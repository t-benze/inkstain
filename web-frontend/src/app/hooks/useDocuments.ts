import * as React from 'react';
import { Document, SystemDocumentType } from '~/web/types';

export const useDocuments = () => {
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

  return {
    openSystemDocument,
    openDocument,
    closeDocument,
    documentsAlive,
    activeDocument,
    setActiveDocument,
    activeDocumentViewRef,
    setActiveDocumentViewRef,
  } as const;
};
