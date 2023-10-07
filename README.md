# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Functional Details

- Users can register to access functions available to signed in users.
- Signed in users can: 
  - BROWSE: a list of their short URLs
  - READ: detailed URL information, including creation date and visitor tracking data
  - EDIT: long URLs asssociated with existing short URLs
  - ADD: new short URLs
  - DELETE: generated URLs
- Tracking of visits to short URLs:
  - Total number of visits
  - Number of unique visits
  - List of visits by visitor ID and timestamp for visit
- Permissions:
  - Generated short URLs and visitor tracking data are private (only visible to the user who created them)

## Final Product

!["Screenshot of user registration page"](/screenshots/Register.png)
!["Screenshot of user login page"](/screenshots/Login.png)
!["Screenshot of Create New Tiny URL page"](/screenshots/CreateTinyURL.png)
!["Screenshot of URLs List for user"](/screenshots/MyURLs.png)
!["Screenshot of URL details page"](/screenshots/URLDetails.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
