require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:role) }
    it { should validate_inclusion_of(:role).in_array(User::ROLES) }
  end

  describe 'associations' do
    it { should have_many(:bookings).dependent(:destroy) }
  end

  describe '#active?' do
    context 'when email is not verified' do
      it 'returns false' do
        user = build(:user, :unverified)
        expect(user.active?).to be false
      end
    end

    context 'when user role with verified email' do
      it 'returns true' do
        user = build(:user)
        expect(user.active?).to be true
      end
    end

    context 'when admin' do
      it 'returns true regardless of verification_status' do
        user = build(:user, :admin)
        expect(user.active?).to be true
      end
    end

    context 'when staff with pending approval' do
      it 'returns false' do
        user = build(:user, :staff, verification_status: 'pending')
        expect(user.active?).to be false
      end
    end

    context 'when staff with approved status' do
      it 'returns true' do
        user = build(:user, :staff)
        expect(user.active?).to be true
      end
    end
  end

  describe '#admin?, #staff?, #user?' do
    it 'returns true for matching role' do
      expect(build(:user, :admin).admin?).to be true
      expect(build(:user, :staff).staff?).to be true
      expect(build(:user).user?).to be true
    end

    it 'returns false for non-matching role' do
      expect(build(:user).admin?).to be false
      expect(build(:user).staff?).to be false
    end
  end

  describe 'email normalization' do
    it 'downcases and strips email before validation' do
      user = create(:user, email: '  TEST@EXAMPLE.COM  ')
      expect(user.email).to eq('test@example.com')
    end
  end
end
