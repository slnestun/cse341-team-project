
import mongoose from "mongoose";

const connectMongoose = async (options = {}) => {
  const connectionString =
    options.connectionString || process.env.MONGODB_URI;

  const databaseName =
    options.databaseName || process.env.MONGODB_DB_NAME || "practice";

  if (!connectionString) {
    throw new Error("MONGODB_URI is required.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(connectionString, {
    dbName: databaseName,
  });

  return mongoose.connection;
};

const closeMongoose = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export { closeMongoose, connectMongoose };
