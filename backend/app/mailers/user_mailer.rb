# frozen_string_literal: true

class UserMailer < ApplicationMailer
  default from: ENV.fetch('MAILER_FROM', 'noreply@buddystudio.com')

  def otp_email(user)
    @user = user
    @otp = user.otp_code
    mail(to: @user.email, subject: 'Your BuddyStudio verification code')
  end
end
