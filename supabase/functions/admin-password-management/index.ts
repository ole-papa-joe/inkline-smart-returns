import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordManagementRequest {
  action: "set_password" | "reset_password";
  email: string;
  password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { action, email, password }: PasswordManagementRequest = await req.json();

    if (!email || !action) {
      throw new Error("Email and action are required");
    }

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    if (action === "set_password") {
      if (!password) {
        throw new Error("Password is required for set_password action");
      }

      // Find the user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users?.find(u => u.email === email);
      
      if (!user) {
        throw new Error("User not found");
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password }
      );

      if (updateError) throw updateError;

      console.log(`Password set successfully for user: ${email}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Password set successfully for ${email}`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } else if (action === "reset_password") {
      // Generate password reset link
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://localhost:3000'}/auth?type=recovery`
        }
      });

      if (resetError) throw resetError;

      // Send password reset email
      const emailResponse = await resend.emails.send({
        from: "inkline ROI Calculator <onboarding@resend.dev>",
        to: [email],
        subject: "Password Reset Request",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; margin-bottom: 24px;">Password Reset Request</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
              You have received this email because an administrator has requested a password reset for your inkline ROI Calculator account.
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Click the link below to reset your password:</p>
              <a href="${resetData.properties?.action_link}" 
                 style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              This password reset link will expire in 24 hours. If you didn't request this reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            
            <p style="font-size: 12px; color: #999; margin: 0;">
              This email was sent from inkline ROI Calculator. If you have questions, please contact your administrator.
            </p>
          </div>
        `,
      });

      console.log("Password reset email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Password reset email sent to ${email}`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      throw new Error("Invalid action");
    }

  } catch (error: any) {
    console.error("Error in admin-password-management function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to process request" 
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);