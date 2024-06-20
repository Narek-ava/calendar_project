/// <reference types="cypress" />

import CompanyWidget from "../../page-object/widget";
import WidgetLayout from "../../page-object/widget/layout";
import {
  assertAppointmentCreation,
  assertValidationHighlightingOnFields,
  fillClientInfo,
  joinClientInfoStep,
} from "./constants";

context("Negative", () => {
  beforeEach(() => {
    cy.visit("/cal/cbtr-world");
  });

  const widget = new CompanyWidget();
  const widgetLayout = new WidgetLayout();

  describe("User Data Validation", () => {
    it("Should Highlight Form And Fields After Submitting No Data", () => {
      joinClientInfoStep("Free Service", "South Office");

      widgetLayout.getNextStep().click({ force: true });

      widget
        .getClientInfoForm()
        .should("contain", "First Name is required")
        .should("contain", "Last Name is required")
        .should("contain", "Email or Phone is required")
        .should("contain", "Phone or Email is required");

      widget
        .getValidationError("First Name is required")
        .should("have.css", "color", "rgb(244, 67, 54)");
      widget
        .getValidationError("Last Name is required")
        .should("have.css", "color", "rgb(244, 67, 54)");
      widget
        .getValidationError("Email or Phone is required")
        .should("have.css", "color", "rgb(244, 67, 54)");
      widget
        .getValidationError("Phone or Email is required")
        .should("have.css", "color", "rgb(244, 67, 54)");

      assertValidationHighlightingOnFields(0, 1, 2, 3);
    });

    it("Should Highlight Form And Fields After Submitting Invalid Data", () => {
      joinClientInfoStep("Free Service", "South Office");

      widgetLayout.getNextStep().click({ force: true });

      fillClientInfo("Шаман", "Кинг", "король@шаманов.ру", "01012000");

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });

      widget.getClientInfoForm().should("contain", "Phone number is not valid");

      assertValidationHighlightingOnFields(3);

      widget.getPhone().clear().type("1239874561");

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });

      widget
        .getClientInfoForm()
        .should("contain", "The email must be a valid email address");

      assertValidationHighlightingOnFields(2);

      widget.getEmail().clear().type("cbtrqa@cbtr.com");

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });

      assertAppointmentCreation();
    });
  });
});
