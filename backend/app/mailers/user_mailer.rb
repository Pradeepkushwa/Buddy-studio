# frozen_string_literal: true

class UserMailer < ApplicationMailer
  default from: ENV.fetch('MAILER_FROM', 'noreply@buddystudio.com')

  def otp_email(user)
    @user = user
    @otp = user.otp_code
    mail(to: @user.email, subject: 'Your BuddyStudio verification code')
  end

  def password_reset_email(user)
    @user = user
    @otp = user.reset_otp
    mail(to: @user.email, subject: 'BuddyStudio - Password Reset Code')
  end

  def email_change_otp(user, new_email)
    @user = user
    @otp = user.reset_otp
    @new_email = new_email
    mail(to: new_email, subject: 'BuddyStudio - Verify Your New Email')
  end
end
