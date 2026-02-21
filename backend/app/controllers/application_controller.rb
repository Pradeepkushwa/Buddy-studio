# frozen_string_literal: true

class ApplicationController < ActionController::API
  include JwtAuthenticatable
end
