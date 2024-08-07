describe('File Explorer for Space', () => {
  beforeEach(() => {
    cy.openApp();
    cy.getBySel('recentSpaceBtn-a116538b').click();
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
  });

  context('Open a pdf document', () => {
    it('should display the PDF file', () => {
      cy.getBySel('pdfViewer-canvas').should('exist');
    });
    it('should show the thumbnails of the pdf file in the sidebar', () => {
      cy.getBySel('primarySidebar').contains('Thumbnail').click();
      cy.getBySel('primarySidebar')
        .find('[data-page-number="4"]')
        .then(($page) => {
          cy.wrap($page).click();
          cy.getBySel('pdfViewer-pageNumInput').should('have.value', '4');
        });
    });
    it('should show the annotated thumbnails of the pdf file in the sidebar', () => {
      cy.getBySel('primarySidebar').contains('Annotations').click();
      cy.getBySel('primarySidebar')
        .find('[role=listitem]')
        .should('have.length.above', 1);
      // page 7 is the page with annotations
      cy.getBySel('primarySidebar')
        .find('[data-page-number="7"]')
        .then(($page) => {
          cy.wrap($page).click();
          cy.getBySel('pdfViewer-pageNumInput').should('have.value', '7');
        });
    });
    it('should show the outline of the pdf file in the sidebar', () => {
      cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
      cy.getBySel('primarySidebar').contains('Outline').click();
      cy.getBySel('primarySidebar').contains('Conclusion').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '10');
    });
  });

  context('PDFViewer without countinous rendering', () => {
    it('should navigate between pages using navigation controls', () => {
      // Assuming we've navigated to the component and the PDF is loaded
      cy.getBySel('pdfViewer-nextPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '2');

      cy.getBySel('pdfViewer-prevPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '1');

      cy.getBySel('pdfViewer-pageNumInput').clear();
      cy.getBySel('pdfViewer-pageNumInput').type('3{enter}');
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '3');
    });

    it('should be able to zoom in and out and fit the page', () => {
      cy.getBySel('pdfViewer-canvas').as('canvas');
      cy.getBySel('pdfViewer-scene').should(
        'have.attr',
        'data-initialWidthAdjusted',
        'true'
      );
      cy.getBySel('pdfViewer-scene').then(($scene) => {
        const sceneWidth = $scene[0].clientWidth;
        const sceneHeight = $scene[0].clientHeight;
        cy.get('@canvas').then(($canvas) => {
          const baseWidth = $canvas[0].offsetWidth;
          cy.getBySel('toolbar-zoomInBtn').click();
          cy.get('@canvas').then(($canvas) => {
            const newWidth = $canvas[0].offsetWidth;
            cy.wrap(newWidth).should('be.greaterThan', baseWidth);
            cy.getBySel('toolbar-zoomOutBtn').click();
            cy.get('@canvas').then(($canvas) => {
              cy.wrap($canvas[0].offsetWidth).should('be.lessThan', newWidth);
            });
          });

          cy.getBySel('toolbar-fitWidthBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetWidth).should(
              'be.within',
              sceneWidth - 10,
              sceneWidth + 10
            );
          });

          cy.getBySel('toolbar-fitHeightBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetHeight).should(
              'be.within',
              sceneHeight - 10,
              sceneHeight + 10
            );
          });
        });
      });
    });
  });

  context('PDFViewer with countinous rendering', () => {
    beforeEach(() => {
      cy.getBySel('pdfViewer-enableScrollBtn').click();
      cy.getBySel('pdfViewer-scene').should('have.attr', 'data-ready', 'true');
      cy.getBySel('pdfViewer-scene').as('scrollview');
    });
    it('should be able to jump to target page', () => {
      cy.getBySel('pdfViewer-nextPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '2');
      cy.getBySel('pdfViewer-prevPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '1');
      cy.getBySel('pdfViewer-pageNumInput').clear();
      cy.getBySel('pdfViewer-pageNumInput').type('10{enter}');
      cy.get("[data-page-number='10']").should('exist');
    });
    it('should be able to scroll', () => {
      cy.getBySel('pdfViewer-scene').should('have.attr', 'data-ready', 'true');
      cy.getBySel('pdfViewer-canvas').should('have.length.above', 1);
      cy.get('@scrollview')
        .find("[role='listitem']")
        .then(($listItems): void => {
          const distance = $listItems[1].offsetTop - $listItems[0].offsetTop;
          cy.get('@scrollview').scrollTo(0, 7 * distance + 50);
          cy.getBySel('pdfViewer-pageNumInput').should('have.value', '8');
        });
    });
    it('should be able to scale the page ', () => {
      cy.getBySel('pdfViewer-scene').should('have.attr', 'data-ready', 'true');
      cy.getBySel('pdfViewer-scene').then(($scene) => {
        const sceneWidth = $scene[0].clientWidth;
        cy.getBySel('toolbar-fitWidthBtn').click();
        cy.getBySel('pdfViewer-canvas').then(($canvas) => {
          cy.wrap($canvas[0].offsetWidth).should(
            'be.within',
            sceneWidth - 10,
            sceneWidth + 10
          );
        });
      });
    });
  });
  // context('PDFViewer TextLayer', () => {
  //   it('should render text layer', () => {});
  // });
});
