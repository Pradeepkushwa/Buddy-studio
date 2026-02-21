# frozen_string_literal: true

module JwtAuthenticatable
  extend ActiveSupport::Concern

  SECRET = Rails.application.credentials.secret_key_base
  ALG = 'HS256'

  class_methods do
    def decode_token(token)
      return nil if token.blank?
      payload = JWT.decode(token, SECRET, true, { algorithm: ALG })
      payload[0].with_indifferent_access
    rescue JWT::DecodeError
      nil
    end
  end

  def encode_token(user_id, exp: 24.hours.from_now)
    payload = { sub: user_id, exp: exp.to_i }
    JWT.encode(payload, SECRET, ALG)
  end

  def current_user
    return @current_user if defined?(@current_user)
    token = request.headers['Authorization']&.split(' ')&.last
    payload = self.class.decode_token(token)
    @current_user = payload ? User.find_by(id: payload[:sub]) : nil
  end

  def authenticate_user!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
  end

  def authenticate_admin!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.admin?
  end

  def require_active_user!
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
    return render json: { error: 'Account pending approval' }, status: :forbidden unless current_user.active?
  end
end
