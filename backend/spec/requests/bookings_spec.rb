require 'rails_helper'

RSpec.describe 'Bookings (customer)', type: :request do
  let!(:user)    { create(:user) }
  let!(:package) { create(:package, active: true, approval_status: 'approved') }
  let(:headers)  { auth_headers_for(user) }

  let(:valid_params) do
    {
      booking: {
        package_id:       package.id,
        event_start_date: (Date.today + 10).to_s,
        event_end_date:   (Date.today + 12).to_s,
        event_address:    '123 Main St, City',
        phone_number:     '9876543210',
        email:            user.email
      }
    }
  end

  describe 'POST /bookings' do
    it 'creates a booking for an authenticated user' do
      expect {
        post '/bookings', params: valid_params, headers: headers
      }.to change(Booking, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'creates a notification on booking creation' do
      expect {
        post '/bookings', params: valid_params, headers: headers
      }.to change(Notification, :count).by(1)
    end

    it 'returns 401 for unauthenticated request' do
      post '/bookings', params: valid_params
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns 404 for inactive package' do
      inactive_pkg = create(:package, :inactive)
      post '/bookings',
           params:  { booking: valid_params[:booking].merge(package_id: inactive_pkg.id) },
           headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 422 when booking data is invalid (missing required fields)' do
      post '/bookings',
           params:  { booking: { package_id: package.id } },
           headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to be_present
    end
  end

  describe 'GET /bookings/mine' do
    let!(:my_booking)    { create(:booking, user: user, package: package) }
    let!(:other_booking) { create(:booking, package: package) }

    it 'returns only the current user bookings' do
      get '/bookings/mine', headers: headers
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['bookings'].map { |b| b['id'] }
      expect(ids).to include(my_booking.id)
      expect(ids).not_to include(other_booking.id)
    end

    it 'returns 401 without auth' do
      get '/bookings/mine'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /bookings/:id/create_order (Razorpay)' do
    let!(:booking) { create(:booking, user: user, package: package, status: 'pending') }

    context 'when Razorpay is configured' do
      before do
        stub_const('ENV', ENV.to_hash.merge(
          'RAZORPAY_KEY_ID'     => 'fake_key',
          'RAZORPAY_KEY_SECRET' => 'fake_secret'
        ))
        fake_order = double('Razorpay::Order', id: 'order_test_123')
        allow(Razorpay).to receive(:setup)
        allow(Razorpay::Order).to receive(:create).and_return(fake_order)
      end

      it 'creates a Razorpay order and returns 200 with order_id' do
        post "/bookings/#{booking.id}/create_order", headers: headers
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['order_id']).to eq('order_test_123')
      end
    end

    context 'when Razorpay is not configured' do
      before do
        stub_const('ENV', ENV.to_hash.merge('RAZORPAY_KEY_ID' => '', 'RAZORPAY_KEY_SECRET' => ''))
      end

      it 'returns 503' do
        post "/bookings/#{booking.id}/create_order", headers: headers
        expect(response).to have_http_status(:service_unavailable)
      end
    end

    it 'returns 404 for another user booking' do
      other_booking = create(:booking, package: package)
      post "/bookings/#{other_booking.id}/create_order", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 422 when booking already has payment' do
      paid_booking = create(:booking, :confirmed, user: user, package: package)
      post "/bookings/#{paid_booking.id}/create_order", headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 422 when booking status is not pending (e.g. upcoming)' do
      non_pending = create(:booking, user: user, package: package, status: 'upcoming')
      post "/bookings/#{non_pending.id}/create_order", headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST /bookings/:id/verify_payment' do
    let!(:booking) do
      b = create(:booking, user: user, package: package, status: 'pending')
      b.update!(razorpay_order_id: 'order_test_123')
      b
    end

    context 'with valid signature' do
      before do
        stub_const('ENV', ENV.to_hash.merge(
          'RAZORPAY_KEY_ID'     => 'fake_key',
          'RAZORPAY_KEY_SECRET' => 'fake_secret'
        ))
        allow(Razorpay).to receive(:setup)
        allow(Razorpay::Utility).to receive(:verify_payment_signature)
      end

      it 'marks booking as confirmed and returns 200' do
        post "/bookings/#{booking.id}/verify_payment", headers: headers, params: {
          razorpay_payment_id: 'pay_abc',
          razorpay_order_id:   'order_test_123',
          razorpay_signature:  'sig_123'
        }
        expect(response).to have_http_status(:ok)
        expect(booking.reload.status).to eq('confirmed')
      end
    end

    context 'with invalid signature' do
      before do
        stub_const('ENV', ENV.to_hash.merge(
          'RAZORPAY_KEY_ID'     => 'fake_key',
          'RAZORPAY_KEY_SECRET' => 'fake_secret'
        ))
        allow(Razorpay).to receive(:setup)
        allow(Razorpay::Utility).to receive(:verify_payment_signature).and_raise(SecurityError)
      end

      it 'returns 422' do
        post "/bookings/#{booking.id}/verify_payment", headers: headers, params: {
          razorpay_payment_id: 'pay_abc',
          razorpay_order_id:   'order_test_123',
          razorpay_signature:  'bad_sig'
        }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
