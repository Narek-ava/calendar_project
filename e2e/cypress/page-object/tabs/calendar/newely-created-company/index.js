class NewlyCreatedCompany {
  getTodoItems() {
    return cy.get("div[id=ToDo-Items]");
  }

  getTodoItemAvatar(number) {
    return this.getTodoItems()
      .children("div")
      .eq(number)
      .children()
      .children()
      .eq(0)
      .children();
  }

  getHavingTrouble() {}
}

export default NewlyCreatedCompany;
