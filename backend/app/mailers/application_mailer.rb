class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_FROM', 'rordeveloper464@gmail.com')
  layout 'mailer'
end
