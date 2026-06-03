FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    role { 'user' }
    email_verified { true }
    verification_status { 'verified' }

    trait :admin do
      role { 'admin' }
      email_verified { true }
      verification_status { 'approved' }
    end

    trait :staff do
      role { 'staff' }
      email_verified { true }
      verification_status { 'approved' }
    end

    trait :unverified do
      email_verified { false }
      verification_status { 'pending' }
    end
  end
end
