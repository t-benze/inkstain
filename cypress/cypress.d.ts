import type { MountOptions, MountReturn } from 'cypress/react';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      openApp(spaceKey?: string): void;
      getBySel(selector: string, options?: object): Chainable<JQuery<E>>;
      getBySelContains(
        selector: string,
        options?: object
      ): Chainable<JQuery<E>>;
      getBySelStartsWith(
        selector: string,
        options?: object
      ): Chainable<JQuery<E>>;
      getBySelEndsWith(
        selector: string,
        options?: object
      ): Chainable<JQuery<E>>;
      /**
       * Mounts a React node
       * @param component React Node to mount
       * @param options Additional options to pass into mount
       */
      mount(
        component: React.ReactNode,
        options?: MountOptions
      ): Cypress.Chainable<MountReturn>;
    }
  }
}
