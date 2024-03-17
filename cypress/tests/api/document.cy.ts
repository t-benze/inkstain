describe('Documents API', () => {
  const spaceKey = 'a116538b';
  const folderPath = 'test folder';

  const ctx = {} as { homedir: string; pathSep: string };
  before((done) => {
    cy.task('platform:get').then(
      (response: { homedir: string; pathSep: string }) => {
        ctx.homedir = response.homedir;
        ctx.pathSep = response.pathSep;
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
});
