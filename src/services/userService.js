
const bcrypt = require('bcrypt');
const { createCart } = require('../repository/cartRepository');
const { findUser, createUser } = require('../repository/userRepository');

async function registerUser(userDetails) {
  try {
    const user = await findUser({
      email: userDetails.email,
      mobileNumber: userDetails.mobileNumber,
    });

    if (user) {
      throw { reason: 'user with this email or mobile number already exists', statuscode: 400 };
    }

    const hashedPassword = await bcrypt.hash(userDetails.password, 10);

    const newUser = await createUser({
      ...userDetails,
      password: hashedPassword,
      role: userDetails.role || 'USER',
    });

    if (!newUser) {
      throw { reason: 'user creation failed', statuscode: 500 };
    }

    const newUserId = newUser._id;
    await createCart(newUserId);
    return newUser;
  } catch (err) {
    console.log(err);
    throw { reason: 'error while registering the user', statuscode: 500 };
  }
}

module.exports = registerUser;