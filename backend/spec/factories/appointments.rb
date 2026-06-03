FactoryBot.define do
  factory :appointment do
    name          { Faker::Name.name }
    email         { Faker::Internet.email }
    mobile_number { '9876543210' }
    message       { Faker::Lorem.sentence }
    status        { 'new' }

    trait :contacted do
      status { 'contacted' }
    end

    trait :completed do
      status { 'completed' }
    end

    trait :with_package do
      association :package
    end
  end
end
