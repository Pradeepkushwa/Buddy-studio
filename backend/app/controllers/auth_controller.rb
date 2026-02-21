# frozen_string_literal: true

class AuthController < ApplicationController
  include JwtAuthenticatable

  # POST /auth/signup
  def signup
    user = User.new(signup_params)
    user.role = (params[:role].presence || 'user').downcase
    user.verification_status = 'pending'
    user.email_verified = false

    unless User::ROLES.include?(user.role)
      return render json: { error: 'Invalid role' }, status: :unprocessable_entity
    end

    # Only allow admin creation if no admin exists (seed)
    if user.role == 'admin' && User.exists?(role: 'admin')
      return render json: { error: 'Cannot create admin via signup' }, status: :unprocessable_entity
    end

    if user.save
      user.generate_otp!
      UserMailer.otp_email(user).deliver_now
      render json: {
        message: 'Signup successful. Check your email for the verification code.',
        user_id: user.id,
        email: user.email,
        role: user.role,
        verification_status: user.verification_status,
        requires_otp: true
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /auth/verify_otp
  def verify_otp
    user = User.find_by(email: params[:email]&.strip&.downcase)
    unless user
      return render json: { error: 'User not found' }, status: :not_found
    end

    unless user.otp_valid?(params[:otp_code])
      return render json: { error: 'Invalid or expired code' }, status: :unprocessable_entity
    end

    user.mark_email_verified!
    token = encode_token(user.id)
    render json: {
      message: 'Email verified',
      token: token,
      user: user_response(user)
    }, status: :ok
  end

  # POST /auth/resend_otp
  def resend_otp
    user = User.find_by(email: params[:email]&.strip&.downcase)
    unless user
      return render json: { error: 'User not found' }, status: :not_found
    end

    user.generate_otp!
    UserMailer.otp_email(user).deliver_now
    render json: { message: 'Verification code sent again' }, status: :ok
  end

  # POST /auth/login
  def login
    user = User.find_by(email: params[:email]&.strip&.downcase)
    unless user&.authenticate(params[:password])
      return render json: { error: 'Invalid email or password' }, status: :unauthorized
    end

    unless user.active?
      return render json: {
        error: 'Account pending',
        message: staff_pending_message(user),
        verification_status: user.verification_status
      }, status: :forbidden
    end

    token = encode_token(user.id)
    render json: {
      token: token,
      user: user_response(user)
    }, status: :ok
  end

  # GET /auth/me (requires Authorization header)
  def me
    authenticate_user!
    render json: { user: user_response(current_user) }, status: :ok
  end

  private

  def signup_params
    params.permit(:email, :password, :password_confirmation, :name, :mobile_number)
  end

  def user_response(u)
    {
      id: u.id,
      email: u.email,
      name: u.name,
      mobile_number: u.mobile_number,
      role: u.role,
      verification_status: u.verification_status,
      email_verified: u.email_verified,
      active: u.active?
    }
  end

  def staff_pending_message(u)
    u.staff? ? 'Your staff account is pending approval by an admin.' : 'Please verify your email first.'
  end
end
