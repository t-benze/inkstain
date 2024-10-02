describe('Secondary Side Bar', () => {
  beforeEach(() => {
    cy.openApp();
    cy.getBySel('recentSpaceBtn-a116538b').click();
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
  });

  context('Document Tag View', () => {
    it('Should display the document tags', () => {
      cy.getBySel('documentTagView-tag').should('have.length.at.least', 1);
    });

    it('Should allow users to add a tag', () => {
      cy.getBySel('documentTagView-addTagInput').type('New Tag');
      cy.getBySel('documentTagView-addTagBtn').click();
      cy.getBySel('documentTagView-tag').contains('New Tag').should('exist');
    });

    it('Should allow users to remove a tag', () => {
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
    beforeEach(() => {
      cy.getBySel('secondarySidebar').contains('Attributes').click();
      cy.intercept('POST', '/api/v1/documents/**/attributes*').as(
        'updateAttribute'
      );
    });

    it('Should display the document attributes', () => {
      cy.getBySel('documentAttributesView-attribute').should(
        'have.length.at.least',
        1
      );
    });

    it("Should allow users to edit an attribute's value", () => {
      cy.getBySel('documentAttributesView-editButton').click();
      cy.getBySel('documentAttributesView-attribute')
        .contains('Title')
        .siblings()
        .find(`[data-test=documentAttributesView-attributeInput]`)
        .as('input');
      cy.get('@input').clear();
      cy.get('@input').type('New Title');
      cy.getBySel('documentAttributesView-saveButton').click();
      cy.wait('@updateAttribute');
      cy.getBySel('documentAttributesView-attribute')
        .contains('Title')
        .siblings()
        .contains('New Title');
    });

    it('Should allow users to add and remove attributes', () => {
      cy.getBySel('documentAttributesView-editButton').click();
      cy.getBySel('documentAttributesView-addAttributeButton').click();

      cy.getBySel('documentAttributesView-attributeNameDropdown').click();
      cy.getBySel('documentAttributesView-attributeNameDropdownOption')
        .contains('Author')
        .click();
      cy.getBySel('documentAttributesView-attributeInput')
        .last()
        .type('New Author Test');
      cy.getBySel('documentAttributesView-saveButton').click();
      cy.wait('@updateAttribute');
      cy.getBySel('documentAttributesView-attribute')
        .contains('New Author Test')
        .should('exist');
      cy.getBySel('documentAttributesView-editButton').click();
      cy.getBySel('documentAttributesView-removeButton').last().click();
      cy.getBySel('documentAttributesView-saveButton').click();
      cy.wait('@updateAttribute');
      cy.getBySel('documentAttributesView-attribute')
        .contains('New Author Test')
        .should('not.exist');
    });
  });
});
