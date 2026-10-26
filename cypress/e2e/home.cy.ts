describe('Home page', () => {
	it('renders the template landing', () => {
		cy.visit('/');
		cy.contains('Feature-Sliced Design').should('be.visible');
		cy.contains('a', 'FSD documentation').should('have.attr', 'href');
	});
});
