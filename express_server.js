const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "aJ48lW"
  }
};

const userDatabase = {
  aJ48lW: {
    id: "aJ48lW",
    email: "test@gmail.com",
    password: "test",
  }
};

// Check if email is in user database
const findUserByEmail = function (email) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    } else {
      return null;
    }
  }
};

// Check for correct email and password combination
const authenticateUser = function (email, password) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email && userDatabase[userId].password === password) {
      return userDatabase[userId];
    }
  }
  return false;
};

// Create URL or user ID
const generateRandomString = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 6; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomId;
};

// Check for users URLs
const urlsForUser = function (id) {
  const usersURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      usersURLs[url] = urlDatabase[url];
    }
  }
  return usersURLs;
};


// GET requests

// Forward to long URL using short URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.send("URL does not exist");
  } else {
    res.redirect(longURL);
  }
});

// View page to generate new short URL
app.get('/urls/new', (req, res) => {
  // If not logged in, redirect user to login page
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user_id: req.cookies.user_id,
      userDatabase
    };
    res.render("urls_new", templateVars);
  }
});

// View single long URL and short URL information
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const userId = req.cookies.user_id;
  const userURLs = urlsForUser(userId);

  // If not logged in
  if (!userId) {
    res.send("You must be signed in to view URL details!\n");
  }
  // If id doesn't exist
  else if (!urlId) {
    res.send("This url does not exist!\n");
  }
  // If user doesn't own URL
  else if (!userURLs[urlId]) {
    res.send("You do not have access to this URL!\n");
  } else {
    const templateVars = {
      id: urlId,
      longURL: urlDatabase[urlId].longURL,
      user_id: userId,
      userDatabase
    };
    res.render('urls_show', templateVars);
  }
});

// View registration page for new users
app.get('/register', (req, res) => {
  // If logged in, redirect
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.cookies.user_id,
      userDatabase
    };
    res.render('register', templateVars);
  };
});

// View existing user login page
app.get('/login', (req, res) => {
  // If logged in, redirect
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.cookies.user_id,
      userDatabase
    };
    res.render('login', templateVars);
  }
});

// View all short/long URLs
app.get('/urls', (req, res) => {
  // If not logged in
  if (!req.cookies.user_id) {
    res.send("You must be signed in to view existing URLs!\n");
  } else {
    const userURLs = urlsForUser(req.cookies.user_id);

    const templateVars = {
      urls: userURLs,
      user_id: req.cookies.user_id,
      userDatabase
    };
    res.render('urls_index', templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// POST requests

// Edit existing long URL
app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Delete existing long URL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.body.id];
  res.redirect('/urls');
});

// Generate new short URL for new long URL
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    res.send("You must be signed in to use this feature!\n");
  } else {

    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = {
      "longURL": longURL,
      "userId": req.cookies.user_id
    };

    res.redirect(`/urls/${shortURL}`);
  }
});

// Register a new user account
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // No email or password entered
  if (!email || !password) {
    return res.status(400).send('Invalid email or password entered!');
  }
  // Email already registered
  else if (findUserByEmail(email)) {
    return res.status(400).send('The email entered is already registered!');
  }
  // Register new user account
  else {
    const userId = generateRandomString();
    userDatabase[userId] = {
      id: userId,
      email: email,
      password: password
    };
    res.cookie('user_id', userId);
    res.redirect('/urls');
  };
});

// Login to existing user account
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // No email entered
  if (!email) {
    return res.status(403).send('Invalid email address!');
  }

  // Email not registered
  if (!findUserByEmail(email)) {
    return res.status(403).send('The email entered is not registered!');
  }

  // Check if email and password combination matches user database
  const validUser = authenticateUser(email, password);
  if (!validUser) {
    res.status(403).send("Authentication failed!");
  } else {
    res.cookie('user_id', validUser.id);
    res.redirect('/urls');
  }
});

// Logout of account
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// LISTEN 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});