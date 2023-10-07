# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Functional Details

- Users can register to generate their own short URLs
- URLs are private - only visible to the user who created them
- Signed in users can: generate, view, edit and delete URLs
- Tracking of visits to short URLs:
  - Total number of visits
  - Number of unique visits
  - List of visits by visitor ID and timestamp for visit

## Final Product

!["User registration page"](/screenshots/Register.png)
!["User login page"](/screenshots/Login.png)
!["Create New Tiny URL page"](/screenshots/CreateTinyURL.png)
!["List of URLs for user"](/screenshots/MyURLs.png)
!["URL details page, including tracking of visits"](/screenshots/URLDetails.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
