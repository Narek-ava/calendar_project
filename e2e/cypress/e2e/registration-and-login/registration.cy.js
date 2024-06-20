/// <reference types="cypress" />

import registrationData from "../../data/registration.json";
import LoginPage from "../../page-object/login-page";
import RegisterPage from "../../page-object/register-page";
import { assertCompletedSteps, assertUncompletedSteps } from "./constants";

describe("Registration and Login With Organization Type", () => {
  const loginForm = new LoginPage();
  const registerForm = new RegisterPage();

  beforeEach(() => {
    cy.visit("/");
  });

  it("Should Register an Organization And Assert Its Subscription Type = Organization", () => {
    loginForm.getRegister().click();

    registerForm
      .getFirstName()
      .type(registrationData[0].organizationType.firstName);
    registerForm
      .getLastName()
      .type(registrationData[0].organizationType.lastName);
    registerForm.getPhone().type(registrationData[0].organizationType.phone);
    registerForm.getEmail().type(registrationData[0].organizationType.email);
    registerForm
      .getPassword()
      .type(registrationData[0].organizationType.password);
    registerForm
      .getConfirmPassword()
      .type(registrationData[0].organizationType.password);

    cy.wait(1000);

    registerForm.getNextStepButton().click();
    registerForm
      .getOrganizationName()
      .type(registrationData[0].organizationType.organizationName);
    registerForm
      .getAddressSearch()
      .type(registrationData[0].organizationType.searchAddress);

    cy.contains("1 New York Avenue").click();
    cy.wait(1000);

    registerForm.getNextStepButton().click();
    registerForm.getOrganizationPlan().click();
    registerForm.getSignUp().click();

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/login");
    });
  });

  it("Should Login Under Created User With Organization Type Subscription", () => {
    loginForm.getEmail().type(registrationData[0].organizationType.email);
    loginForm.getPassword().type(registrationData[0].organizationType.password);

    cy.wait(1000);

    loginForm.getSignIn().click();

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/calendar");
    });
    cy.contains("Setup Your Company to Use Calendar").should("exist");

    assertCompletedSteps(0, 3);
    assertUncompletedSteps(1, 2, 4, 5);
  });
});

describe("Registration and Login With Single User Type", () => {
  const loginForm = new LoginPage();
  const registerForm = new RegisterPage();

  beforeEach(() => {
    cy.visit("/");
  });

  it("Should Register an Organization And Assert Its Subscription Type = Single User", () => {
    loginForm.getRegister().click();

    registerForm.getFirstName().type(registrationData[0].singleUser.firstName);
    registerForm.getLastName().type(registrationData[0].singleUser.lastName);
    registerForm.getPhone().type(registrationData[0].singleUser.phone);
    registerForm.getEmail().type(registrationData[0].singleUser.email);
    registerForm.getPassword().type(registrationData[0].singleUser.password);
    registerForm
      .getConfirmPassword()
      .type(registrationData[0].singleUser.password);

    cy.wait(1000);

    registerForm.getNextStepButton().click();
    registerForm
      .getOrganizationName()
      .type(registrationData[0].singleUser.organizationName);
    registerForm
      .getAddressSearch()
      .type(registrationData[0].singleUser.searchAddress);

    cy.contains("1 New York Avenue").click();
    cy.wait(1000);

    registerForm.getNextStepButton().click();
    registerForm.getSingleUserPlan().click();
    registerForm.getSignUp().click();

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/login");
    });
  });

  it("Should Login Under Created User With Single User Type Subscription", () => {
    loginForm.getEmail().type(registrationData[0].singleUser.email);
    loginForm.getPassword().type(registrationData[0].singleUser.password);

    cy.wait(1000);

    loginForm.getSignIn().click();

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/calendar");
    });
    cy.contains("Setup Your Company to Use Calendar").should("exist");

    assertCompletedSteps(0, 3);
    assertUncompletedSteps(1, 2, 4, 5);
  });
});
