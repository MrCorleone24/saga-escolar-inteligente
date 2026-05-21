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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the requester's user info
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requester }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !requester) throw new Error('Invalid token')

    // Get requester's profile to check role and limits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', requester.id)
      .single()

    if (profileError || !profile) throw new Error('Profile not found')

    const { 
      email, password, fullName, role, schoolName, subject,
      phone, address, city, state, zipCode, taxId, website, contactPerson 
    } = await req.json()

    let targetSchoolId = null;
    let targetTeacherId = null;

    // Hierarchical validation
    if (profile.role === 'admin') {
      // Admin can do anything
    } else if (profile.role === 'school') {
      if (!['teacher', 'student'].includes(role)) {
        throw new Error('Schools can only register teachers and students')
      }
      targetSchoolId = profile.id;
      
      // Check limits
      if (role === 'teacher') {
        const { count: teachersCount } = await supabaseClient
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', profile.id)
          .eq('role', 'teacher')

        if (profile.max_teachers && teachersCount >= profile.max_teachers) {
          throw new Error('Limite de professores atingido')
        }
      }
    } else if (profile.role === 'teacher') {
      if (role !== 'student') {
        throw new Error('Teachers can only register students')
      }
      targetTeacherId = profile.id;
      targetSchoolId = profile.school_id;

      // Check limits
      const { count: studentsCount } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', profile.id)
        .eq('role', 'student')

      if (profile.max_students && studentsCount >= profile.max_students) {
        throw new Error('Limite de alunos atingido')
      }
    } else {
      throw new Error('Unauthorized to register users')
    }

    // Create user in auth.users
    const { data: newUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: role }
    })

    if (signUpError) throw signUpError

    // Update the profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        role: role,
        school_id: targetSchoolId,
        teacher_id: targetTeacherId,
        email: email,
        full_name: fullName,
        school_name: schoolName || profile.school_name,
        subject: subject,
        phone: phone,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        tax_id: taxId,
        website: website,
        contact_person: contactPerson
      })
      .eq('id', newUser.user.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
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
