require 'rails_helper'

RSpec.describe Booking, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:package) }
  end

  describe 'validations' do
    it { should validate_presence_of(:event_start_date) }
    it { should validate_presence_of(:event_end_date) }
    it { should validate_presence_of(:event_address) }
    it { should validate_presence_of(:amount) }
    it { should validate_inclusion_of(:status).in_array(Booking::STATUSES) }
  end

  describe 'end_date_after_start_date' do
    it 'is invalid when end_date is before start_date' do
      booking = build(:booking, event_start_date: Date.today + 5, event_end_date: Date.today + 3)
      expect(booking).not_to be_valid
      expect(booking.errors[:event_end_date]).to be_present
    end

    it 'is valid when end_date is after start_date' do
      booking = build(:booking, event_start_date: Date.today + 3, event_end_date: Date.today + 5)
      expect(booking).to be_valid
    end
  end

  describe 'scopes' do
    it '.pending returns pending bookings' do
      pending_booking   = create(:booking, status: 'pending')
      confirmed_booking = create(:booking, :confirmed)
      expect(Booking.pending).to include(pending_booking)
      expect(Booking.pending).not_to include(confirmed_booking)
    end
  end
end
