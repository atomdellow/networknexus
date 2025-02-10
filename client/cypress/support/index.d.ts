/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Window {
      socketEvents: string[];
    }
  }
}

export {};
