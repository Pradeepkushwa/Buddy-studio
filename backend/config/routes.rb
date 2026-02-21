Rails.application.routes.draw do
  # Auth
  post 'auth/signup', to: 'auth#signup'
  post 'auth/login', to: 'auth#login'
  post 'auth/verify_otp', to: 'auth#verify_otp'
  post 'auth/resend_otp', to: 'auth#resend_otp'
  get  'auth/me', to: 'auth#me'

  # Password Reset
  post 'password/forgot', to: 'password_resets#forgot'
  post 'password/verify_otp', to: 'password_resets#verify_otp'
  post 'password/reset', to: 'password_resets#reset'

  # Profile
  get   'profile', to: 'profile#show'
  patch 'profile', to: 'profile#update'
  post  'profile/avatar', to: 'profile#upload_avatar'
  post  'profile/request_email_change', to: 'profile#request_email_change'
  post  'profile/verify_email_change', to: 'profile#verify_email_change'

  # Public
  resources :categories, only: [:index]
  resources :packages, only: [:index, :show]
  resources :appointments, only: [:create]
  resources :gallery_items, only: [:index], path: 'gallery'
  resources :reviews, only: [:index, :create]

  # Authenticated customer
  post 'bookings', to: 'bookings#create'
  get  'bookings/mine', to: 'bookings#mine'

  # Staff
  namespace :staff do
    resources :equipments, only: [:index, :create, :update]
    resources :packages, only: [:index, :create, :update, :destroy]
  end

  # Admin
  namespace :admin do
    get 'dashboard', to: 'dashboard#index'

    get 'staff', to: 'staff#index'
    patch 'staff/:id/approve', to: 'staff#approve'
    patch 'staff/:id/reject', to: 'staff#reject'
    get 'customers', to: 'customers#index'

    resources :equipments, only: [:index, :create, :update, :destroy]
    resources :categories, only: [:index, :create, :update, :destroy]
    resources :packages, only: [:index, :create, :update, :destroy] do
      member do
        patch :approve
        patch :reject
      end
    end
    resources :appointments, only: [:index, :update]
    resources :bookings, only: [:index, :update]
    resources :gallery_items, only: [:index, :create, :update, :destroy]
    resources :reviews, only: [:index, :update, :destroy]
  end
end
