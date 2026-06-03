require 'rails_helper'

RSpec.describe Equipment, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_inclusion_of(:equipment_type).in_array(Equipment::TYPES) }
  end

  describe 'scopes' do
    it '.active returns only active equipment' do
      active   = create(:equipment, active: true)
      inactive = create(:equipment, :inactive)
      expect(Equipment.active).to include(active)
      expect(Equipment.active).not_to include(inactive)
    end
  end
end
