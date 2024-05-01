describe('Documents API', () => {
  const spaceKey = 'a116538b';
  const folderPath = 'test folder';
  // let testDocumentPath = '';

  const ctx = {} as { homedir: string; pathSep: string };
  before((done) => {
    cy.task('platform:get').then(
      (response: { homedir: string; pathSep: string }) => {
        ctx.homedir = response.homedir;
        ctx.pathSep = response.pathSep;
        // testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      }
    );
    cy.task('seedTestSpaceForDocument').then(() => {
      done();
    });
  });

  context(`GET /documents/${spaceKey}/list`, () => {
    it('should list all documents within a space or sub-folder', () => {
      cy.request(
        'GET',
        `/api/v1/documents/${spaceKey}/list?path=${encodeURIComponent('')}`
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  context(`GET /documents/${spaceKey}/content`, () => {
    it('should serve document content from a space', () => {
      const documentContentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request(
        'GET',
        `/api/v1/documents/${spaceKey}/content?path=${encodeURIComponent(
          documentContentPath
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.eq(
          'text/plain; charset=utf-8'
        );
      });
    });
  });

  context(`POST /documents/${spaceKey}/add`, () => {
    it('should add a new document to a space', () => {
      const formData = new FormData();
      const fileContent = 'Hello, world!';
      const file = new File([fileContent], 'new-document.txt', {
        type: 'text/plain',
      });
      formData.append('document', file);

      cy.request({
        method: 'POST',
        url: `/api/v1/documents/${spaceKey}/add?path=${encodeURIComponent(
          folderPath + ctx.pathSep + 'new-document.txt'
        )}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  context(`DELETE /documents/${spaceKey}/delete`, () => {
    it('should delete a document from a space', () => {
      const documentContentPath =
        folderPath + ctx.pathSep + 'test-doc-to-delete.txt';
      cy.request(
        'DELETE',
        `/api/v1/documents/${spaceKey}/delete?path=${encodeURIComponent(
          documentContentPath
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context(`/documents/${spaceKey}/addFolder`, () => {
    it('should add a new folder within a space', () => {
      cy.request(
        'POST',
        `/api/v1/documents/${spaceKey}/addFolder?path=${encodeURIComponent(
          'new folder'
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context(`/documents/${spaceKey}/deleteFolder`, () => {
    it('should delete a folder within a space', () => {
      cy.request(
        'DELETE',
        `/api/v1/documents/${spaceKey}/deleteFolder?path=${encodeURIComponent(
          'test folder 2'
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context(`/documents/${spaceKey}/tags`, () => {
    it('should add tags to a document in a space', () => {
      const tagsToAdd = ['finance', 'report'];
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request({
        method: 'POST',
        url: `/api/v1/documents/${spaceKey}/tags?path=${encodeURIComponent(
          testDocumentPath
        )}`,
        body: {
          tags: tagsToAdd,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
    it('should remove tags from a document in a space', () => {
      const tagsToRemove = ['report'];
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request({
        method: 'DELETE',
        url: `/api/v1/documents/${spaceKey}/tags?path=${encodeURIComponent(
          testDocumentPath
        )}`,
        body: {
          tags: tagsToRemove,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should retrieve tags of a document in a space', () => {
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request(
        `GET`,
        `/api/v1/documents/${spaceKey}/tags?path=${encodeURIComponent(
          testDocumentPath
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include('finance');
      });
    });
  });

  context(`/documents/${spaceKey}/attributes`, () => {
    it('should retrieve attributes of a document in a space', () => {
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request(
        `GET`,
        `/api/v1/documents/${spaceKey}/attributes?path=${encodeURIComponent(
          testDocumentPath
        )}`
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title');
      });
    });

    it('should add attributes to a document in a space', () => {
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request({
        method: 'POST',
        url: `/api/v1/documents/${spaceKey}/attributes?path=${encodeURIComponent(
          testDocumentPath
        )}`,
        body: {
          attributes: {
            title: {
              value: 'Test Document',
            },
            'test-attribute': {
              value: 'test',
            },
          },
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should delete attributes of a document in a space', () => {
      const testDocumentPath = folderPath + ctx.pathSep + 'test-doc.txt';
      cy.request({
        method: 'DELETE',
        url: `/api/v1/documents/${spaceKey}/attributes?path=${encodeURIComponent(
          testDocumentPath
        )}`,
        body: ['test-attribute'],
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
