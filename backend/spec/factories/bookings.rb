FactoryBot.define do
  factory :booking do
    association :user
    association :package
    event_start_date { 10.days.from_now.to_date }
    event_end_date   { 12.days.from_now.to_date }
    event_address    { Faker::Address.full_address }
    phone_number     { '9876543210' }
    email            { Faker::Internet.email }
    amount           { 9000 }
    status           { 'pending' }

    trait :confirmed do
      status            { 'confirmed' }
      razorpay_order_id { "order_#{SecureRandom.hex(8)}" }
      payment_id        { "pay_#{SecureRandom.hex(8)}" }
    end

    trait :cancelled do
      status { 'cancelled' }
    end

    trait :completed do
      status { 'completed' }
    end
  end
end
