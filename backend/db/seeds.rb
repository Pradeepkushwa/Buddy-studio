# Create default admin
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

# Seed categories
categories_data = [
  { name: 'Wedding Package', description: 'Complete wedding photography and videography coverage', position: 1 },
  { name: 'Birthday Package', description: 'Birthday party and celebration coverage', position: 2 },
  { name: 'Single Event', description: 'Corporate events, conferences, and gatherings', position: 3 },
  { name: 'Personal Wedding Shoot', description: 'Pre-wedding and couple photoshoot sessions', position: 4 }
]

categories_data.each do |data|
  cat = Category.find_or_create_by!(name: data[:name]) do |c|
    c.description = data[:description]
    c.position = data[:position]
  end
  puts "Category: #{cat.name}"
end

# Seed equipment master list
equipments_data = [
  { name: 'Canon EOS R5 (Photography)', equipment_type: 'photography_camera' },
  { name: 'Sony A7 IV (Photography)', equipment_type: 'photography_camera' },
  { name: 'Canon EOS C70 (Videography)', equipment_type: 'videography_camera' },
  { name: 'Sony FX6 (Videography)', equipment_type: 'videography_camera' },
  { name: 'DJI Mavic 3 Pro', equipment_type: 'drone' },
  { name: 'Umbrella Lighting Kit', equipment_type: 'lighting' },
  { name: 'Stage Lighting Setup', equipment_type: 'lighting' },
  { name: '50-Page Premium Album', equipment_type: 'album' },
  { name: '100-Page Deluxe Album', equipment_type: 'album' },
  { name: 'HD Video (Simple Edit)', equipment_type: 'video' },
  { name: 'Cinematic Video (Premium Edit)', equipment_type: 'video' }
]

equipments_data.each do |data|
  eq = Equipment.find_or_create_by!(name: data[:name]) do |e|
    e.equipment_type = data[:equipment_type]
  end
  puts "Equipment: #{eq.name}"
end

# Seed a sample wedding package
wedding_cat = Category.find_by(name: 'Wedding Package')
if wedding_cat && Package.count.zero?
  pkg = Package.create!(
    name: 'Premium Wedding Coverage',
    description: 'Complete wedding day coverage with 2 photography cameras, 2 videography cameras, drone footage, premium album, and cinematic video edit.',
    category: wedding_cat,
    price: 25_000,
    discount_percentage: 10,
    active: true,
    featured: true
  )

  items = [
    { equipment: Equipment.find_by(name: 'Canon EOS R5 (Photography)'), quantity: 2, notes: 'With umbrella lighting setup' },
    { equipment: Equipment.find_by(name: 'Canon EOS C70 (Videography)'), quantity: 2, notes: 'With stage setup' },
    { equipment: Equipment.find_by(name: 'DJI Mavic 3 Pro'), quantity: 1, notes: 'Aerial coverage' },
    { equipment: Equipment.find_by(name: '50-Page Premium Album'), quantity: 1, notes: nil },
    { equipment: Equipment.find_by(name: 'Cinematic Video (Premium Edit)'), quantity: 1, notes: nil }
  ]

  items.each do |item_data|
    next unless item_data[:equipment]
    pkg.package_items.create!(
      equipment: item_data[:equipment],
      quantity: item_data[:quantity],
      notes: item_data[:notes]
    )
  end

  puts "Package: #{pkg.name} (#{pkg.price} -> #{pkg.offer_price})"
end
