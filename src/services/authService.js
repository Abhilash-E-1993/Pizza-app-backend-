const { findUser } = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRY } = require("../config/serverConfig");

async function loginUser(authDetails) {

    const email = authDetails.email;
    const plainPassword = authDetails.password;

    // 1️⃣ Check if a user exists with the given email
    const user = await findUser({ email });

    if (!user) {
        throw {
            message: "No user found with the given email",
            statusCode: 404
        };
    }

    // 2️⃣ Compare plain password with hashed password stored in DB
    const isPasswordValidated = await bcrypt.compare(
        plainPassword,
        user.password
    );

    if (!isPasswordValidated) {
        throw {
            message: "Invalid password, please try again",
            statusCode: 401
        };
    }

    // 3️⃣ Generate JWT token including role
    const token = jwt.sign(
        {
            email: user.email,
            id: user._id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRY
        }
    );

    // 4️⃣ Return token
    return token;
}

module.exports = {
    loginUser
};