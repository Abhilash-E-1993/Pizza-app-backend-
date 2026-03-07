function createUser(req, res) {
    console.log("Creating user...");
    console.log(req.url);
   return  res.send("User created");
}

module.exports = {
    createUser
}