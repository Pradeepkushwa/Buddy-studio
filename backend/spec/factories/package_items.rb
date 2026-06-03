FactoryBot.define do
  factory :package_item do
    association :package
    association :equipment
    quantity { 1 }
    notes { nil }
  end
end
