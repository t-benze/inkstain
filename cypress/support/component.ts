import './commands';
import { mount } from 'cypress/react18';
import { MountOptions } from 'cypress/react18';
// import this so that the cypress webpack dev server will generate an entry for the worker
Cypress.Commands.add(
  'mount',
  (component: React.ReactNode, options: MountOptions = {}) => {
    //   const { routerProps = { initialEntries: ['/'] }, ...mountOptions } = options;

    //   const wrapped = <MemoryRouter {...routerProps}>{component}</MemoryRouter>;

    return mount(component, options);
  }
);
