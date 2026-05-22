import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const registerUser = async (userData: any) => {
  const { 
    email, password, fullName, role, schoolName, subject,
    phone, address, city, state, zipCode, taxId, website, 
    contactPerson, bio, gradeLevel, hasSpecialNeeds, specialNeedsExpert,
    teacherId, schoolId
  } = userData;

  // 1. Create Auth User
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) throw authError;

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
      subscription_status: 'active' // Default for manual creation by admin
    });

  if (profileError) {
    // Cleanup auth user if profile fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw profileError;
  }

  return authUser.user;
};
