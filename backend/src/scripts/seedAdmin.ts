import mongoose from "mongoose";

import config from "@config/config.js";
import { ROLES } from "@constants/user.roles.js";
import User from "@models/user.model.js";

const seedAdmin = async () => {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = config;

  if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Missing admin seed environment variables");
  }

  await mongoose.connect(MONGODB_URI);

  const email = ADMIN_EMAIL.toLowerCase();

  const existing = await User.findOne({
    email,
  });

  if (existing) return;

  await User.create({
    name: ADMIN_NAME,
    email,
    password: ADMIN_PASSWORD,
    role: ROLES.ADMIN,
    isActive: true,
  });

  console.log("Initial administrator created");
};

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
