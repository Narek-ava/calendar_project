/// <reference types="cypress" />

import LoginPage from "../../page-object/login-page";
import Layout from "../../page-object/layout";
import TabLayout from "../../page-object/tabs/tab-layout";

describe("Single User Assertion", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  const loginForm = new LoginPage();
  const layout = new Layout();
  const tablayout = new TabLayout();

  it("Should Assert Created Company According to Single User Features", () => {
    loginForm.getEmail().type("user2@cbtr.qa");
    loginForm.getPassword().type("password");

    cy.wait(1000);

    loginForm.getSignIn().click();

    layout.getCompanyByName("Nannie Hussain's Company").click({ force: true });

    layout.locationTab().click({ force: true });
    tablayout
      .addEntity()
      .should("be.disabled")
      .trigger("mouseover", { force: true });

    cy.get("div[role='tooltip']")
      .children()
      .should(
        "have.text",
        "You're on the single user subscription plan. Please contact support to upgrade your plan to be able to add more locations"
      );

    layout.serviceTab().click({ force: true });
    tablayout.addEntity().should("not.be.disabled");

    layout.staffTab().click({ force: true });
    tablayout
      .addEntity()
      .should("be.disabled")
      .trigger("mouseover", { force: true });

    cy.get("div[role='tooltip']")
      .children()
      .should(
        "have.text",
        "You're on the single user subscription plan. Please contact support to upgrade your plan to be able to add more staff"
      );
  });
});

describe("Organization Type Assertion", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  const loginForm = new LoginPage();
  const layout = new Layout();
  const tablayout = new TabLayout();

  it("Should Assert Newly Created Company According to Organization Type Features", () => {
    loginForm.getEmail().type("user3@cbtr.qa");
    loginForm.getPassword().type("password");

    cy.wait(1000);

    loginForm.getSignIn().click();

    layout.locationTab().click({ force: true });
    tablayout.addEntity().should("not.be.disabled");

    layout.serviceTab().click({ force: true });
    tablayout.addEntity().should("not.be.disabled");

    layout.staffTab().click({ force: true });
    tablayout.addEntity().should("not.be.disabled");
  });

  it("Should Assert Completed Created Company According to Organization Type Features", () => {
    loginForm.getEmail().type("user3@cbtr.qa");
    loginForm.getPassword().type("password");

    cy.wait(1000);

    loginForm.getSignIn().click();

    layout
      .getCompanyByName("Jody Fisher's Completed Company")
      .click({ force: true });

    layout.locationTab().click({ force: true });
    tablayout
      .addEntity()
      .should("be.disabled")
      .trigger("mouseover", { force: true });

    cy.get("div[role='tooltip']")
      .children()
      .should(
        "have.text",
        "You're on the organization subscription plan. Please contact support to upgrade your plan to be able to add more locations"
      );

    layout.serviceTab().click({ force: true });
    tablayout.addEntity().should("not.be.disabled");

    layout.staffTab().click({ force: true });
    tablayout
      .addEntity()
      .should("be.disabled")
      .trigger("mouseover", { force: true });

    cy.get("div[role='tooltip']")
      .children()
      .should(
        "have.text",
        "You're on the organization subscription plan. Please contact support to upgrade your plan to be able to add more staff"
      );
  });
});
