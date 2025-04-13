import dotenv from "dotenv";
import path from "path";
import { Application } from "./app";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Start the application
new Application();
