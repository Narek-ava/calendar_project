import LoginPage from "../page-object/login-page";

Cypress.Commands.add("loginUser", (email, password) => {
  const login = new LoginPage();

  // cy.intercept('POST', '/api/login**').as('login')
  // cy.intercept("GET", "/api/locations**").as("loadingLocations");
  // cy.intercept("GET", "/api/services**").as("loadingServices");
  // cy.intercept("GET", "/api/employees**").as("loadingEmployees");
  // cy.intercept("GET", "/api/appointments**").as("loadingAppointments");
  // cy.intercept("GET", "/api/global-appointments**").as(
  //   "loadingGlobalAppointments"
  // );

  cy.visit("/");
  login.getEmail().type(email);
  login.getPassword().type(password);
  login.getSignIn().click();

  // cy.wait('@login').its('response.statusCode').should('eq', 200)
  // cy.wait("@loadingLocations").its("response.statusCode").should("eq", 200);
  // cy.wait("@loadingServices").its("response.statusCode").should("eq", 200);
  // cy.wait("@loadingEmployees").its("response.statusCode").should("eq", 200);
  // cy.wait("@loadingAppointments").its("response.statusCode").should("eq", 200);
  // cy.wait("@loadingGlobalAppointments")
  //   .its("response.statusCode")
  //   .should("eq", 200);
  cy.get("#calendar_wrapper").should("exist");
});
