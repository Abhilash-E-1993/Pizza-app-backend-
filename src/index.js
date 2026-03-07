const express = require('express');

const ServerConfig = require('./config/serverConfig');
const connectDB = require('./config/dbConfig');
const User = require('./schema/UserSchema');
const userRouter = require('./routes/userRoute.js');
const cartRouter = require('./routes/cartRoute.js');

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/users',userRouter);
app.use('/carts', cartRouter);

app.post('/ping', (req, res) => {
    console.log(req.body);
    return res.json({message: "pong"});
})

app.listen(ServerConfig.PORT, async () => {
    await connectDB();
    
 
    console.log(`Server started at port ${ServerConfig.PORT}...!!`);
});

