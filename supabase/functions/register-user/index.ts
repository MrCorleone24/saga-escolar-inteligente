import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const userData = await req.json()
    const { 
      email, password, fullName, role, schoolName, subject,
      phone, address, city, state, zipCode, taxId, website, 
      contactPerson, bio, gradeLevel, hasSpecialNeeds, specialNeedsExpert,
      teacherId, schoolId
    } = userData

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: fullName,
        email: email,
        role: role,
        school_name: schoolName,
        subject: subject,
        bio: bio,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        tax_id: taxId,
        website: website,
        contact_person: contactPerson,
        grade_level: gradeLevel,
        has_special_needs: hasSpecialNeeds,
        special_needs_expert: specialNeedsExpert,
        teacher_id: teacherId,
        school_id: schoolId,
        subscription_status: 'active'
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return new Response(JSON.stringify({ user: authUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
