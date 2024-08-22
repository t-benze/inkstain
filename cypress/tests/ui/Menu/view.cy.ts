describe('Menu View Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show and hide the primary sidebar', () => {
    cy.getBySel('primarySidebar').should('be.visible');
    cy.getBySel('menubar-viewBtn').click();
    cy.getBySel('menubar-togglePrimarySidebar').click();
    cy.getBySel('primarySidebar').should('not.be.visible');
    cy.getBySel('menubar-togglePrimarySidebar').click();
    cy.getBySel('primarySidebar').should('be.visible');
  });

  it('should show and hide the secondary sidebar', () => {
    cy.getBySel('secondarySidebar').should('be.visible');
    cy.getBySel('menubar-viewBtn').click();
    cy.getBySel('menubar-toggleSecondarySidebar').click();
    cy.getBySel('secondarySidebar').should('not.be.visible');
    cy.getBySel('menubar-toggleSecondarySidebar').click();
    cy.getBySel('secondarySidebar').should('be.visible');
  });
});
