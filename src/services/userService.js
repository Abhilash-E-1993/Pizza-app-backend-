
const bcrypt = require('bcrypt');
const { createCart } = require('../repository/cartRepository');
const { findUser, createUser } = require('../repository/userRepository');

async function registerUser(userDetails) {
  const { firstName, email, password, mobileNumber } = userDetails || {};

  // basic validation -> clear 400s instead of generic 500s
  if (!firstName || !email || !password || !mobileNumber) {
    throw { reason: 'firstName, email, password and mobileNumber are required', statuscode: 400 };
  }
  if (String(password).length < 6) {
    throw { reason: 'password must be at least 6 characters', statuscode: 400 };
  }

  // $or: old code used AND semantics, so duplicates slipped through unless BOTH matched
  const existingUser = await findUser({ $or: [{ email }, { mobileNumber }] });
  if (existingUser) {
    throw {
      reason:
        existingUser.email === email
          ? 'user with this email already exists'
          : 'user with this mobile number already exists',
      statuscode: 400,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await createUser({
      ...userDetails,
      password: hashedPassword,
      // never trust a client-supplied role — public registration is always USER.
      // to make an admin, update role to 'ADMIN' directly in the database.
      role: 'USER',
    });

    await createCart(newUser._id);

    // never leak the password hash to the client
    const user = newUser.toObject();
    delete user.password;
    return user;
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || { email: 1 })[0];
      throw { reason: `user with this ${field} already exists`, statuscode: 400 };
    }
    if (err && err.name === 'ValidationError') {
      throw { reason: err.message, statuscode: 400 };
    }
    console.log(err);
    throw { reason: 'error while registering the user', statuscode: 500 };
  }
}

module.exports = registerUser;