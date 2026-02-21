# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  ROLES = %w[admin staff user].freeze
  VERIFICATION_STATUSES = %w[pending approved verified].freeze
  OTP_EXPIRY_MINUTES = 10
  OTP_LENGTH = 6

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :mobile_number, format: { with: /\A[0-9+\-\s()]{7,15}\z/, message: 'is not a valid phone number' }, allow_blank: true
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :verification_status, inclusion: { in: VERIFICATION_STATUSES }, allow_nil: true

  has_many :bookings, dependent: :destroy
  has_many :created_packages, class_name: 'Package', foreign_key: :created_by_id, dependent: :nullify
  has_many :gallery_items, foreign_key: :uploaded_by_id, dependent: :nullify

  before_validation :set_default_verification_status, on: :create
  before_validation :normalize_email

  # Staff must be approved by admin to be considered "verified" for login
  def active?
    return false unless email_verified
    return true if admin?
    return verification_status == 'approved' if staff?
    true # user
  end

  def admin?
    role == 'admin'
  end

  def staff?
    role == 'staff'
  end

  def user?
    role == 'user'
  end

  def generate_otp!
    self.otp_code = format('%06d', rand(0..999_999))
    self.otp_sent_at = Time.current
    save!
    otp_code
  end

  def otp_valid?(code)
    return false if otp_code.blank? || code.blank?
    return false if otp_sent_at.blank? || otp_sent_at < OTP_EXPIRY_MINUTES.minutes.ago
    ActiveSupport::SecurityUtils.secure_compare(otp_code, code.to_s)
  end

  def clear_otp!
    update_columns(otp_code: nil, otp_sent_at: nil)
  end

  def mark_email_verified!
    update!(email_verified: true, verification_status: 'verified')
    clear_otp!
  end

  def generate_reset_otp!
    self.reset_otp = format('%06d', rand(0..999_999))
    self.reset_otp_sent_at = Time.current
    save!
    reset_otp
  end

  def reset_otp_valid?(code)
    return false if reset_otp.blank? || code.blank?
    return false if reset_otp_sent_at.blank? || reset_otp_sent_at < OTP_EXPIRY_MINUTES.minutes.ago
    ActiveSupport::SecurityUtils.secure_compare(reset_otp, code.to_s)
  end

  def clear_reset_otp!
    update_columns(reset_otp: nil, reset_otp_sent_at: nil)
  end

  private

  def set_default_verification_status
    self.verification_status = 'pending' if verification_status.blank?
    self.verification_status = 'pending' if staff? # staff stays pending until admin approves
  end

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end
end
