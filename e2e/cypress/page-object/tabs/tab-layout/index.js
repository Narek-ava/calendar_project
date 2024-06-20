class TabLayout {
  addEntity() {
    return cy.get("svg[data-testid='AddIcon']").parent();
  }

  joinEntitySettings(name) {
    return cy.get(`svg[id='${name}-settings']`);
  }

  getCustomerRow(name) {
    return cy.get(`tr[id="${name}-row"]`);
  }

  getCustomerName(name) {
    return this.getCustomerRow(name).find("td").eq(0).find("h6");
  }

  getCustomerEmail(name) {
    return this.getCustomerRow(name).find("td").eq(1).children();
  }

  getCustomerPhone(name) {
    return this.getCustomerRow(name).find("td").eq(2).find("span").children();
  }
}

export default TabLayout;
