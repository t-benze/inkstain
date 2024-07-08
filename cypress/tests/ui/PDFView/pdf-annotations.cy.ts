describe('PDF Annotations', () => {
  beforeEach(() => {
    cy.openApp('a116538b');
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
    cy.intercept('POST', '/api/v1/documents/*/annotations*').as(
      'addAnnotation'
    );
    cy.intercept('PUT', '/api/v1/documents/*/annotations*').as(
      'updateAnnotation'
    );
    cy.intercept('DELETE', '/api/v1/documents/*/annotations*').as(
      'deleteAnnotation'
    );
  });
  context('Bookmark', () => {
    it('should allow book marking a page', () => {
      cy.getBySel('pdfViewer-bookmarkBtn').click();
      cy.getBySel('pdfViewer-bookmarkComment').type('This is a bookmark');
      cy.getBySel('pdfViewer-bookmarkAddBtn').click();
      cy.wait('@addAnnotation');
      cy.getBySel('pdfViewer-bookmarkBtn').click();
      cy.getBySel('pdfViewer-bookmarkComment').should(
        'have.value',
        'This is a bookmark'
      );
      cy.getBySel('pdfViewer-bookmarkComment').clear();
      cy.getBySel('pdfViewer-bookmarkComment').type(
        'This is an updated bookmark'
      );
      cy.getBySel('pdfViewer-bookmarkUpdateBtn').click();
      cy.wait('@updateAnnotation');
      cy.getBySel('pdfViewer-bookmarkComment').should(
        'have.value',
        'This is an updated bookmark'
      );
      cy.getBySel('pdfViewer-bookmarkRemoveBtn').click();
      cy.wait('@deleteAnnotation');
      cy.getBySel('pdfViewer-bookmarkBtn').click();
      cy.getBySel('pdfViewer-bookmarkComment').should('have.value', '');
    });
  });

  context('Drawing annotations', () => {
    it('should allow drawing, updating and deleting a line', () => {
      cy.getBySel('pdfViewer-pickStylusBtn').click();
      cy.getBySel('pdfViewer-stylus-line').click();
      cy.getBySel('pdfViewer-drawingLayer').as('drawingLayer');
      cy.get('@drawingLayer').trigger('mousedown', {
        button: 0,
        clientX: 700,
        clientY: 700,
      });
      cy.get('@drawingLayer').trigger('mousemove', {
        button: 0,
        clientX: 800,
        clientY: 800,
      });
      cy.get('@drawingLayer').trigger('mouseup');
      cy.wait('@addAnnotation').then((interception) => {
        const annotationId = interception.response.body.id;
        cy.get('@drawingLayer')
          .find(`[data-annotation-id="${annotationId}"]`)
          .as('annotation');
        cy.getBySel('pdfViewer-pickStylusBtn').click();
        cy.getBySel('pdfViewer-stylus-select').click();
        cy.get('@annotation').trigger('mousedown', { button: 0 });
        cy.getBySel('pdfViewer-drawingAnnotationComment').type(
          'This is a line'
        );
        cy.getBySel('pdfViewer-drawingAnnotationUpdateBtn').click();
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationComment').should(
          'have.value',
          'This is a line'
        );
        cy.get(`[data-mode=moving]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mousemove', {
          button: 0,
          clientX: 800,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 700,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousemove', {
          clientX: 700,
          clientY: 650,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationRemoveBtn').click();
        cy.wait('@deleteAnnotation');
        cy.get('@annotation').should('not.exist');
      });
    });
    it('should allow drawing, updating and deleting a rectangle', () => {
      cy.getBySel('pdfViewer-pickStylusBtn').click();
      cy.getBySel('pdfViewer-stylus-rect').click();
      cy.getBySel('pdfViewer-drawingLayer').as('drawingLayer');
      cy.get('@drawingLayer').trigger('mousedown', {
        button: 0,
        clientX: 700,
        clientY: 700,
      });
      cy.get('@drawingLayer').trigger('mousemove', {
        button: 0,
        clientX: 800,
        clientY: 800,
      });
      cy.get('@drawingLayer').trigger('mouseup');
      cy.wait('@addAnnotation').then((interception) => {
        const annotationId = interception.response.body.id;
        cy.get('@drawingLayer')
          .find(`[data-annotation-id="${annotationId}"]`)
          .as('annotation');
        cy.getBySel('pdfViewer-pickStylusBtn').click();
        cy.getBySel('pdfViewer-stylus-select').click();
        cy.get('@annotation').trigger('mousedown', { button: 0 });
        cy.getBySel('pdfViewer-drawingAnnotationComment').type(
          'This is a rectangle'
        );
        cy.getBySel('pdfViewer-drawingAnnotationUpdateBtn').click();
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationComment').should(
          'have.value',
          'This is a rectangle'
        );
        cy.get(`[data-mode=moving]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mousemove', {
          button: 0,
          clientX: 800,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 700,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousemove', {
          clientX: 700,
          clientY: 650,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationRemoveBtn').click();
        cy.wait('@deleteAnnotation');
        cy.get('@annotation').should('not.exist');
      });
    });
    it('should allow drawing, updating and deleting an ellipse', () => {
      cy.getBySel('pdfViewer-pickStylusBtn').click();
      cy.getBySel('pdfViewer-stylus-ellipse').click();
      cy.getBySel('pdfViewer-drawingLayer').as('drawingLayer');
      cy.get('@drawingLayer').trigger('mousedown', {
        button: 0,
        clientX: 700,
        clientY: 700,
      });
      cy.get('@drawingLayer').trigger('mousemove', {
        button: 0,
        clientX: 800,
        clientY: 800,
      });
      cy.get('@drawingLayer').trigger('mouseup');
      cy.wait('@addAnnotation').then((interception) => {
        const annotationId = interception.response.body.id;
        cy.get('@drawingLayer')
          .find(`[data-annotation-id="${annotationId}"]`)
          .as('annotation');
        cy.getBySel('pdfViewer-pickStylusBtn').click();
        cy.getBySel('pdfViewer-stylus-select').click();
        cy.get('@annotation').trigger('mousedown', { button: 0 });
        cy.getBySel('pdfViewer-drawingAnnotationComment').type(
          'This is an ellipse'
        );
        cy.getBySel('pdfViewer-drawingAnnotationUpdateBtn').click();
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationComment').should(
          'have.value',
          'This is an ellipse'
        );
        cy.get(`[data-mode=moving]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mousemove', {
          button: 0,
          clientX: 800,
          clientY: 750,
        });
        cy.get(`[data-mode=moving]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousedown', {
          button: 0,
          clientX: 750,
          clientY: 700,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mousemove', {
          clientX: 700,
          clientY: 650,
        });
        cy.get(`[data-mode=resizingNorthWest]`).trigger('mouseup');
        cy.wait('@updateAnnotation');
        cy.getBySel('pdfViewer-drawingAnnotationRemoveBtn').click();
        cy.wait('@deleteAnnotation');
        cy.get('@annotation').should('not.exist');
      });
    });
  });
});