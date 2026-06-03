FactoryBot.define do
  factory :review do
    name     { Faker::Name.name }
    email    { Faker::Internet.email }
    rating   { rand(1..5) }
    feedback { Faker::Lorem.paragraph }
    approved { false }

    trait :approved do
      approved { true }
    end
  end
end
