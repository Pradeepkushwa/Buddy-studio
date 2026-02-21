Rails.application.routes.draw do
  post 'auth/signup', to: 'auth#signup'
  post 'auth/login', to: 'auth#login'
  post 'auth/verify_otp', to: 'auth#verify_otp'
  post 'auth/resend_otp', to: 'auth#resend_otp'
  get  'auth/me', to: 'auth#me'

  namespace :admin do
    get 'staff', to: 'staff#index'
    patch 'staff/:id/approve', to: 'staff#approve'
    patch 'staff/:id/reject', to: 'staff#reject'
    get 'customers', to: 'customers#index'
  end
end
