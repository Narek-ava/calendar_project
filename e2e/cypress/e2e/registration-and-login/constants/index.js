import NewlyCreatedCompany from "../../../page-object/tabs/calendar/newely-created-company";

const setUpApp = new NewlyCreatedCompany();

export const assertCompletedSteps = (...completedSteps) => {
  for (let items of completedSteps) {
    setUpApp
      .getTodoItemAvatar(items)
      .should(
        "have.css",
        "background",
        "rgb(0, 230, 118) none repeat scroll 0% 0% / auto padding-box border-box"
      );
  }
};

export const assertUncompletedSteps = (...uncompletedSteps) => {
  for (let items of uncompletedSteps) {
    setUpApp
      .getTodoItemAvatar(items)
      .should(
        "have.css",
        "background",
        "rgb(189, 189, 189) none repeat scroll 0% 0% / auto padding-box border-box"
      );
  }
};
