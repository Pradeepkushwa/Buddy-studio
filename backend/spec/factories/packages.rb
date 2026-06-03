FactoryBot.define do
  factory :package do
    association :category
    sequence(:name) { |n| "Package #{n}" }
    description { Faker::Lorem.paragraph }
    price { 10_000 }
    discount_percentage { 10 }
    active { true }
    featured { false }
    approval_status { 'approved' }

    trait :pending_approval do
      approval_status { 'pending_approval' }
    end

    trait :rejected do
      approval_status { 'rejected' }
    end

    trait :inactive do
      active { false }
    end

    trait :featured do
      featured { true }
    end

    trait :with_items do
      after(:create) do |package|
        equipment = create(:equipment)
        create(:package_item, package: package, equipment: equipment)
      end
    end
  end
end
