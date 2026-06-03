require 'rails_helper'

RSpec.describe Appointment, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
    it { should validate_inclusion_of(:status).in_array(Appointment::STATUSES) }
  end

  describe 'factory' do
    it 'creates a valid appointment' do
      expect(build(:appointment)).to be_valid
    end

    it 'can have an optional package' do
      appt = create(:appointment, :with_package)
      expect(appt.package).to be_present
    end
  end
end
