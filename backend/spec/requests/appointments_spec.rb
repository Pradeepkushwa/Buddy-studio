require 'rails_helper'

RSpec.describe 'POST /appointments', type: :request do
  let(:valid_params) do
    {
      appointment: {
        name:    Faker::Name.name,
        email:   Faker::Internet.email,
        mobile:  '9876543210',
        message: 'I need a wedding photo package'
      }
    }
  end

  it 'creates an appointment and returns 201' do
    expect {
      post '/appointments', params: valid_params
    }.to change(Appointment, :count).by(1)
    expect(response).to have_http_status(:created)
  end

  it 'creates a notification for new appointment' do
    expect {
      post '/appointments', params: valid_params
    }.to change(Notification, :count).by(1)
  end

  it 'returns 422 for missing required fields' do
    post '/appointments', params: { appointment: { name: '' } }
    expect(response).to have_http_status(:unprocessable_entity)
  end
end
