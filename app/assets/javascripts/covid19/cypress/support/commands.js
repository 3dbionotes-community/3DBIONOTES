// <reference types="Cypress" />

const appUrl = Cypress.env("ROOT_URL");

if (!appUrl) {
    throw new Error("CYPRESS_ROOT_URL not set");
}

Cypress.config("baseUrl", appUrl);

Cypress.Cookies.defaults({
    preserve: "JSESSIONID",
});

Cypress.on("window:before:load", win => {
    win.fetch = null;
});

Cypress.on("uncaught:exception", (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    console.error("uncaught:exception", { err, runnable });
    return false;
});
