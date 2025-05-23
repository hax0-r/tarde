// scripts/createAdminUser.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Admin user credentials
const adminEmail = "admin@wealthwaytrade.com";
const adminPassword = "admin123";
const adminName = "Admin User";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Define User schema and model directly here
    const userSchema = new mongoose.Schema(
      {
        fullName: String,
        email: String,
        password: String,
        isVerified: Boolean,
        isAdmin: Boolean,
        profileImage: String,
        balance: Number,
        totalProfit: Number,
        referralCode: String,
        referredBy: mongoose.Schema.Types.ObjectId,
        referralCount: Number,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
      },
      { timestamps: true }
    );

    const User = mongoose.model("User", userSchema);

    try {
      // Check if admin user already exists
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (existingAdmin) {
        console.log(
          "Admin user already exists. Updating to ensure admin privileges..."
        );
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log("Admin user updated successfully!");
      } else {
        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create new admin user
        const adminUser = new User({
          fullName: adminName,
          email: adminEmail,
          password: hashedPassword,
          isVerified: true,
          isAdmin: true,
        });

        await adminUser.save();
        console.log("Admin user created successfully!");
      }

      // Display admin info
      const admin = await User.findOne({ email: adminEmail });
      console.log("Admin user:", {
        name: admin.fullName,
        email: admin.email,
        isAdmin: admin.isAdmin,
        isVerified: admin.isVerified,
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
    } finally {
      // Close the MongoDB connection
      mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
