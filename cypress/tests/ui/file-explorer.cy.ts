describe('File Explorer for Space', () => {
  //   const testSpaceKey = 'a116538b';
  const ctx = {} as { homedir: string; pathSep: string };
  before(() => {
    cy.task('platform:get').then(
      (response: { homedir: string; pathSep: string }) => {
        ctx.homedir = response.homedir;
        ctx.pathSep = response.pathSep;
      }
    );
  });

  beforeEach(() => {
    cy.openApp();
    //open test space
    cy.getBySel('recentSpaceBtn-a116538b').click();
  });

  context('Intuitive File Browsing', () => {
    it('should allow users to navigate through files and folders', () => {
      cy.getBySel('fileExplorer-folderTree').as('folderTree');
      cy.get('@folderTree')
        .find('.fui-TreeItemLayout')
        .should('have.length.at.least', 1);
    });
  });

  context('Folder Operations', () => {
    it.only('should allow users to create new folders and organize files', () => {
      cy.intercept({
        method: 'POST',
        pathname: '/api/v1/documents/a116538b/addFolder',
      }).as('addFolder');
      cy.getBySel('fileExplorer-addFolderBtn').click(); // Replace with actual selector
      cy.getBySel('fileExplorer-newFolderNameInput').type('New Folder');
      cy.getBySel('fileExplorer-newFolderNameInput').blur();
      cy.wait('@addFolder');
      cy.getBySel('fileExplorer-folderTree').contains('New Folder');
    });

    it('should allow users to delete a folder', () => {
      cy.getBySel('fileExplorer-folderTree')
        .contains('New Folder')
        .rightclick();
      cy.getBySel('fileExplorer-contextDelete').click();
      cy.getBySel('fileExplorer-folderTree')
        .contains('New Folder')
        .should('not.exist');
    });
  });

  context('Document Operations', () => {
    it('should allow users to upload and delete documents', () => {
      cy.getBySel('fileExplorer-addDocumentBtn').click(); // Replace with actual selector
      cy.fixture('test-doc.txt').then((file) => {
        cy.getBySel('fileExplorer-fileInput').as('fileInput');
        cy.get('@fileInput').selectFile(
          {
            contents: Cypress.Buffer.from(file),
            fileName: 'test-doc.txt',
            mimeType: 'text/plain',
            lastModified: new Date().getTime(),
          },
          { force: true }
        );
        cy.get('@fileInput').trigger('change', { force: true });
        cy.getBySel('fileExplorer-folderTree')
          .contains('test-doc.txt')
          .rightclick();
        // cy.getBySel('fileExplorer-folderTree').contains('test folder').click();
        // cy.getBySel('fileExplorer-folderTree')
        //   .contains('test folder')
        //   .contains('test-doc.txt')
        //   .rightclick();

        cy.getBySel('fileExplorer-contextDelete').click();
        cy.getBySel('fileExplorer-folderTree')
          .contains('test-doc.txt')
          .should('not.exist');
      });
    });
    it('should allow create file under a selected folder', () => {
      cy.getBySel('fileExplorer-folderTree').contains('test folder').click();
      cy.fixture('test-doc.txt').then((file) => {
        cy.getBySel('fileExplorer-fileInput').as('fileInput');
        cy.get('@fileInput').selectFile(
          {
            contents: Cypress.Buffer.from(file),
            fileName: 'test-doc.txt',
            mimeType: 'text/plain',
            lastModified: new Date().getTime(),
          },
          { force: true }
        );
        cy.get('@fileInput').trigger('change', { force: true });
        cy.contains(
          `[data-test="fileExplorer-folder"]`,
          'test folder'
        ).contains('test-doc.txt');
      });
    });

    it('should allow users to open a document', () => {
      cy.getBySel('fileExplorer-folderTree').contains('test-text.txt').click();
      cy.getBySel('document-textView').contains('hello world');
    });
  });

  context('Export documents', () => {
    it('should allow users to export documents', () => {
      cy.intercept(
        {
          method: 'GET',
          pathname: '/api/v1/documents/a116538b/export*',
          query: {
            withData: '0',
          },
        },
        {
          statusCode: 200,
          body: 'test',
        }
      ).as('exportDocument');
      cy.getBySel('fileExplorer-folderTree')
        .contains('test-text.txt')
        .rightclick();
      cy.getBySel('fileExplorer-exportDocument').click();
      cy.wait('@exportDocument');
    });

    it('should allow users to export documents with data', () => {
      cy.intercept(
        {
          method: 'GET',
          pathname: '/api/v1/documents/a116538b/export*',
          query: {
            withData: '1',
          },
        },
        {
          statusCode: 200,
          body: 'test',
        }
      ).as('exportDocument');
      cy.getBySel('fileExplorer-folderTree')
        .contains('test-text.txt')
        .rightclick();
      cy.getBySel('fileExplorer-exportDocumentWithData').click();
      cy.wait('@exportDocument');
    });
  });
});
