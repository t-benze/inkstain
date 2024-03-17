describe('Spaces API', () => {
  const newSpaceName = 'My Test Space';
  const spaceKey = 'c8ac106f';
  const ctx = {} as { homedir: string; pathSep: string };
  before((done) => {
    cy.task('platform:get').then(
      (response: { homedir: string; pathSep: string }) => {
        ctx.homedir = response.homedir;
        ctx.pathSep = response.pathSep;
        done();
      }
    );
  });

  context('GET /spaces', () => {
    it('should get all spaces', () => {
      cy.request('GET', '/api/v1/spaces').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  context('POST /spaces', () => {
    it('should create a new space', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/spaces',
        body: {
          name: newSpaceName,
          path: Cypress.env('TEST_SPACE') + ctx.pathSep + newSpaceName,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should import an existing inkstain space', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/spaces?type=inkstain',
        body: {
          path:
            Cypress.env('TEST_SPACE') +
            ctx.pathSep +
            'My Test Space For Importing',
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  // this key is generated from the space name 'My Test Space'
  context(`PUT /spaces/${spaceKey}`, () => {
    it('should update an existing space', () => {
      cy.request({
        method: 'PUT',
        url: `/api/v1/spaces/${spaceKey}`,
        body: {
          newName: 'New Space Name',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context(`DELETE /spaces/${spaceKey}`, () => {
    it('should delete an existing space', () => {
      cy.request('DELETE', `/api/v1/spaces/${spaceKey}`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
