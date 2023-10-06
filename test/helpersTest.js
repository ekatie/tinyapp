const { assert, expect } = require('chai');
const bcrypt = require('bcryptjs');

const {
  findUserByEmail,
  authenticateUser,
} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.equal(user.id, expectedUserID);
  });

  it('should return null if the email does not exist', () => {
    const user = findUserByEmail("user@example.ca", testUsers);
    const expectedResponse = null;

    assert.equal(user, expectedResponse);
  });
});

describe('authenticateUser', () => {
  it('should return the user object if the email and password match the values in the database', () => {
    const email = testUsers.userRandomID.email;
    const password = "purple-monkey-dinosaur";

    const isUserValid = authenticateUser(email, password, testUsers);

    assert.deepEqual(testUsers.userRandomID, isUserValid);
  });

  it('should return false if the email and password do not match the values in the database', () => {
    const email = testUsers.userRandomID.email;
    const password = "green-ape-banana";

    const isUserValid = authenticateUser(email, password, testUsers);

    expect(isUserValid).to.be.false;
  });
  
});