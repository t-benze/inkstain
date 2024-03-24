describe('File Explorer for Space', () => {
  //   const testSpaceKey = 'a116538b';
  //   const ctx = {} as { homedir: string; pathSep: string };
  before(() => {
    cy.task('seedTestSpaceForDocument').then(() => {
      console.log('finished seeding test space');
    });
  });

  beforeEach(() => {
    cy.openApp();
    cy.getBySel('recentSpaceBtn-a116538b').click();
  });

  it('should display the PDF file', () => {
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
    cy.getBySel('pdfViewer-canvas').should('exist');
  });
  it('should show the thumbnails of the pdf file in the sidebar', () => {
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
    cy.getBySel('primarySidebar').contains('Thumbnail').click();
    cy.getBySel('primarySidebar')
      .find('[data-test="pdfViewer-canvas"]')
      .then((canvas) => {
        expect(canvas).to.have.length.above(1);
        cy.wrap(canvas[4]).click();
        cy.getBySel('pdfViewer-pageNumInput').should('have.value', '5');
      });
  });
  it('should show the outline of the pdf file in the sidebar', () => {
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
    cy.getBySel('primarySidebar').contains('Outline').click();
    cy.getBySel('primarySidebar').contains('Conclusion').click();
    cy.getBySel('pdfViewer-pageNumInput').should('have.value', '10');
  });
});
