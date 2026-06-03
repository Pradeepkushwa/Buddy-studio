require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  let(:user) { create(:user) }

  describe '#otp_email' do
    before { user.generate_otp! }

    subject(:mail) { described_class.otp_email(user) }

    it 'delivers to the user email' do
      expect(mail.to).to include(user.email)
    end

    it 'has the correct subject' do
      expect(mail.subject).to eq('Your BuddyStudio verification code')
    end

    it 'contains the OTP code in the body' do
      expect(mail.body.encoded).to include(user.otp_code)
    end
  end

  describe '#password_reset_email' do
    before { user.generate_reset_otp! }

    subject(:mail) { described_class.password_reset_email(user) }

    it 'delivers to the user email' do
      expect(mail.to).to include(user.email)
    end

    it 'has the correct subject' do
      expect(mail.subject).to eq('BuddyStudio - Password Reset Code')
    end

    it 'contains the reset OTP in the body' do
      expect(mail.body.encoded).to include(user.reset_otp)
    end
  end

  describe '#email_change_otp' do
    let(:new_email) { 'new@example.com' }

    before { user.generate_reset_otp! }

    subject(:mail) { described_class.email_change_otp(user, new_email) }

    it 'delivers to the new email address (not old)' do
      expect(mail.to).to include(new_email)
      expect(mail.to).not_to include(user.email)
    end

    it 'has the correct subject' do
      expect(mail.subject).to eq('BuddyStudio - Verify Your New Email')
    end

    it 'contains the OTP in the body' do
      expect(mail.body.encoded).to include(user.reset_otp)
    end
  end
end
