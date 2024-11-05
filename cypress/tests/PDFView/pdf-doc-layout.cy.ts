describe('PDF Document Layout Analysis', () => {
  it('should display the document layout for sample-pdf.pdf', () => {
    cy.openApp('a116538b');
    cy.getBySel('fileExplorer').contains('sample-pdf.pdf').click();
    cy.getBySel('toolbar-docLayoutReady').should('exist');
    cy.getBySel('annotationOverlay-canvas').as('drawingLayer');
    cy.get('body').trigger('keydown', {
      key: 'Shift',
      force: true,
      timeout: 500,
    });
    cy.get('@drawingLayer').trigger('mousemove', {
      button: 0,
      clientX: 700,
      clientY: 900,
    });
    cy.getBySel('layoutDetectionTextBlock').should('exist');
    cy.getBySel('layoutDetectionTextBlock').click();
    cy.getBySel('layoutDetectionTextContent').should('exist');
    cy.document().trigger('keyup', { key: 'Shift', shiftKey: true });
    cy.get('@drawingLayer').trigger('mousedown', {
      button: 0,
      clientX: 5,
      clientY: 5,
    });
    cy.getBySel('layoutDetectionTextContent').should('not.exist');
  });

  it.only('should not display document layout for pdf file without layout data', () => {
    cy.intercept('GET', '/api/v1/auth/user', {
      status: 200,
      body: {
        username: 'test-user',
        email: 'test-user@test.com',
      },
    }).as('user');
    cy.intercept('POST', '/api/v1/intelligence/a116538b/analyze', {
      status: 200,
      body: {
        taskId: 'test-task-id',
      },
    }).as('analyze');
    let counter = 0;
    cy.intercept('GET', '/api/v1/tasks/test-task-id', (req) => {
      counter++;
      if (counter === 1) {
        req.reply({
          status: 200,
          body: {
            status: 'running',
            progress: 0.5,
          },
        });
      } else {
        req.reply({
          status: 200,
          body: {
            status: 'completed',
            progress: 1,
          },
        });
      }
    }).as('analyzeStatus');

    cy.openApp('a116538b');
    cy.wait('@user');
    cy.getBySel('fileExplorer').contains('test folder').click();
    cy.getBySel('fileExplorer').contains('test nested folder').click();
    cy.getBySel('fileExplorer').contains('test-doc.pdf').click();
    cy.getBySel('toolbar-docLayoutReady').should('not.exist');
    cy.getBySel('toolbar-analyzeDocBtn').click();
    cy.wait('@analyze');
    cy.wait('@analyzeStatus');
    cy.wait('@analyzeStatus');
  });
});
