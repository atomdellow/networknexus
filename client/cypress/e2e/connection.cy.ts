describe('Connection Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show connection dialog', () => {
    cy.get('.connection-dialog').should('be.visible');
    cy.get('input[placeholder="Server IP"]').should('exist');
    cy.get('input[placeholder="Port"]').should('exist');
  });

  it('should handle successful connection', () => {
    cy.intercept('GET', '/socket.io/*').as('socketConnection');
    
    cy.get('input[placeholder="Server IP"]').type('192.168.1.100');
    cy.get('input[placeholder="Server Password"]').type('testpassword');
    cy.get('button').contains('Connect').click();

    cy.wait('@socketConnection').then(() => {
      cy.get('.connection-status.connected').should('be.visible');
      cy.get('.notification.success').should('contain', 'Connected successfully');
    });
  });

  it('should handle connection failure', () => {
    cy.intercept('GET', '/socket.io/*', {
      statusCode: 500
    }).as('failedConnection');

    cy.get('input[placeholder="Server IP"]').type('invalid-ip');
    cy.get('button').contains('Connect').click();

    cy.get('.notification.error').should('contain', 'Connection failed');
  });
});
