describe('Secondary Side Bar', () => {
  before(() => {
    cy.task('seedTestSpaceForDocument').then(() => {});
  });

  beforeEach(() => {
    cy.openApp();
    cy.getBySel('recentSpaceBtn-a116538b').click();
    cy.getBySel('fileExplorer').contains('test folder').click();
    cy.getBySel('fileExplorer').contains('test-doc.txt').click();
  });

  context('Document Tag View', () => {
    it('Should display the document tags', () => {
      cy.getBySel('secondarySidebar').contains('Tags').click();
      cy.getBySel('documentTagView-tag').should('have.length.at.least', 1);
    });

    it('Should allow users to add a tag', () => {
      cy.getBySel('secondarySidebar').contains('Tags').click();
      cy.getBySel('documentTagView-addTagInput').type('New Tag');
      cy.getBySel('documentTagView-addTagBtn').click();
      cy.getBySel('documentTagView-tag').contains('New Tag').should('exist');
    });

    it('Should allow users to remove a tag', () => {
      cy.getBySel('secondarySidebar').contains('Tags').click();
      cy.getBySel('documentTagView-tag')
        .filter(":contains('New Tag')")
        .find("[aria-label='remove']")
        .click();
      cy.getBySel('documentTagView-tag')
        .contains('New Tag')
        .should('not.exist');
    });
  });
});
