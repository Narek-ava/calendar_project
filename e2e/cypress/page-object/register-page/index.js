class RegisterPage {
  getFirstName() {
    return cy.get('input[name="firstname"]');
  }

  getLastName() {
    return cy.get('input[name="lastname"]');
  }

  getAddressSearch() {
    return cy.get('input[name="address.address"]');
  }

  getCity() {
    return cy.get('input[name="address.city"]');
  }

  getPhone() {
    return cy.get('input[name="phone"]');
  }

  getState() {
    return cy.get('input[name="address.state"]');
  }

  getEmail() {
    return cy.get('input[name="email"]');
  }

  getPostalCode() {
    return cy.get('input[name="address.postal_code"]');
  }

  getOrganizationName() {
    return cy.get('input[name="companyName"]');
  }

  getAddressLineOne() {
    return cy.get('input[name="address.l1"]');
  }

  getAddressLineTwo() {
    return cy.get('input[name="address.l1"]');
  }

  getPassword() {
    return cy.get('input[name="password"]');
  }

  getConfirmPassword() {
    return cy.get('input[name="confirmPassword"]');
  }

  getSingleUserPlan() {
    return cy.get('div[id="single_user"]');
  }

  getOrganizationPlan() {
    return cy.get('div[id="organization"]');
  }

  getNextStepButton() {
    return cy.contains("Next");
  }

  getSignUp() {
    return cy.contains("button", "Sign Up");
  }
}

export default RegisterPage;
