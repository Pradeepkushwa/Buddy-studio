# frozen_string_literal: true

class ReviewsController < ApplicationController
  def index
    reviews = Review.approved.recent
    avg_rating = Review.approved.average(:rating)&.to_f&.round(1) || 0
    total = Review.approved.count
    render json: {
      reviews: reviews.map { |r| review_json(r) },
      average_rating: avg_rating,
      total_reviews: total
    }
  end

  def create
    review = Review.new(review_params)
    if review.save
      render json: { message: 'Thank you for your feedback! It will be visible after approval.' }, status: :created
    else
      render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def review_params
    params.require(:review).permit(:name, :email, :rating, :feedback, :booking_id)
  end

  def review_json(r)
    {
      id: r.id, name: r.name, rating: r.rating,
      feedback: r.feedback, created_at: r.created_at
    }
  end
end
