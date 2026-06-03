FactoryBot.define do
  factory :notification do
    title             { 'New notification' }
    message           { Faker::Lorem.sentence }
    notification_type { 'new_booking' }
    read              { false }

    trait :read do
      read { true }
    end
  end
end
