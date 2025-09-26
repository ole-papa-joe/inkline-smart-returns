import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: "admin" | "user";
  invitedBy: string;
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
    const { email, role, invitedBy }: InvitationRequest = await req.json();

    if (!email || !role) {
      throw new Error("Email and role are required");
    }

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Check if user already exists by trying to list users with this email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers.users?.some(user => user.email === email);
    
    if (userExists) {
      throw new Error("User with this email already exists");
    }

    // Create user with Supabase Auth (this will trigger our handle_new_user function)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // Don't require email confirmation initially
    });

    if (createError) throw createError;

    if (newUser.user) {
      // Update the user's role if it's admin
      if (role === "admin") {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: newUser.user.id, role: 'admin' });
        
        if (roleError) console.error('Error adding admin role:', roleError);
      }

      // Generate magic link for the user to set their password
      const { data: magicLink, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://localhost:3000'}/`
        }
      });

      if (linkError) throw linkError;

      // Send invitation email
      const emailResponse = await resend.emails.send({
        from: "inkline ROI Calculator <onboarding@resend.dev>",
        to: [email],
        subject: "You've been invited to inkline ROI Calculator",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e; margin-bottom: 24px;">Welcome to inkline ROI Calculator</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
              You've been invited by ${invitedBy} to join inkline ROI Calculator as ${role === 'admin' ? 'an administrator' : 'a user'}.
            </p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Click the link below to access your account:</p>
              <a href="${magicLink.properties?.action_link}" 
                 style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                Accept Invitation & Sign In
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              This invitation link will expire in 24 hours. If you have any questions, please contact your administrator.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            
            <p style="font-size: 12px; color: #999; margin: 0;">
              This email was sent from inkline ROI Calculator. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      console.log("Invitation sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Invitation sent to ${email}`,
        userId: newUser.user.id 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      throw new Error("Failed to create user");
    }

  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send invitation" 
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