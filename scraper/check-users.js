import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tsnhtatgbiaqyxkfkupx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbmh0YXRnYmlhcXl4a2ZrdXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczNTkzOSwiZXhwIjoyMDg2MzExOTM5fQ.JYNuhm_M8ROrjXnFLMb-4n0EJayWhnRYvCJZHb6MKPo"
);

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  data.users.forEach((user) => {
    console.log("Email:", user.email);
    console.log("Phone:", user.phone);
    console.log("Metadata:", user.user_metadata);
    console.log("--------------");
  });
}

checkUsers();
