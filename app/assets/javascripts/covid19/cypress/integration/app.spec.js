/// <reference types='Cypress' />

context("Example page", () => {
    before(() => {
        cy.visit("/");
    });

    it("has content", () => {
        cy.contains("App component");
    });
});
