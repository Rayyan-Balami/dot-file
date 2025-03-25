// backend/server.js
import dotenv from 'dotenv';

// Load environment variables BEFORE importing any modules that use them
dotenv.config();

import { connectToDB } from './db/index.js';
import { app } from './app.js';

// Connect to the MongoDB database
connectToDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR: Server failed with error", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`SUCCESS: Server is running on port ${process.env.PORT || 8000}`);
    }
    );
  })
  .catch((error) => {
    console.error("ERROR: Server failed to start", error);
    process.exit(1);
  });
