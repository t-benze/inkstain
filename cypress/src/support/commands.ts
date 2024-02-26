/// <reference types="cypress" />
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    openApp(): void;
    getBySel(selector: string, options?: object): Chainable<Subject>;
    getBySelContains(selector: string, options?: object): Chainable<Subject>;
    getBySelStartsWith(selector: string, options?: object): Chainable<Subject>;
    getBySelEndsWith(selector: string, options?: object): Chainable<Subject>;
  }
}

Cypress.Commands.add('openApp', () => {
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
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
