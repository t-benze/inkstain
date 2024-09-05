describe('Auth Flow', () => {
  beforeEach(() => {
    cy.openApp();
    cy.getBySel('menubar-fileBtn').click();
    cy.getBySel('menuItem-settings').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/signin',
      },
      (req) => {
        if (req.body.password === 'wrong') {
          req.reply({
            statusCode: 401,
            body: {
              message: 'Invalid username or password',
            },
          });
        } else {
          req.reply({
            statusCode: 200,
          });
        }
      }
    ).as('signin');
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v1/auth/user',
      },
      {
        statusCode: 200,
        body: {
          username: 'testUser',
          email: 'test@test.com',
        },
      }
    ).as('userinfo');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/signup',
      },
      {
        statusCode: 200,
      }
    ).as('signup');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/confirm-signup',
      },
      {
        statusCode: 200,
      }
    ).as('confirmSignUp');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
      },
      {
        statusCode: 200,
      }
    ).as('forgotPassword');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/confirm-forgot-password',
      },
      {
        statusCode: 200,
      }
    ).as('confirmForgotPassword');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v1/auth/signout',
      },
      {
        statusCode: 200,
      }
    ).as('signout');
  });

  context('Sign in', () => {
    it('complete sign in flow', () => {
      cy.getBySel('settingsView-signInBtn').click();
      cy.getBySel('authDialog-usernameInput').type('test');
      cy.getBySel('authDialog-passwordInput').type('test');
      cy.getBySel('authDialog-signInBtn').click();
      cy.wait('@signin');
      cy.wait('@userinfo');
      cy.getBySel('settingsView-userInfo').should('contain', 'testUser');
      cy.getBySel('settingsView-signOutBtn').click();
      cy.wait('@signout');
      cy.wait('@userinfo');
    });
    it('complete sign in flow with invalid credentials', () => {
      cy.getBySel('settingsView-signInBtn').click();
      cy.getBySel('authDialog-usernameInput').type('test');
      cy.getBySel('authDialog-passwordInput').type('wrong');
      cy.getBySel('authDialog-signInBtn').click();
      cy.wait('@signin');
      cy.getBySel('authDialog-errorMsg').should(
        'contain',
        'Invalid username or password'
      );
    });
  });

  context('Sign up', () => {
    it('complete sign up flow', () => {
      cy.getBySel('settingsView-signInBtn').click();
      cy.getBySel('authDialog-signUpLink').click();
      cy.getBySel('authDialog-usernameInput').type('test');
      cy.getBySel('authDialog-emailInput').type('test@test.com');
      cy.getBySel('authDialog-passwordInput').type('test');
      cy.getBySel('authDialog-confirmPasswordInput').type('test');
      cy.getBySel('authDialog-signUpBtn').click();
      cy.wait('@signup');
      cy.getBySel('authDialog-confirmationCodeInput').type('123456');
      cy.getBySel('authDialog-confirmSignUpBtn').click();
      cy.wait('@confirmSignUp');
      cy.wait('@signin');
      cy.wait('@userinfo');
      cy.getBySel('settingsView-userInfo').should('contain', 'testUser');
    });
  });

  context('Forgot password', () => {
    it('complete forgot password flow', () => {
      cy.getBySel('settingsView-signInBtn').click();
      cy.getBySel('authDialog-forgotPasswordLink').click();
      cy.getBySel('authDialog-usernameInput').type('test');
      cy.getBySel('authDialog-forgotPasswordBtn').click();
      cy.wait('@forgotPassword');
      cy.getBySel('authDialog-confirmationCodeInput').type('123456');
      cy.getBySel('authDialog-newPasswordInput').type('test');
      cy.getBySel('authDialog-confirmNewPasswordInput').type('test');
      cy.getBySel('authDialog-confirmForgotPasswordBtn').click();
      cy.wait('@confirmForgotPassword');
      cy.getBySel('authDialog-signInLink').click();
    });
  });
});
