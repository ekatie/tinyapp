const express = require("express");
const bcrypt = require('bcryptjs');
var methodOverride = require('method-override');
const {
  findUserByEmail,
  authenticateUser,
  generateRandomString
} = require('./helpers');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['omgmyfirstsecretkey', 'thisisbananas', 'ihavesomanysecrets', 'thisisgoingtobesecureashell', 'supercalifragilisticexpialidocious']
}));
app.use(methodOverride('_method'));

// Databases

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
    password: bcrypt.hashSync("test", 10),
  }
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
    res.send("Invalid URL!");
  } else {
    res.redirect(longURL);
  }
});

// View page to generate new short URL
app.get('/urls/new', (req, res) => {
  // User not logged in, redirect user to login page
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      userDatabase
    };
    res.render("urls_new", templateVars);
  }
});

// View single long URL and short URL information
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);

  // User not logged in
  if (!userId) {
    res.send("You must be signed in to view URL details!\n");
  }
  // URL doesn't exist
  else if (!urlId) {
    res.send("Invalid URL!\n");
  }
  // User doesn't own URL
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
  // Redirect logged in user
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      userDatabase
    };
    res.render('register', templateVars);
  };
});

// View existing user login page
app.get('/login', (req, res) => {
  // Redirect logged in user
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      userDatabase
    };
    res.render('login', templateVars);
  }
});

// View all short/long URLs
app.get('/urls', (req, res) => {
  // User not logged in
  if (!req.session.user_id) {
    res.send("You must be signed in to view existing URLs!\n");
  } else {
    const userURLs = urlsForUser(req.session.user_id);

    const templateVars = {
      urls: userURLs,
      user_id: req.session.user_id,
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
app.put('/urls/:id/edit', (req, res) => {
  const urlId = req.params.id;
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);

  // URL doesn't exist
  if (!urlId) {
    res.send("Invalid URL!\n");
  }
  // User not logged in
  else if (!userId) {
    res.send("You must be signed in to view existing URLs!\n");
  }
  // User doesn't own URL
  else if (!userURLs[urlId]) {
    res.send("You do not have permission to edit this URL!\n");
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

// Delete existing long URL
app.delete('/urls/:id/delete', (req, res) => {
  const urlId = req.params.id;
  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);

  // URL doesn't exist
  if (!urlId) {
    res.send("Invalid URL!!\n");
  }
  // User not logged in
  else if (!userId) {
    res.send("You must be signed in to view existing URLs!\n");
  }
  // User doesn't own URL
  else if (!userURLs[urlId]) {
    res.send("You do not have permission to delete this URL!\n");
  } else {
    delete urlDatabase[req.body.id];
    res.redirect('/urls');
  }
});

// Generate new short URL for new long URL
app.post('/urls', (req, res) => {
  // User not logged in
  if (!req.session.user_id) {
    res.send("You must be signed in to use this feature!\n");
  } else {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;

    urlDatabase[shortURL] = {
      "longURL": longURL,
      "userId": req.session.user_id
    };

    res.redirect(`/urls/${shortURL}`);
  }
});

// Register a new user account
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // No email or password entered
  if (!email || !password) {
    return res.status(400).send('Invalid email or password entered!');
  }
  // Email already registered
  else if (findUserByEmail(email, userDatabase)) {
    return res.status(400).send('The email entered is already registered!');
  }
  // Register new user account
  else {
    const userId = generateRandomString();
    userDatabase[userId] = {
      id: userId,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = userId;
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
  if (!findUserByEmail(email, userDatabase)) {
    return res.status(403).send('The email entered is not registered!');
  }

  // Check if email and password combination matches user database
  const validUser = authenticateUser(email, password, userDatabase);

  if (!validUser) {
    res.status(403).send("Authentication failed!");
  } else {
    req.session.user_id = validUser.id;
    res.redirect('/urls');
  }
});

// Logout of account
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// LISTEN 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});