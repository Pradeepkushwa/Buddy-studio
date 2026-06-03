# frozen_string_literal: true

module JwtAuthenticatable
  extend ActiveSupport::Concern

  ALG = 'HS256'

  def self.jwt_secret
    ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
  end

  class_methods do
    def decode_token(token)
      return nil if token.blank?
      secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
      return nil if secret.blank?
      payload = JWT.decode(token, secret, true, { algorithm: ALG })
      payload[0].with_indifferent_access
    rescue JWT::DecodeError, ArgumentError, StandardError
      nil
    end
  end

  def encode_token(user_id, exp: token_expiry)
    secret = ENV['SECRET_KEY_BASE'] || Rails.application.credentials.secret_key_base
    jti = SecureRandom.uuid
    payload = { sub: user_id, exp: exp.to_i, jti: jti }
    token = JWT.encode(payload, secret, ALG)
    { token: token, jti: jti, expires_at: exp }
  end

  def token_expiry
    if ENV['TOKEN_EXPIRY_MINUTES'].present?
      ENV['TOKEN_EXPIRY_MINUTES'].to_i.minutes.from_now
    else
      ENV.fetch('TOKEN_EXPIRY_HOURS', '8').to_i.hours.from_now
    end
  end

  def current_user
    return @current_user if defined?(@current_user)
    raw_token = request.headers['Authorization']&.split(' ')&.last
    payload = self.class.decode_token(raw_token)
    return @current_user = nil unless payload

    # Verify session is still active in DB (guards against forced logout)
    jti = payload[:jti]
    return @current_user = nil unless jti && UserSession.valid?(jti)

    @current_user = User.find_by(id: payload[:sub])
  end

  def authenticate_user!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
  end

  def authenticate_admin!
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user.admin?
  end

  def authenticate_staff_or_admin!
    unless current_user && (current_user.admin? || current_user.staff?)
      render json: { error: 'Forbidden' }, status: :forbidden
    end
  end

  def require_active_user!
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
    return render json: { error: 'Account pending approval' }, status: :forbidden unless current_user.active?
  end
end
