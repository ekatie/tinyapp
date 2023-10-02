const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  /* sample data format:
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }*/
};

const findUserByEmail = function (email) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    } else {
      return null;
    }
  }
};

const authenticateUser = function (email, password) {
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email && userDatabase[userId].password === password) {
      return userDatabase[userId];
    }
  }
  return false;
};

const generateRandomString = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 6; i++) {
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomId;
};

// Get requests
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("URL does not exist");
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    userDatabase
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies.user_id,
    userDatabase
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    userDatabase
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    userDatabase
  };
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    userDatabase
  };
  res.render('urls_index', templateVars);
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

// Post requests
app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.body.id];
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post('/register', (req, res) => {
  const existingUser = findUserByEmail(req.body.email);
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Invalid email or password entered!');
  } else if (existingUser) {
    return res.status(400).send('This email is already registered!');
  } else {
    const userId = generateRandomString();
    userDatabase[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userId);
    res.redirect('/urls');
  };
});

app.post('/login', (req, res) => {
  const user = authenticateUser(req.body.email, req.body.password);
  if (!user) {
    res.status(401).send("Authentication failed");
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});