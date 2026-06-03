require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe 'factory methods' do
    let!(:user)    { create(:user) }
    let!(:package) { create(:package) }
    let!(:booking) { create(:booking, user: user, package: package) }

    it '.create_for_new_booking creates a notification' do
      expect {
        Notification.create_for_new_booking(booking)
      }.to change(Notification, :count).by(1)
    end

    it '.create_for_new_appointment creates a notification' do
      appointment = create(:appointment)
      expect {
        Notification.create_for_new_appointment(appointment)
      }.to change(Notification, :count).by(1)
    end

    it '.create_for_booking_update creates a notification' do
      expect {
        Notification.create_for_booking_update(booking)
      }.to change(Notification, :count).by(1)
    end

    it '.create_for_new_review creates a notification' do
      review = create(:review)
      expect {
        Notification.create_for_new_review(review)
      }.to change(Notification, :count).by(1)
    end
  end

  describe 'scopes' do
    it '.unread returns only unread notifications' do
      read_notif   = create(:notification, :read)
      unread_notif = create(:notification)
      expect(Notification.unread).to include(unread_notif)
      expect(Notification.unread).not_to include(read_notif)
    end

    it '.recent returns at most 20 notifications' do
      create_list(:notification, 25)
      expect(Notification.recent.size).to eq(20)
    end
  end
end
