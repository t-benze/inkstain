describe('Secondary Side Bar', () => {
  beforeEach(() => {
    cy.openApp();
    cy.getBySel('recentSpaceBtn-a116538b').click();
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
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

  context('Document Attributes View', () => {
    it('Should display the document attributes', () => {
      cy.getBySel('secondarySidebar').contains('Attributes').click();
      cy.getBySel('documentAttributesView-attribute').should(
        'have.length.at.least',
        1
      );
    });

    it("Should allow users to edit an attribute's value", () => {
      cy.intercept('POST', '/api/v1/documents/**/attributes*').as(
        'updateAttribute'
      );
      cy.getBySel('secondarySidebar').contains('Attributes').click();
      cy.getBySel('documentAttributesView-attribute')
        .contains('Title')
        .siblings()
        .find(`[data-test=documentAttributesView-attributeInput]`)
        .as('input');
      cy.get('@input').clear();
      cy.get('@input').type('New Title');
      cy.get('@input').blur();
      cy.wait('@updateAttribute');
      cy.get('@input').should('have.value', 'New Title');
    });
  });
});
