import mongoose from "mongoose";

import config from "@config/config.js";

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoUri = config.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("DB URI is not defined");
    }

    const connection = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    // console.log(`DB connected: ${connection.connection.host}`);
    console.log(`DB connected successfully!`);

    return connection;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("DB connection failed:", error.message);
    } else {
      console.error("DB connection failed:", error);
    }

    throw error;
  }
};

export default connectDB;
