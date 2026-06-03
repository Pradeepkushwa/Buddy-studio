FactoryBot.define do
  factory :user_session do
    association :user
    jti { SecureRandom.uuid }
    expires_at { 8.hours.from_now }
  end
end
