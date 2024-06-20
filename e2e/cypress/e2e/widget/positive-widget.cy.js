/// <reference types="cypress" />

import CompanyWidget from "../../page-object/widget";
import WidgetLayout from "../../page-object/widget/layout";
import AuthorizeNet from "../../page-object/payments/authorize.net/authorizeNet";
import Layout from "../../page-object/layout";
import TabLayout from "../../page-object/tabs/tab-layout";
import {
  assertActiveNavigationSteps,
  assertAppointmentCreation,
  assertAvailabilityForDay,
  assertInactiveNavigationSteps,
  assertNavigationUsingNavigationSteps,
  assertNavigationUsingSummaryAppointmentFor,
  assertNavigationUsingSummarySteps,
  bookAppointment,
  buttonsShouldExistOrNotExist,
  fillClientInfo,
  getCertainDayDate,
  shouldContainStaticContentPerStep,
} from "./constants";

const widget = new CompanyWidget();
const layout = new Layout();
const widgetLayout = new WidgetLayout();
const tabLayout = new TabLayout();

context("Positive", () => {
  beforeEach(() => {
    cy.visit("/cal/cbtr-world");
  });

  describe("Time Slots & Booking", () => {
    it("Should Book an Appointment With Free Service, Random Employee, Random Location and at Random Time Using Name and Email", () => {
      bookAppointment(
        "Free Service",
        "North Office",
        "James",
        " Le Bron",
        "cbtrmail@exmail.com"
      );

      assertAppointmentCreation();
    });

    it("Should show time slots according to Max Advance Booking = 14d, Post-Appointment Buffer = 14m, Duration = 28m", () => {
      widget.getServiceName("Paid Service").click();
      widget.getLocationName("East Office").click();
      widget.getRandomProvider().click();

      const current = getCertainDayDate(0, Date.now());
      const yesterday = getCertainDayDate(-1, Date.now());
      const maxDay = getCertainDayDate(14, Date.now());

      widget.getDayButton(current.day).should("not.have.attr", "disabled");

      if (current.month !== yesterday.month) {
        return widget.prevMonth().should("have.attr", "disabled");
      } else {
        widget.getDayButton(yesterday.day).should("have.attr", "disabled");
      }

      if (current.month !== maxDay.month) {
        widget.nextMonth().click();
      }
      widget
        .getDayButton(maxDay.day)
        .click()
        .should("not.have.attr", "disabled");

      widget.getTimeSlot().eq(0).find("button").should("have.text", "09:00 AM");

      widget.getTimeSlot().eq(1).find("button").should("have.text", "09:42 AM");
    });

    it("The widget shows time slots according to Service Advance Booking Buffer = 1440 minutes", () => {
      const current = getCertainDayDate(0, Date.now());
      const tomorrow = getCertainDayDate(1, Date.now());

      widget.getServiceName("Prebooking One Day Service").click();
      widget.getLocationName("West Office").click();
      widget.getRandomProvider().click();

      if (current.month !== tomorrow.month) {
        widget.prevMonth().click();
      }

      widget.getDayButton(current.day).click();
      return cy
        .contains("No timeslots available for this date")
        .should("exist");
    });

    it("The widget shows time slots according to Service weekly availability = Day After Day", () => {
      widget.getServiceName("Variably Availability Service").click();
      widget.getLocationName("West Office").click();
      widget.getRandomProvider().click();

      widget
        .getFirstAvailableDay()
        .invoke("attr", "aria-label")
        .then((value) => {
          const current = getCertainDayDate(0, value);
          const tomorrow = getCertainDayDate(1, value);
          const afterDay = getCertainDayDate(2, value);

          assertAvailabilityForDay(current.day);

          if (current.month !== tomorrow.month) {
            widget.nextMonth().click();
          }
          assertAvailabilityForDay(tomorrow.day);

          if (tomorrow.month !== afterDay.month) {
            widget.nextMonth().click();
          }
          assertAvailabilityForDay(afterDay.day);
        });
    });

    it("Should Book an Appointment Using Phone Number", () => {
      bookAppointment(
        "Free Service",
        "West Office",
        "Only",
        "Number",
        false,
        "1234561231"
      );

      assertAppointmentCreation();

      cy.loginUser("user1@cbtr.qa", "password");

      layout.customerTab().click({ force: true });
      tabLayout
        .getCustomerName("Only Number")
        .should("have.text", "Only Number");
      tabLayout
        .getCustomerPhone("Only Number")
        .should("have.text", "(123) 456-1231");
    });

    it("Should Book an Appointment Using Email", () => {
      bookAppointment(
        "Free Service",
        "West Office",
        "Only",
        "Email",
        "onlyemail@cbtr.com",
        false
      );

      assertAppointmentCreation();

      cy.loginUser("user1@cbtr.qa", "password");

      layout.customerTab().click({ force: true });
      tabLayout.getCustomerName("Only Email").should("have.text", "Only Email");
      tabLayout
        .getCustomerEmail("Only Email")
        .should("have.text", "onlyemail@cbtr.com");
    });

    it("Should Book an Appointment Using Phone Number and Email", () => {
      bookAppointment(
        "Free Service",
        "West Office",
        "Not Only Email",
        "But Also Phone",
        "notonlyemail@cbtr.com",
        "1234561232"
      );

      assertAppointmentCreation();

      cy.loginUser("user1@cbtr.qa", "password");

      layout.customerTab().click({ force: true });
      tabLayout
        .getCustomerName("Not Only Email But Also Phone")
        .should("have.text", "Not Only Email But Also Phone");
      tabLayout
        .getCustomerEmail("Not Only Email But Also Phone")
        .should("have.text", "notonlyemail@cbtr.com");
      tabLayout
        .getCustomerPhone("Not Only Email But Also Phone")
        .should("have.text", "(123) 456-1232");
    });
  });

  describe("Widget Layout", () => {
    it("Should Navigate Properly Using Navigation Dots According to Settings", () => {
      assertActiveNavigationSteps(0);

      assertInactiveNavigationSteps(1);

      assertNavigationUsingNavigationSteps("Select Service", 0);

      widget.getServiceName("Free Service").click({ force: true });

      assertActiveNavigationSteps(1);

      assertInactiveNavigationSteps(2);

      assertNavigationUsingNavigationSteps("Select Service", 0, 0);
      assertNavigationUsingNavigationSteps("Select Location", 1, 5);

      widget.getLocationName("North Office").click({ force: true });

      assertActiveNavigationSteps(2);

      assertInactiveNavigationSteps(3);

      assertNavigationUsingNavigationSteps("Select Service", 0, 0);
      assertNavigationUsingNavigationSteps("Select Location", 1, 1);
      assertNavigationUsingNavigationSteps("Select Provider", 2, 5);

      widget.getRandomProvider().click();

      assertActiveNavigationSteps(3);
      assertInactiveNavigationSteps(4);

      assertNavigationUsingNavigationSteps("Select Service", 0, 0);
      assertNavigationUsingNavigationSteps("Select Location", 1, 1);
      assertNavigationUsingNavigationSteps("Select Provider", 2, 1);
      assertNavigationUsingNavigationSteps("Select Date & Time (CST)", 3, 5);

      widget.getTimeSlot().eq(0).click();

      assertActiveNavigationSteps(4);
      assertInactiveNavigationSteps(5);

      assertNavigationUsingNavigationSteps("Select Service", 0, 0);
      assertNavigationUsingNavigationSteps("Select Location", 1, 1);
      assertNavigationUsingNavigationSteps("Select Provider", 2, 2);
      assertNavigationUsingNavigationSteps("Select Date & Time (CST)", 3, 3);
      assertNavigationUsingNavigationSteps("Client Info", 4, 5);

      fillClientInfo("James", "Le Bron", "cbtrmail@exmail.com", false);

      cy.wait(1000);

      widgetLayout.getNextStep().click();

      assertActiveNavigationSteps(5);

      assertNavigationUsingNavigationSteps(
        "Appointment created successfully.",
        0,
        5
      );
    });
    it("Should Navigate Properly Using Summary According to Settings", () => {
      assertActiveNavigationSteps(0);

      assertInactiveNavigationSteps(1);

      assertNavigationUsingSummarySteps("Select Service", 0);

      widget.getServiceName("Free Service").click({ force: true });

      assertActiveNavigationSteps(1);

      assertInactiveNavigationSteps(2);

      assertNavigationUsingSummarySteps("Select Service", 0, 0);
      assertNavigationUsingSummarySteps("Select Location", 1, 3);

      widget.getLocationName("North Office").click({ force: true });

      assertActiveNavigationSteps(2);

      assertInactiveNavigationSteps(3);

      assertNavigationUsingSummarySteps("Select Service", 0, 0);
      assertNavigationUsingSummarySteps("Select Location", 1, 1);
      assertNavigationUsingSummarySteps("Select Provider", 2, 3);

      widget.getRandomProvider().click();

      assertActiveNavigationSteps(3);
      assertInactiveNavigationSteps(4);

      assertNavigationUsingSummarySteps("Select Service", 0, 0);
      assertNavigationUsingSummarySteps("Select Location", 1, 1);
      assertNavigationUsingSummarySteps("Select Provider", 2, 1);
      assertNavigationUsingSummarySteps("Select Date & Time (CST)", 3, 3);

      widget.getTimeSlot().eq(0).click();

      assertActiveNavigationSteps(4);
      assertInactiveNavigationSteps(5);

      assertNavigationUsingSummarySteps("Select Service", 0, 0);
      assertNavigationUsingSummarySteps("Select Location", 1, 1);
      assertNavigationUsingSummarySteps("Select Provider", 2, 2);
      assertNavigationUsingSummarySteps("Select Date & Time (CST)", 3, 3);

      widgetLayout.getNextStep().click();

      fillClientInfo("James", "Le Bron", "cbtrmail@exmail.com", false);

      cy.wait(1000);

      widgetLayout.getNextStep().click();

      assertActiveNavigationSteps(5);

      assertNavigationUsingNavigationSteps(
        "Appointment created successfully.",
        0,
        5
      );
      assertNavigationUsingSummaryAppointmentFor(
        "Appointment created successfully."
      );
    });

    it("Should Reset Booking Data Using Reset Booking Button", () => {
      bookAppointment(
        "Free Service",
        "West Office",
        "James",
        "Le Bron",
        "cbtrmail@exmail.com",
        "1234561232"
      );

      assertAppointmentCreation();

      widgetLayout.getRestartBooking().click({ force: true });

      shouldContainStaticContentPerStep("Step 1:", "Select Service");

      assertActiveNavigationSteps(0);
      assertInactiveNavigationSteps(1);

      buttonsShouldExistOrNotExist(false, false, false);
    });

    it("Should Join And Show Service Description", () => {
      widget
        .getServiceDescription("Free Service")
        .should("exist")
        .click({ force: true });

      widget.getServiceDescriptionModal().should("contain", "Free Service");
      widget.getServiceDescriptionModal().should("contain", "10m");
      widget.getServiceDescriptionModal().should("contain", "FREE");
      widget
        .getServiceDescriptionModal()
        .should(
          "contain",
          "Free Service Appointment booking and application processing. To book, click here, or call:" +
            " (212) 253-4170; www.mfservice.org. For the current email address of your choice, please visit" +
            " the Services and Applications page on the left. Please note: This service is available from" +
            " 9am to 5pm each day except on weekends. Call 800-331-2555 or visit www.fservice.org for hours."
        );
      widget
        .getServiceDescriptionModal()
        .should("contain", "Yes, I'd like this Service");
    });
  });

  describe("Highlighting and Showing Info of Chosen Entities", () => {
    it("Should Show Picked Info in Summary, Highlight Picked Entities", () => {
      widgetLayout
        .getSummaryServiceName()
        .should("have.text", "Select Service");
      widgetLayout
        .getSummaryLocationData()
        .should("have.text", "Select Location");
      widgetLayout
        .getSummaryProviderName()
        .should("have.text", "Select Provider");
      widgetLayout
        .getSummaryDate()
        .should("have.text", "Select Appointment Date & Time");
      widgetLayout.getSummaryAppointmentForInfo().should("not.exist");

      widget.getServiceName("Free Service").click({ force: true });

      widgetLayout.getSummaryServiceName().should("have.text", "Free Service");
      widgetLayout.getSummaryServiceDuration().should("have.text", "10m");
      widgetLayout
        .getSummaryServicePaymentTypeText()
        .should("have.text", "FREE");
      widgetLayout.getPrevStep().click({ force: true });
      widgetLayout
        .getSummaryServicePaymentTypeIcon()
        .find("path")
        .eq(1)
        .invoke("attr", "d")
        .then((value) =>
          expect(value).to.be.eq(
            "M9.88 9.878a3 3 0 1 0 4.242 4.243m.58 -3.425a3.012 3.012 0 0 0 -1.412 -1.405"
          )
        );
      widgetLayout
        .getSummaryServicePaymentTypeIcon()
        .find("path")
        .eq(2)
        .invoke("attr", "d")
        .then((value) =>
          expect(value).to.be.eq(
            "M10 6h9a2 2 0 0 1 2 2v8c0 .294 -.064 .574 -.178 .825m-2.822 1.175h-13a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h1"
          )
        );

      widget
        .getServiceCard("Free Service")
        .should(
          "have.css",
          "background",
          "rgba(0, 0, 0, 0) linear-gradient(45deg, rgb(30, 209, 142), rgb(15, 228, 148)) repeat scroll 0% 0% / auto padding-box border-box"
        )
        .find("svg[data-testid=DoneIcon]")
        .should("exist");

      widgetLayout.getNextStep().click({ force: true });

      widget.getLocationName("North Office").click({ force: true });

      widgetLayout
        .getSummaryLocationData()
        .should(
          "have.text",
          "North Office101 North Lubec Road, Lubec, Maine 04652, United States"
        );
      widgetLayout.getPrevStep().click({ force: true });

      widget
        .getLocationCard("North Office")
        .should(
          "have.css",
          "background",
          "rgba(0, 0, 0, 0) linear-gradient(45deg, rgb(30, 209, 142), rgb(15, 228, 148)) repeat scroll 0% 0% / auto padding-box border-box"
        )
        .find("svg[data-testid=DoneIcon]")
        .should("exist");

      widgetLayout.getNextStep().click({ force: true });

      widget.getProvider("Terry Bosco").click({ force: true });

      widgetLayout.getSummaryProviderName().should("have.text", "Terry Bosco");

      widget
        .getFirstAvailableDay()
        .should(
          "have.css",
          "background",
          "rgb(26, 215, 144) none repeat scroll 0% 0% / auto padding-box border-box"
        );

      widgetLayout.getPrevStep().click({ force: true });

      widget
        .getProviderCard("Terry Bosco")
        .should(
          "have.css",
          "background",
          "rgba(0, 0, 0, 0) linear-gradient(45deg, rgb(30, 209, 142), rgb(15, 228, 148)) repeat scroll 0% 0% / auto padding-box border-box"
        )
        .find("svg[data-testid=DoneIcon]")
        .should("exist");

      widget.getRandomProvider().click({ force: true });

      widgetLayout.getSummaryProviderName().should("have.text", "Any Provider");
      widgetLayout.getPrevStep().click({ force: true });

      widget
        .getRandomProvider()
        .should("have.css", "background-color", "rgb(33, 150, 243)");

      widgetLayout.getNextStep().click({ force: true });

      widget.getTimeSlot().eq(0).click();
      widgetLayout
        .getSummaryProviderName()
        .should("not.have.text", "Any Provider");
      widgetLayout.getSummaryDate().should("exist");

      widgetLayout.getPrevStep().click({ force: true });
      widgetLayout.getSummaryProviderName().should("have.text", "Any Provider");

      widget
        .getTimeSlot()
        .eq(0)
        .children("button")
        .should(
          "have.css",
          "background",
          "rgba(0, 0, 0, 0) linear-gradient(45deg, rgb(30, 209, 142), rgb(15, 228, 148)) repeat scroll 0% 0% / auto padding-box border-box"
        );

      widgetLayout.getNextStep().click({ force: true });

      fillClientInfo("James", "Le Bron", "cbtrmail@exmail.com", false);

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });
      widgetLayout.getSummaryAppointmentForInfo().should("exist");
      widgetLayout
        .getSummaryAppointmentForInfo()
        .children()
        .its("length")
        .should("eq", 3);
      widgetLayout
        .getSummaryAppointmentForName()
        .should("have.text", "James Le Bron");
      widgetLayout
        .getSummaryAppointmentForInfo()
        .children()
        .eq(2)
        .should("have.text", "cbtrmail@exmail.com");
    });

    it("Should Show Static Content Correctly For Every Page", () => {
      shouldContainStaticContentPerStep("Step 1:", "Select Service");

      widget.getServiceName("Free Service").click({ force: true });

      shouldContainStaticContentPerStep("Step 2:", "Select Location");

      widget.getLocationName("North Office").click({ force: true });

      shouldContainStaticContentPerStep("Step 3:", "Select Provider");

      widget.getRandomProvider().click({ force: true });

      shouldContainStaticContentPerStep("Step 4:", "Select Date & Time (CST)");

      widget.getTimeSlot().eq(0).click();

      shouldContainStaticContentPerStep("Step 5:", "Client Info");

      fillClientInfo("James", "Le Bron", "cbtrmail@exmail.com", false);

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });

      assertAppointmentCreation();

      shouldContainStaticContentPerStep(
        "Step 6:",
        "Appointment created successfully."
      );
    });

    it("Should Show Next Step, Restart Booking and Prev Step Button According To The Step", () => {
      buttonsShouldExistOrNotExist(false, false, false);

      widget.getServiceName("Paid Service").click({ force: true });

      buttonsShouldExistOrNotExist(false, true, true);

      widgetLayout.getPrevStep().click({ force: true });

      buttonsShouldExistOrNotExist(true, false, false);

      widgetLayout.getNextStep().click({ force: true });

      widget.getLocationName("South Office").click({ force: true });

      buttonsShouldExistOrNotExist(false, true, true);

      widgetLayout.getPrevStep().click({ force: true });

      buttonsShouldExistOrNotExist(true, true, true);

      widgetLayout.getNextStep().click({ force: true });

      widget.getRandomProvider().click({ force: true });

      buttonsShouldExistOrNotExist(false, true, true);

      widgetLayout.getPrevStep().click({ force: true });

      buttonsShouldExistOrNotExist(true, true, true);

      widgetLayout.getNextStep().click({ force: true });

      widget.getTimeSlot().eq(0).click();

      buttonsShouldExistOrNotExist(true, true, true);
      widgetLayout.getNextStep().should("have.text", "Confirm");

      widgetLayout.getPrevStep().click({ force: true });

      buttonsShouldExistOrNotExist(true, true, true);

      widgetLayout.getNextStep().click({ force: true });

      fillClientInfo("James", "Le Bron", "cbtrmail@exmail.com", false);

      cy.wait(1000);

      widgetLayout.getNextStep().click({ force: true });

      buttonsShouldExistOrNotExist(false, false, true);
    });
  });

  describe("Payment Integrations", () => {
    it("Should Book An Appointment Using Authorize.net", () => {
      bookAppointment(
        "Deposit Service",
        "East Office",
        "Max",
        "Gustavsen",
        false,
        "1234561231"
      );

      widget.getAuthorizeNet().should("exist").click();

      AuthorizeNet.getCardHolderName().type("Max Gustavsen");
      AuthorizeNet.getCardNumber().type("4242424242424242");
      AuthorizeNet.getCardExpiryDate().type("1230");
      AuthorizeNet.getCVVCode().type("969");
      AuthorizeNet.getAddress().type("1 New York Avenue");
      AuthorizeNet.getCity().type("New York");
      AuthorizeNet.getState().type("New York");
      AuthorizeNet.getPostalCode().type("11790");
      AuthorizeNet.getPayButton().click();

      assertAppointmentCreation();
    });

    it("Should Book An Appointment Using Paypal", () => {
      bookAppointment(
        "Deposit Service",
        "East Office",
        "Max",
        "Gustavsen",
        false,
        "1234561231"
      );

      widget.getPayPal().should("exist");
    });
  });
});
