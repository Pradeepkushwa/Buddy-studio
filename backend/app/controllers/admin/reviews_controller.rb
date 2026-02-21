# frozen_string_literal: true

module Admin
  class ReviewsController < ApplicationController
    before_action :authenticate_admin!

    def index
      reviews = Review.recent
      render json: { reviews: reviews.map { |r| review_json(r) } }
    end

    def update
      review = Review.find(params[:id])
      if review.update(approved: params[:approved])
        render json: { review: review_json(review), message: params[:approved] ? 'Review approved' : 'Review hidden' }
      else
        render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      Review.find(params[:id]).destroy
      render json: { message: 'Review deleted' }
    end

    private

    def review_json(r)
      {
        id: r.id, name: r.name, email: r.email,
        rating: r.rating, feedback: r.feedback,
        approved: r.approved,
        booking_id: r.booking_id,
        created_at: r.created_at
      }
    end
  end
end
