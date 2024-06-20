class CompanyWidget {
  getServiceName(name) {
    return cy.get("#widget-form-0").find("p").contains(name);
  }

  getServiceCard(name) {
    return cy.get(`[id="${name}-container"]`);
  }

  getServiceDescription(name) {
    return this.getServiceCard(name)
      .find("div")
      .eq(0)
      .children()
      .eq(1)
      .find("p")
      .eq(0)
      .find("svg");
  }

  getServiceDescriptionModal() {
    return cy.get("div[id=description-modal]");
  }

  getLocationName(name) {
    return cy.get("#widget-form-1").find("p").contains(name);
  }

  getLocationCard(name) {
    return cy.get(`[id="${name}-container"]`);
  }

  getProvider(name) {
    return cy.get(`#widget-form-2`).find("p").contains(name);
  }

  getProviderCard(name) {
    return cy.get(`[id="${name}-container"]`);
  }

  getRandomProvider() {
    return cy.get("#widget-form-2").find("button").contains("Any Provider");
  }

  getTimeSlot() {
    return cy.get("#widget-slots>div");
  }

  prevMonth() {
    return cy.get('[data-testid="ArrowLeftIcon"]').parent();
  }

  nextMonth() {
    return cy.get('[data-testid="ArrowRightIcon"]').parent();
  }

  getFirstName() {
    return cy.get("#user\\.firstname");
  }

  getLastName() {
    return cy.get("#user\\.lastname");
  }

  getEmail() {
    return cy.get("#user\\.email");
  }

  getPhone() {
    return cy.get("#user\\.phone");
  }

  getNote() {
    return cy.get("#user\\.note");
  }

  getFirstAvailableDay() {
    return cy.get("**.Mui-selected");
  }

  getDayButton(day) {
    return cy.get("#calendar-date-picker").find("button").contains(day);
  }

  getClientInfoForm() {
    return cy.get("form[id=widget-form-4]");
  }

  getValidationError(error) {
    return this.getClientInfoForm().contains(error);
  }

  getValidationInputHighlighting(field) {
    return cy.get("fieldset").eq(field);
  }

  getAuthorizeNet() {
    return cy.contains("Credit Card");
  }

  getPayPal() {
    return cy.get(".paypal-buttons");
  }
}

export default CompanyWidget;
