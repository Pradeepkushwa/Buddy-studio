FactoryBot.define do
  factory :gallery_item do
    sequence(:title) { |n| "Gallery Item #{n}" }
    media_url  { 'https://example.com/photo.jpg' }
    media_type { 'photo' }
    category   { 'Wedding' }
    position   { rand(1..100) }
    active     { true }

    trait :video do
      media_type { 'video' }
    end

    trait :inactive do
      active { false }
    end
  end
end
