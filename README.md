# OAuth in Action

Exercise based on the great "OAuth2 in Action" manning.com Book (published in 2K16)

https://www.manning.com/books/oauth-2-in-action

A template for the OAuth2 Authorization Code Grant flow.  
It is a simple Node.js application that uses the Express framework. It is intended to be used as a starting point for implementing the OAuth2 Authorization Code Grant flow with [GitHub](https://github.com).

## Getting Started

First, you need to create a GitHub OAuth application. You can do this by going to the `Settings` under the `Developer Settings` and create a new application. 
Set the `homepage URL` to `http://localhost:3000` and the `Authorization callback URL` to `http://localhost:3000/callback`.

Check the documentation for more details: https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/

Then, clone this repository and install the dependencies:

```bash
git clone https://github.com/GridexX/OAuth-in-Action.git
```

Finally, copy the `.env.example` file to `.env` and fill in the values for `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` with the values from your GitHub OAuth application.

## Running the Application

To run the application, execute the following commands:
```bash
    npm install
    npm start
```