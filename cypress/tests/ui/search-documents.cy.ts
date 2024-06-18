describe('Search documents in a space', () => {
  context('Test filters by tags and attributes', () => {
    beforeEach(() => {
      cy.openApp('a116538b');
    });
    it('should return documents in a space', () => {
      cy.getBySel('searchDocumentView-result').should(
        'have.length.at.least',
        1
      );
    });

    it('should allow users to search for a document by title', () => {
      cy.getBySel('searchDocumentView-filterBtn-title').click();
      cy.getBySel('searchDocumentView-attributeFilterInput').type('Test PDF');
      cy.getBySel('searchDocumentView-applyFilterBtn').click();
      cy.getBySel('searchDocumentView-result')
        .should('have.length', 1)
        .and('contain', 'Test PDF');
      cy.getBySel('searchDocumentView-filterBtn-title').click();
      cy.getBySel('searchDocumentView-clearFilterBtn').click();
      cy.getBySel('searchDocumentView-result').should(
        'have.length.greaterThan',
        1
      );
    });

    it('should allow users to search for a document by author', () => {
      cy.getBySel('searchDocumentView-filterBtn-author').click();
      cy.getBySel('searchDocumentView-attributeFilterInput').type('Aidan');
      cy.getBySel('searchDocumentView-applyFilterBtn').click();
      cy.getBySel('searchDocumentView-result')
        .should('have.length', 1)
        .and('contain', 'Attention is All You Need');
      cy.getBySel('searchDocumentView-filterBtn-author').click();
      cy.getBySel('searchDocumentView-clearFilterBtn').click();
      cy.getBySel('searchDocumentView-result').should(
        'have.length.greaterThan',
        1
      );
    });

    it('should allow users to search for a document by tag', () => {
      cy.getBySel('searchDocumentView-filterBtn-tags').click();
      cy.getBySel('searchDocumentView-tagFilterDropdown').click();
      cy.getBySel('searchDocumentView-tagFilterOption').contains('ai').click();
      cy.getBySel('searchDocumentView-tagFilterOption')
        .contains('test')
        .click();
      cy.getBySel('searchDocumentView-tagFilterDropdown').click();
      cy.getBySel('searchDocumentView-applyFilterBtn').click();
      cy.getBySel('searchDocumentView-result')
        .should('have.length.at.least', 1)
        .each(($doc) => {
          cy.wrap($doc).contains(/(ai|test)/);
        });
      cy.getBySel('searchDocumentView-filterBtn-title').click();
      cy.getBySel('searchDocumentView-attributeFilterInput').type('Attention');
      cy.getBySel('searchDocumentView-applyFilterBtn').click();
      cy.getBySel('searchDocumentView-result')
        .should('have.length', 1)
        .and('contain', 'Attention is All You Need');
    });
  });

  context('Test Pagination', () => {
    beforeEach(() => {
      cy.intercept('/api/v1/documents/a116538b/search*', (req) => {
        const offset = req.query.offset
          ? parseInt(req.query.offset as string)
          : 0;
        const limit = req.query.limit
          ? parseInt(req.query.limit as string)
          : 10;
        const mockData = Array.from(
          { length: offset > 40 ? 5 : limit },
          (_, i) => ({
            documentPath: `test-doc-${offset + i}.txt`,
            meta: {
              tags: ['ai', 'test'],
              attributes: {
                title: `Test Document ${offset + i}`,
              },
            },
          })
        );
        req.reply(200, {
          systemAttributes: ['title', 'author'],
          data: mockData,
        });
      }).as('searchDocuments');
      cy.openApp('a116538b');
    });
    it('should allow users to navigate through search results', () => {
      cy.wait('@searchDocuments');
      cy.getBySel('searchDocumentView-result').should('have.length', 25);
      cy.getBySel('searchDocumentView').scrollTo('bottom', { duration: 1000 });
      cy.getBySel('searchDocumentView-result').should('have.length', 50);
      cy.getBySel('searchDocumentView').scrollTo('bottom', { duration: 1000 });
      cy.getBySel('searchDocumentView-bottomElement').should('not.exist');
    });
  });
});
