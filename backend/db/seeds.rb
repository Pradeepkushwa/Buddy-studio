# Create default admin (change password in production)
admin = User.find_or_initialize_by(email: 'admin@buddystudio.com')
if admin.new_record?
  admin.assign_attributes(
    name: 'Admin',
    role: 'admin',
    password: 'admin123',
    password_confirmation: 'admin123',
    verification_status: 'approved',
    email_verified: true
  )
  admin.save!
  puts "Created admin: #{admin.email}"
else
  puts "Admin already exists: #{admin.email}"
end
