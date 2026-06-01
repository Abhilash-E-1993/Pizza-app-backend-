const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const serverConfig = require('./config/serverConfig');
const connectDB = require('./config/dbConfig');
const userrouter = require('./Router/userRouter');
const cartrouter = require('./Router/cartRouter');
const authroute = require('./Router/authRoute');
const productroute = require('./Router/productRoute');
const orderrouter = require('./Router/orderRoute');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(cookieParser());

app.use('/users', userrouter);
app.use('/auth', authroute);
app.use('/products', productroute);
app.use('/user/cart', cartrouter);
app.use('/user', orderrouter);

app.get('/ping', (req, res) => {
  console.log(req.body);
  console.log(req.cookies);
  return res.json({ message: 'pong' });
});

app.listen(serverConfig.PORT, async () => {
  await connectDB();
 
  console.log(`server is running at port ${serverConfig.PORT}`);
});