describe('Document View', () => {
  it('should allow users to view documents that are not supported', () => {
    cy.openApp('a116538b');
    cy.getBySel('fileExplorer-folderTree').contains('test-xx.xx').click();
    cy.getBySel('documentView-unsupported').should('be.visible');
    cy.getBySel('documentView-unsupported-closeBtn').click();
  });
});
