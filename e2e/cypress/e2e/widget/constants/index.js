import CompanyWidget from "../../../page-object/widget";
import WidgetLayout from "../../../page-object/widget/layout";

const widget = new CompanyWidget();
const widgetLayout = new WidgetLayout();

export const fillClientInfo = (firstName, lastName, email, phone) => {
  firstName ? widget.getFirstName().type(firstName) : () => {};
  lastName ? widget.getLastName().type(lastName) : () => {};
  email ? widget.getEmail().type(email) : () => {};
  phone ? widget.getPhone().type(phone) : () => {};
};

export const bookAppointment = (
  serviceName,
  locationName,
  firstName,
  lastName,
  email,
  phone
) => {
  widget.getServiceName(serviceName).click({ force: true });
  widget.getLocationName(locationName).click({ force: true });
  widget.getRandomProvider().click({ force: true });
  widget.getTimeSlot().eq(0).click();

  fillClientInfo(firstName, lastName, email, phone);

  cy.wait(1000);

  widgetLayout.getNextStep().click({ force: true });
};

export const assertAppointmentCreation = () => {
  return cy
    .get('[role="alert"]', { timeout: 10000 })
    .should("exist")
    .find(">div")
    .should("have.text", "Appointment created");
};

export const shouldContainStaticContentPerStep = (stepNumber, stepName) => {
  cy.get("body")
    .should("contain", "CBTR World")
    .should("contain", "Appointment Booking")
    .should("contain", "Your Booking Progress")
    .should("contain", stepNumber)
    .should("contain", stepName)
    .should("contain", "Booking Summary");
};

const assertActiveNavigationStep = (number) =>
  widgetLayout
    .getNavigationStep(number)
    .should("have.class", "active")
    .should("have.css", "background-color", "rgb(26, 215, 144)");

const assertInactiveNavigationStep = (number) =>
  widgetLayout
    .getNavigationStep(number)
    .should("not.have.class", "active")
    .should("have.css", "background-color", "rgb(224, 224, 224)");

const assertNavigationUsingNavigationStep = (number, text) => {
  widgetLayout.getNavigationStep(number).click({ force: true });
  cy.contains(text);
};

const assertNavigationUsingSummaryStep = (number, text) => {
  widgetLayout.getSummaryStep(number).click({ force: true });
  cy.contains(text);
};

export const assertNavigationUsingSummarySteps = (
  text,
  fromStep,
  stepsAmount
) => {
  for (let i = fromStep; i <= stepsAmount; i++) {
    assertNavigationUsingSummaryStep(i, text);
  }
};

export const assertNavigationUsingNavigationSteps = (
  text,
  fromStep,
  stepsAmount
) => {
  for (let i = fromStep; i <= stepsAmount; i++) {
    assertNavigationUsingNavigationStep(i, text);
  }
};

export const assertNavigationUsingSummaryAppointmentFor = (text) => {
  widgetLayout.getSummaryAppointmentForInfo().click({ force: true });
  cy.contains(text);
};

export const getCertainDayDate = (day, date) => {
  let today = new Date(date);
  today.setDate(today.getDate() + day);
  return {
    month: today.toLocaleString("en-US", {
      month: "long",
    }),
    day: today.toLocaleString("en-US", {
      day: "numeric",
    }),
  };
};

export const assertAvailabilityForDay = (certainDay) => {
  const getCertainWeekday = (date) => {
    let today = new Date(date);
    return {
      day: today.toLocaleString("en-US", {
        weekday: "long",
      }),
    };
  };
  const day = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  widget
    .getDayButton(certainDay)
    .invoke("attr", "aria-label")
    .then((value) => {
      let weekDay = getCertainWeekday(value).day;
      switch (weekDay) {
        case day[0]:
        case day[2]:
        case day[4]:
        case day[6]:
          return widget
            .getDayButton(certainDay)
            .should("have.attr", "disabled");
        case day[1]:
        case day[3]:
        case day[5]:
          return widget
            .getDayButton(certainDay)
            .should("not.have.attr", "disabled");
      }
    });
};

export const buttonsShouldExistOrNotExist = (
  getNextStep,
  getPrevStep,
  getRestartBooking
) => {
  widgetLayout.getNextStep().should(getNextStep ? "exist" : "not.exist");
  widgetLayout.getPrevStep().should(getPrevStep ? "exist" : "not.exist");
  widgetLayout
    .getRestartBooking()
    .should(getRestartBooking ? "exist" : "not.exist");
};

export const assertActiveNavigationSteps = (stepsAmount) => {
  for (let i = 0; i <= stepsAmount; i++) {
    assertActiveNavigationStep(i);
  }
};

export const assertInactiveNavigationSteps = (fromStep) => {
  for (let i = fromStep; i <= 5; i++) {
    assertInactiveNavigationStep(i);
  }
};

export const assertValidationHighlightingOnFields = (...fieldNumbers) => {
  for (let items of fieldNumbers) {
    widget
      .getValidationInputHighlighting(items)
      .should("have.css", "color", "rgb(11, 45, 59)");
  }
};

export const joinClientInfoStep = (serviceName, locationName) => {
  widget.getServiceName(serviceName).click({ force: true });
  widget.getLocationName(locationName).click({ force: true });
  widget.getRandomProvider().click({ force: true });
  widget.getTimeSlot().eq(0).click();
};
