import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

/* ===============================
   SUPABASE CONFIG
================================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // MUST be service role key
);

/* ===============================
   LOAD CSV
================================= */

const users = [];

console.log("Reading users.csv...\n");

fs.createReadStream("users.csv")
  .pipe(
    csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase()
    })
  )
  .on("data", (row) => {
    const name = row.name?.trim();
    const email = row.email?.trim();
    const phone = row.phone?.trim();

    if (!name || !email || !phone) {
      console.log("⚠ Skipping row:", row);
      return;
    }

    users.push({ name, email, phone });
  })
  .on("end", async () => {
    console.log("\nCSV Loaded Successfully.");
    console.log("Users to update:", users.length, "\n");

    if (users.length === 0) {
      console.log("❌ No valid users found.");
      return;
    }

    for (const user of users) {
      console.log("Processing:", user.email);

      /* ===============================
         STEP 1: FIND USER BY EMAIL
      ================================= */

      const { data: userList, error: fetchError } =
        await supabase.auth.admin.listUsers();

      if (fetchError) {
        console.log("❌ Failed to fetch users:", fetchError.message);
        continue;
      }

      const existingUser = userList.users.find(
        (u) => u.email === user.email
      );

      if (!existingUser) {
        console.log("❌ User not found:", user.email);
        continue;
      }

      /* ===============================
         STEP 2: UPDATE BY USER ID
      ================================= */

      const { error: updateError } =
        await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            phone: user.phone,
            user_metadata: {
              full_name: user.name
            }
          }
        );

      if (updateError) {
        console.log("❌ Update failed:", user.email);
        console.log(updateError.message, "\n");
      } else {
        console.log("✅ Updated:", user.email, "\n");
      }
    }

    console.log("🎉 Bulk update completed.");
  });
