class WidgetLayout {
  getNextStep() {
    return cy.get("button[id=Next-Step]");
  }

  getPrevStep() {
    return cy.get("button[id=Prev-Step]");
  }

  getRestartBooking() {
    return cy.get("button[id=Restart-Booking]");
  }

  getSummaryStep(number) {
    return cy.get("div[id=summary-info]").children().eq(number);
  }

  getNavigationStep(number) {
    return cy.get("div[id=widget-stepper]").children().eq(number);
  }

  getSummaryServiceName() {
    return cy.get("p[id=service-name]");
  }

  getSummaryServiceDuration() {
    return cy.get("p[id=service-duration]");
  }

  getSummaryServicePaymentTypeIcon() {
    return cy.get("span[id=selected-service-payment-type-icon]").children();
  }

  getSummaryServicePaymentTypeText() {
    return cy.get("span[id=selected-service-payment-type-text]");
  }

  getSummaryLocationData() {
    return cy.get("p[id=summary-location-data]").eq(0);
  }

  getSummaryProviderName() {
    return cy.get("p[id=summary-provider-name]");
  }

  getSummaryDate() {
    return cy.get("p[id=summary-appointment-date]");
  }

  getSummaryAppointmentForInfo() {
    return cy.get("div[id=user-info]");
  }

  getSummaryAppointmentForName() {
    return this.getSummaryAppointmentForInfo().children().eq(1);
  }
}

export default WidgetLayout;
