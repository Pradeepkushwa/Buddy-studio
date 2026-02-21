Rails.application.routes.draw do
  # Auth
  post 'auth/signup', to: 'auth#signup'
  post 'auth/login', to: 'auth#login'
  post 'auth/verify_otp', to: 'auth#verify_otp'
  post 'auth/resend_otp', to: 'auth#resend_otp'
  get  'auth/me', to: 'auth#me'

  # Public
  resources :categories, only: [:index]
  resources :packages, only: [:index, :show]
  resources :appointments, only: [:create]

  # Admin
  namespace :admin do
    get 'staff', to: 'staff#index'
    patch 'staff/:id/approve', to: 'staff#approve'
    patch 'staff/:id/reject', to: 'staff#reject'
    get 'customers', to: 'customers#index'

    resources :equipments, only: [:index, :create, :update, :destroy]
    resources :categories, only: [:index, :create, :update, :destroy]
    resources :packages, only: [:index, :create, :update, :destroy]
    resources :appointments, only: [:index, :update]
  end
end
