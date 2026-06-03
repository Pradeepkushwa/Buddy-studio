FactoryBot.define do
  factory :equipment do
    sequence(:name) { |n| "Equipment #{n}" }
    equipment_type { Equipment::TYPES.sample }
    active { true }

    trait :inactive do
      active { false }
    end

    Equipment::TYPES.each do |type|
      trait type.to_sym do
        equipment_type { type }
      end
    end
  end
end
