require 'rails_helper'

RSpec.describe Review, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }

    it 'is invalid with rating below 1' do
      review = build(:review, rating: 0)
      expect(review).not_to be_valid
    end

    it 'is invalid with rating above 5' do
      review = build(:review, rating: 6)
      expect(review).not_to be_valid
    end

    it 'is valid with rating between 1 and 5' do
      review = build(:review, rating: 4)
      expect(review).to be_valid
    end
  end

  describe 'scopes' do
    let!(:approved_review) { create(:review, :approved) }
    let!(:pending_review)  { create(:review) }

    it '.approved returns only approved reviews' do
      expect(Review.approved).to include(approved_review)
      expect(Review.approved).not_to include(pending_review)
    end

    it '.pending returns only unapproved reviews' do
      expect(Review.pending).to include(pending_review)
      expect(Review.pending).not_to include(approved_review)
    end
  end
end
