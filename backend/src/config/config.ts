import "dotenv/config";

const {
  NODE_ENV = "development",
  PORT = 5000,
  API_PREFIX = "/api/v1",
  MONGODB_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN = "15m",
  JWT_REFRESH_EXPIRES_IN = "7d",
  CORS_ORIGIN = "*",
  LOG_FORMAT = "dev",

  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

if (!MONGODB_URI) {
  throw new Error("DB URI is not defined");
}

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT ACCESS SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT REFRESH SECRET is not defined");
}

const config = {
  NODE_ENV,
  PORT: Number(PORT),
  API_PREFIX,
  MONGODB_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  CORS_ORIGIN,
  LOG_FORMAT,

  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};

export default config;
