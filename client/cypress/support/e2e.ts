// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Initialize socket events tracking
beforeEach(() => {
    cy.window().then((win) => {
      // @ts-ignore
      win.socketEvents = [];
    });
  });
  
  Cypress.Commands.add('trackSocketEvent', (eventName) => {
    cy.window().then((win) => {
      // @ts-ignore
      win.socketEvents = win.socketEvents || [];
      // @ts-ignore
      win.socketEvents.push(eventName);
    });
  });
  
  // Add type definitions to Cypress chain
  declare global {
    namespace Cypress {
      interface Chainable {
        trackSocketEvent(eventName: string): Chainable<void>
      }
    }
  }
  