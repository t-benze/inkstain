describe('System API', () => {
  context('GET /system/platform', () => {
    it('should return platform information', () => {
      cy.request('GET', '/api/v1/system/platform').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('platform');
        expect(response.body).to.have.property('homedir');
        expect(response.body).to.have.property('pathSep');
        if (Cypress.platform === 'win32') {
          expect(response.body).to.have.property('drives').to.be.an('array');
        }
      });
    });
  });

  context('GET /system/directories', () => {
    it("should list directories of the user's home directory", () => {
      cy.request('GET', '/api/v1/system/platform').then((response) => {
        const homedir = response.body.homedir;
        cy.request(
          'GET',
          `/api/v1/system/directories?path=${encodeURIComponent(homedir)}`
        ).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array').that.has.length.above(0);
          response.body.forEach((directory) => {
            expect(directory).to.have.all.keys('name', 'path');
            expect(directory.name).to.be.a('string');
            expect(directory.path).to.be.a('string');
          });
        });
      });
    });
  });
});
