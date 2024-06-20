class Layout {
  locationTab() {
    return cy.get('a[href="/location"]');
  }

  serviceTab() {
    return cy.get('a[href="/service"]');
  }

  customerTab() {
    return cy.get('a[href="/customer"]');
  }

  getSearch() {
    return cy.get("#search-filter");
  }

  staffTab() {
    return cy.get('a[href="/employee"]');
  }

  getWidget() {
    return cy.get('a[aria-label="to Widget"]');
  }

  getCompanyDropDown() {
    return cy.get('div[id="company_id"]');
  }

  getCompanyByName(name) {
    this.getCompanyDropDown().click();
    return cy.contains(name);
  }

  joinWidget() {
    return this.getWidget()
      .invoke("attr", "href")
      .then((href) => {
        cy.visit(`${href}`).location("pathname").should("eq", `${href}`);
      });
  }
}

export default Layout;
