FactoryBot.define do
  factory :category do
    sequence(:name) { |n| "Category #{n}" }
    description { Faker::Lorem.sentence }
    position { rand(1..10) }
    active { true }

    trait :inactive do
      active { false }
    end
  end
end
