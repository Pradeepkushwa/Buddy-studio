# frozen_string_literal: true

class ApplicationController < ActionController::API
  include JwtAuthenticatable

  before_action :set_no_cache_headers

  private

  def set_no_cache_headers
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
  end
end
