class LoginPage {
  getEmail() {
    return cy.get('input[name="email"]');
  }

  getPassword() {
    return cy.get('input[name="password"]');
  }

  getSignIn() {
    return cy.get("button").contains("Sign In");
  }

  getRegister() {
    return cy.get("a").contains("Don't have an account?");
  }

  getForgotPassword() {
    return cy.get("a").contains("Forgot Password?");
  }

  getKeepMeLoggedIn() {
    return cy.get("span").contains("Keep me logged in");
  }
}

export default LoginPage;
