require 'openssl'

class RazorpayWebhooksController < ApplicationController
  def create
    raw_body = request.raw_post

    signature = request.headers['X-Razorpay-Signature']
    event_id = request.headers['X-Razorpay-Event-Id']
    webhook_secret = ENV['RAZORPAY_WEBHOOK_SECRET']

    if signature.blank? || event_id.blank? || webhook_secret.blank?
      return render json: {
        error: 'Invalid webhook request'
      }, status: :bad_request
    end

    expected_signature = OpenSSL::HMAC.hexdigest(
      'SHA256',
      webhook_secret,
      raw_body
    )

    unless secure_signature_match?(expected_signature, signature)
      return render json: {
        error: 'Invalid webhook signature'
      }, status: :unauthorized
    end

    payload = JSON.parse(raw_body)
    event_type = payload['event']

    webhook_event = WebhookEvent.find_or_create_by!(
      provider: 'razorpay',
      event_id: event_id
    ) do |event|
      event.event_type = event_type
    end

    # Duplicate webhook
    if webhook_event.processed_at.present?
      return render json: {
        message: 'Webhook already processed'
      }, status: :ok
    end

    process_event(payload)

    webhook_event.update!(
      processed_at: Time.current
    )

    render json: {
      message: 'Webhook processed'
    }, status: :ok

  rescue JSON::ParserError
    render json: {
      error: 'Invalid JSON payload'
    }, status: :bad_request

  rescue ActiveRecord::RecordNotUnique
    render json: {
      message: 'Webhook already received'
    }, status: :ok
  end

  private

  def secure_signature_match?(expected, received)
    return false unless expected.bytesize == received.bytesize

    ActiveSupport::SecurityUtils.secure_compare(
      expected,
      received
    )
  end

  def process_event(payload)
    case payload['event']
    when 'refund.processed'
      process_refund_processed(payload)
    end
  end

  def process_refund_processed(payload)
    # Next step
  end
end
