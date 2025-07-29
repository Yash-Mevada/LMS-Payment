import mongoose from "mongoose";

const RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL = 5000;

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;

    // if column not available to data base then not able to hit database call
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected SUCCESSFULLY");
      this.isConnected = true;
    });

    mongoose.connection.on("error", () => {
      console.log("MongoDB Connection ERROR");
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB DISCONNECTED");
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connection() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error("MongoDB URI is not set");
      }

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      console.info("MongoDB connection established successfully");
      this.retryCount = 0;
    } catch (error) {
      console.error(error);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < RETRY_ATTEMPTS) {
      this.retryCount++;

      console.log(
        `Retrying connection attempt ${this.retryCount} of ${RETRY_ATTEMPTS}`
      );

      await new Promise((resolved) =>
        setTimeout(() => {
          resolved;
        }, RETRY_INTERVAL)
      );

      return this.connection();
    } else {
      console.error(
        `Failed to connect to MongoDB after ${RETRY_ATTEMPTS} attempts`
      );
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB");
      await this.connection();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error(" Error closing MongoDB disconnection:", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// create a new instance of DatabaseConnection
const dbConnection = new DatabaseConnection();

export default dbConnection.connection.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
