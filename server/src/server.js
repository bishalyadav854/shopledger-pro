import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`ShopLedger Pro API running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
