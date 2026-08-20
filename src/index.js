const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const serverConfig = require('./config/serverConfig');
const connectDB = require('./config/dbConfig');
const userrouter = require('./Router/userRouter');
const cartrouter = require('./Router/cartRouter');
const authroute = require('./Router/authRoute');
const productroute = require('./Router/productRoute');
const orderrouter = require('./Router/orderRoute');

const app = express();

// Trust reverse proxy (e.g. Render, Heroku) so secure cookies and headers work correctly
app.set('trust proxy', 1);

// hide implementation details + gzip all responses (big perf win for JSON payloads)
app.disable('x-powered-by');
app.use(compression());

// allow the deployed frontend + local dev origins (normalized, trailing slash safe)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ''));

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser requests (health checks, curl) with no origin header
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.text());
app.use(cookieParser());

app.get('/ping', (req, res) => {
  return res.status(200).json({ success: true, message: 'pong' });
});

app.get('/', (req, res) => {
  return res.status(200).json({ success: true, message: 'pizza app backend is running' });
});

app.use('/users', userrouter);
app.use('/auth', authroute);
app.use('/products', productroute);
app.use('/user/cart', cartrouter);
app.use('/user', orderrouter);

// JSON 404 handler (prevents express HTML error pages breaking frontend .json() parsing)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `route not found: ${req.method} ${req.originalUrl}`,
  });
});

// global error handler — always respond with consistent JSON shape
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  const status = err.statuscode || err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'internal server error',
  });
});

// connect DB first, then accept traffic
connectDB().then(() => {
  app.listen(serverConfig.PORT, () => {
    console.log(`server is running at port ${serverConfig.PORT}`);
  });
});