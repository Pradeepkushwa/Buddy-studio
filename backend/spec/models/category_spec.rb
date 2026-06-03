require 'rails_helper'

RSpec.describe Category, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }

    it 'validates uniqueness of name' do
      create(:category, name: 'Photography')
      dup = build(:category, name: 'Photography')
      expect(dup).not_to be_valid
      expect(dup.errors[:name]).to be_present
    end
  end

  describe 'associations' do
    it { should have_many(:packages) }
  end

  describe 'scopes' do
    let!(:active_cat)   { create(:category, active: true) }
    let!(:inactive_cat) { create(:category, :inactive) }

    it '.active returns only active categories' do
      expect(Category.active).to include(active_cat)
      expect(Category.active).not_to include(inactive_cat)
    end

    it '.ordered returns by position asc' do
      c1 = create(:category, position: 3)
      c2 = create(:category, position: 1)
      expect(Category.ordered.first).to eq(c2)
    end
  end
end
