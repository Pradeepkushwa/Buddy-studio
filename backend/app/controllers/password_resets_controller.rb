# frozen_string_literal: true

class PasswordResetsController < ApplicationController
  # POST /password/forgot
  def forgot
    user = User.find_by(email: params[:email]&.strip&.downcase)

    unless user
      return render json: { error: 'No account found with that email' }, status: :not_found
    end

    user.generate_reset_otp!
    UserMailer.password_reset_email(user).deliver_later

    render json: { message: 'Password reset code sent to your email', email: user.email }, status: :ok
  end

  # POST /password/verify_otp
  def verify_otp
    user = User.find_by(email: params[:email]&.strip&.downcase)

    unless user
      return render json: { error: 'No account found with that email' }, status: :not_found
    end

    unless user.reset_otp_valid?(params[:otp_code])
      return render json: { error: 'Invalid or expired code' }, status: :unprocessable_entity
    end

    render json: { message: 'OTP verified. You can now reset your password.', verified: true }, status: :ok
  end

  # POST /password/reset
  def reset
    user = User.find_by(email: params[:email]&.strip&.downcase)

    unless user
      return render json: { error: 'No account found with that email' }, status: :not_found
    end

    unless user.reset_otp_valid?(params[:otp_code])
      return render json: { error: 'Invalid or expired code. Please request a new one.' }, status: :unprocessable_entity
    end

    if params[:password].blank? || params[:password].length < 6
      return render json: { error: 'Password must be at least 6 characters' }, status: :unprocessable_entity
    end

    if params[:password] != params[:password_confirmation]
      return render json: { error: 'Password and confirmation do not match' }, status: :unprocessable_entity
    end

    user.password = params[:password]
    user.password_confirmation = params[:password_confirmation]

    if user.save
      user.clear_reset_otp!
      render json: { message: 'Password updated successfully. You can now log in.' }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
