require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'
require 'faker'
Faker::Config.locale = 'en'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [Rails.root.join('spec/fixtures')]
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  config.include FactoryBot::Syntax::Methods

  # Helper to encode a JWT token and create a DB session for a user
  config.include Module.new {
    include JwtAuthenticatable

    def auth_headers_for(user)
      encoded = encode_token(user.id)
      UserSession.create_for(user, jti: encoded[:jti], expires_at: encoded[:expires_at])
      { 'Authorization' => "Bearer #{encoded[:token]}" }
    end
  }
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
