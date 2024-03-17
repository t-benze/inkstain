import * as React from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { PDFViewer } from './PDFViewer';

describe('PDF Viewer', () => {
  beforeEach(() => {
    cy.mount(
      <FluentProvider theme={webLightTheme}>
        <div
          style={{ width: 'calc(100% - 100px)', height: 'calc(100vh - 20px)' }}
        >
          <PDFViewer url="/sample.pdf" />
        </div>
      </FluentProvider>
    );
  });
  context('PDFViewer Loading and Initial Display', () => {
    it('should load and render the PDF document', () => {
      cy.getBySel('pdfViewer-canvas').first().should('be.visible');
    });
  });

  context('PDFViewer without countinous rendering', () => {
    it('should navigate between pages using navigation controls', () => {
      // Assuming we've navigated to the component and the PDF is loaded
      cy.getBySel('pdfViewer-nextPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '2');

      cy.getBySel('pdfViewer-prevPageBtn').click();
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '1');

      cy.getBySel('pdfViewer-pageNumInput').clear().type('3{enter}');
      cy.getBySel('pdfViewer-pageNumInput').should('have.value', '3');
    });

    it('should be able to zoom in and out and fit the page', () => {
      cy.getBySel('pdfViewer-canvas').as('canvas');
      cy.getBySel('pdfViewer-scene').should('have.attr', 'data-ready', 'true');
      cy.getBySel('pdfViewer-scene').then(($scene) => {
        const sceneWidth = $scene[0].clientWidth;
        const sceneHeight = $scene[0].clientHeight;
        cy.get('@canvas').then(($canvas) => {
          const canvasBaseWidth = $canvas[0].offsetWidth;
          if (canvasBaseWidth === undefined) {
            throw new Error('canvas width is undefined');
          }
          cy.getBySel('pdfViewer-zoomInBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetWidth).should(
              'be.within',
              canvasBaseWidth * 1.1 - 1,
              canvasBaseWidth * 1.1 + 1
            );
          });

          cy.getBySel('pdfViewer-zoomOutBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetWidth).should(
              'be.within',
              canvasBaseWidth - 1,
              canvasBaseWidth + 1
            );
          });

          cy.getBySel('pdfViewer-fitWidthBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetWidth).should(
              'be.within',
              sceneWidth - 1,
              sceneWidth + 1
            );
          });

          cy.getBySel('pdfViewer-fitHeightBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetHeight).should(
              'be.within',
              sceneHeight - 1,
              sceneHeight + 1
            );
          });

          cy.getBySel('pdfViewer-resetScaleBtn').click();
          cy.get('@canvas').then(($canvas) => {
            cy.wrap($canvas[0].offsetWidth).should(
              'be.within',
              canvasBaseWidth - 1,
              canvasBaseWidth + 1
            );
          });
        });
      });
    });
  });
  context('PDFViewer with countinous rendering', () => {
    beforeEach(() => {
      cy.getBySel('pdfViewer-enableScrollBtn').click();
      cy.getBySel('pdfViewer-scene').as('scrollview');
    });
    it('should be able to jump to target page', () => {
      cy.get('@scrollview')
        .find("[role='listitem']")
        .then(($listItems): void => {
          const distance = $listItems[1].offsetTop - $listItems[0].offsetTop;
          cy.getBySel('pdfViewer-nextPageBtn').click();
          cy.get('@scrollview').then(($scrollview) => {
            expect($scrollview[0].scrollTop).to.be.within(
              distance - 1,
              distance + 1
            );
          });
          cy.getBySel('pdfViewer-prevPageBtn').click();
          cy.get('@scrollview').then(($scrollview) => {
            expect($scrollview[0].scrollTop).to.be.within(-1, +1);
          });
          cy.getBySel('pdfViewer-pageNumInput').clear().type('10{enter}');
          cy.get('@scrollview').then(($scrollview) => {
            expect($scrollview[0].scrollTop).to.be.within(
              9 * distance - 1,
              9 * distance + 1
            );
          });
        });
    });
    it('should be able to scroll', () => {
      cy.get('@scrollview')
        .find("[role='listitem']")
        .then(($listItems): void => {
          const distance = $listItems[1].offsetTop - $listItems[0].offsetTop;
          cy.get('@scrollview').scrollTo(0, 7 * distance);
          cy.getBySel('pdfViewer-pageNumInput').should('have.value', '8');
        });
    });
    it('should be able to scale the page ', () => {
      cy.get('@scrollview');
      cy.getBySel('pdfViewer-scene').then(($scene) => {
        const sceneWidth = $scene[0].clientWidth;
        cy.getBySel('pdfViewer-fitWidthBtn').click();
        cy.getBySel('pdfViewer-canvas').then(($canvas) => {
          cy.wrap($canvas[0].offsetWidth).should(
            'be.within',
            sceneWidth - 1,
            sceneWidth + 1
          );
        });
      });
    });
  });
  context('PDFViewer TextLayer', () => {
    it('should render text layer', () => {});
  });
});
