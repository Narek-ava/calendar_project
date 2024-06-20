export default class AuthorizeNet {
  static getCardHolderName() {
    return cy.get("input[id=card-holder-name]");
  }

  static getCardNumber() {
    return cy.get("input[id=cardNumber]");
  }

  static getCardExpiryDate() {
    return cy.get("input[id=exp-date]");
  }

  static getCVVCode() {
    return cy.get("input[id=cardCode]");
  }

  static getAddress() {
    return cy.get("input[id=address-address-line-1");
  }

  static getCity() {
    return cy.get("input[id=address-city]");
  }

  static getState() {
    return cy.get("input[id=address-state]");
  }

  static getPostalCode() {
    return cy.get("input[id=address-postal-code]");
  }

  static getPayButton() {
    return cy.get("button[id=authorize-modal]");
  }
}
