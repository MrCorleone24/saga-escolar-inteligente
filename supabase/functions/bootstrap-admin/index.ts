import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "jrseguim@gmail.com";
const ADMIN_PASSWORD = "2511";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const admin = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Starting bootstrap for ${ADMIN_EMAIL}...`);

    // Find existing user by email
    const { data: { users }, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) {
      console.error("Error listing users:", listErr);
      throw listErr;
    }
    
    let user = users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (!user) {
      console.log("User not found, creating...");
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Super Admin", role: "admin" },
      });
      if (createErr) {
        console.error("Error creating user:", createErr);
        throw createErr;
      }
      user = created.user!;
      console.log("User created with ID:", user.id);
    } else {
      console.log("User found, updating ID:", user.id);
      // Force-reset password and confirm email so login always works
      const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (updateErr) {
        console.error("Error updating user:", updateErr);
        throw updateErr;
      }
    }

    // Upsert profile with admin role
    console.log("Upserting profile...");
    const { error: upsertErr } = await admin.from("profiles").upsert({
      id: user.id,
      email: ADMIN_EMAIL,
      full_name: "Super Admin",
      role: "admin",
    }, { onConflict: 'id' });

    if (upsertErr) {
      console.error("Error upserting profile:", upsertErr);
      throw upsertErr;
    }

    console.log("Bootstrap completed successfully.");

    return new Response(JSON.stringify({ success: true, userId: user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("Global error in bootstrap-admin:", e);
    return new Response(JSON.stringify({ error: e.message ?? String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
