describe('Space Management UI', () => {
  // Before each test, we assume that we're visiting the 'Spaces' management page.
  beforeEach(() => {
    cy.openApp();
  });

  context('Recent Spaces List', () => {
    it('should display a list of recent spaces', () => {
      // Check for the existence of a 'Spaces' list container, assuming a class `.space-list`
      cy.getBySelStartsWith('recentSpaceBtn').as('spaceList');
      expect(cy.get('@spaceList')).to.exist;
    });
  });

  context('Create Space', () => {
    it('should initiate the creation of a new space', () => {
      cy.intercept(
        { method: 'POST', pathname: '/api/v1/spaces', query: { type: 'new' } },
        {
          statusCode: 201,
        }
      ).as('createSpace');
      // Check for the existence of a 'Create Space' button, assuming a class `.create-space-btn`
      cy.getBySel('createSpaceBtn').as('createSpaceBtn');
      expect(cy.get('@createSpaceBtn')).to.exist;
      cy.get('@createSpaceBtn').click();
      expect(cy.getBySel('direcotryPickerDialog')).to.exist;
      cy.getBySel('directoryPickerDialog-confirmBtn').click();
      cy.getBySel('createSpace-nameInput').type('My Test New Space');
      cy.getBySel('createSpace-confirmBtn').click();
      cy.wait('@createSpace');
    });
  });

  context('Open Folder', () => {
    it('should initiate the request of opening existing inkstain space', () => {
      cy.intercept(
        {
          method: 'POST',
          pathname: '/api/v1/spaces',
          query: { type: 'inkstain' },
        },
        {
          statusCode: 201,
        }
      ).as('openFolder');
      // Check for the existence of a 'Create Space' button, assuming a class `.create-space-btn`
      cy.getBySel('openFolderBtn').as('openFolderBtn');
      expect(cy.get('@openFolderBtn')).to.exist;
      cy.get('@openFolderBtn').click();
      expect(cy.getBySel('direcotryPickerDialog')).to.exist;
      cy.getBySel('directoryPickerDialog-confirmBtn').click();
      cy.wait('@openFolder');
    });
  });

  context('Open Space', () => {
    it('should open an exising test space', () => {
      cy.getBySel('recentSpaceBtn-a116538b').click();
      cy.getBySel('fileExplorer').as('fileExplorer');
      cy.get('@fileExplorer').should('have.attr', 'data-space-key', 'a116538b');
    });
  });
  context('Open space via url', () => {
    it('should open a space via url', () => {
      cy.visit('/?space=a116538b');
      cy.getBySel('fileExplorer').as('fileExplorer');
      cy.get('@fileExplorer').should('have.attr', 'data-space-key', 'a116538b');
    });
  });
});
