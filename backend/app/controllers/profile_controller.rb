# frozen_string_literal: true

class ProfileController < ApplicationController
  include JwtAuthenticatable
  before_action :authenticate_user!

  # GET /profile
  def show
    render json: { user: profile_response(current_user) }, status: :ok
  end

  # PATCH /profile
  def update
    if current_user.update(profile_params)
      render json: { message: 'Profile updated', user: profile_response(current_user) }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /profile/avatar
  def upload_avatar
    unless params[:avatar].present?
      return render json: { error: 'No file provided' }, status: :unprocessable_entity
    end

    file = params[:avatar]
    ext = File.extname(file.original_filename).downcase
    unless %w[.jpg .jpeg .png .gif .webp].include?(ext)
      return render json: { error: 'Only image files are allowed (jpg, png, gif, webp)' }, status: :unprocessable_entity
    end

    if file.size > 5.megabytes
      return render json: { error: 'File size must be under 5MB' }, status: :unprocessable_entity
    end

    filename = "#{current_user.id}_#{Time.current.to_i}#{ext}"
    filepath = Rails.root.join('public', 'uploads', 'avatars', filename)
    File.open(filepath, 'wb') { |f| f.write(file.read) }

    old_avatar = current_user.avatar_url
    if old_avatar.present?
      old_path = Rails.root.join('public', old_avatar.sub(%r{^/}, ''))
      File.delete(old_path) if File.exist?(old_path)
    end

    avatar_url = "/uploads/avatars/#{filename}"
    current_user.update!(avatar_url: avatar_url)

    render json: { message: 'Avatar uploaded', avatar_url: avatar_url, user: profile_response(current_user) }, status: :ok
  end

  # POST /profile/request_email_change
  def request_email_change
    new_email = params[:new_email]&.strip&.downcase
    if new_email.blank? || !new_email.match?(URI::MailTo::EMAIL_REGEXP)
      return render json: { error: 'Please provide a valid email' }, status: :unprocessable_entity
    end

    if new_email == current_user.email
      return render json: { error: 'New email is the same as current email' }, status: :unprocessable_entity
    end

    if User.where.not(id: current_user.id).exists?(email: new_email)
      return render json: { error: 'This email is already taken' }, status: :unprocessable_entity
    end

    current_user.generate_reset_otp!
    current_user.update_columns(pending_email: new_email)
    UserMailer.email_change_otp(current_user, new_email).deliver_now

    render json: { message: "Verification code sent to #{new_email}" }, status: :ok
  end

  # POST /profile/verify_email_change
  def verify_email_change
    unless current_user.reset_otp_valid?(params[:otp_code])
      return render json: { error: 'Invalid or expired code' }, status: :unprocessable_entity
    end

    new_email = current_user.pending_email
    if new_email.blank?
      return render json: { error: 'No email change pending' }, status: :unprocessable_entity
    end

    current_user.update!(email: new_email)
    current_user.clear_reset_otp!
    current_user.update_columns(pending_email: nil)

    if current_user.staff?
      current_user.update!(verification_status: 'pending')
      render json: {
        message: 'Email updated. Your account is now pending admin re-approval.',
        requires_reapproval: true,
        user: profile_response(current_user)
      }, status: :ok
    else
      render json: { message: 'Email updated successfully', user: profile_response(current_user) }, status: :ok
    end
  end

  private

  def profile_params
    params.require(:profile).permit(:name, :mobile_number)
  end

  def profile_response(u)
    {
      id: u.id,
      email: u.email,
      name: u.name,
      mobile_number: u.mobile_number,
      role: u.role,
      verification_status: u.verification_status,
      email_verified: u.email_verified,
      active: u.active?,
      avatar_url: u.avatar_url
    }
  end
end
