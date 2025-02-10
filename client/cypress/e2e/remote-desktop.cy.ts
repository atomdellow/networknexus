describe('Remote Desktop', () => {
  beforeEach(() => {
    cy.visit('/remote');
    // Setup mock successful connection
    cy.window().then((win) => {
      win.localStorage.setItem('serverIP', '192.168.1.100');
    });
  });

  it('should show screen settings', () => {
    cy.get('.screen-settings').should('be.visible');
    cy.get('select').contains('Quality').should('exist');
    cy.get('input[type="range"]').should('have.length', 3);
  });

  it('should handle mouse interactions', () => {
    cy.get('.screen-view').should('be.visible')
      .trigger('mousemove', { clientX: 100, clientY: 100 })
      .trigger('mousedown', { button: 0 })
      .trigger('mouseup', { button: 0 });
/// <reference types="cypress" />


    // Verify socket events were emitted
    cy.window().then((win) => {
        interface Window {
            socketEvents: string[];
          };
      expect(win.socketEvents).to.include('mouse-move');
      expect(win.socketEvents).to.include('mouse-click');
    });
  });

  it('should show performance metrics', () => {
    cy.get('.performance-monitor').should('be.visible');
    cy.get('.metric').should('have.length.at.least', 3);
  });
});
