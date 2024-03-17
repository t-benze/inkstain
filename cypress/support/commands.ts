Cypress.Commands.add('openApp', (key) => {
  if (key) {
    cy.visit(Cypress.config('baseUrl') + '/?space=' + key);
  }
  cy.visit(Cypress.config('baseUrl'));
});
Cypress.Commands.add('getBySel', (selector, options) => {
  return cy.get(`[data-test=${selector}]`, options);
});
Cypress.Commands.add('getBySelContains', (selector, options) => {
  return cy.get(`[data-test*=${selector}]`, options);
});
Cypress.Commands.add('getBySelStartsWith', (selector, options) => {
  return cy.get(`[data-test^=${selector}]`, options);
});
Cypress.Commands.add('getBySelEndsWith', (selector, options) => {
  return cy.get(`[data-test$=${selector}]`, options);
});
// mark this as a module
export {};
