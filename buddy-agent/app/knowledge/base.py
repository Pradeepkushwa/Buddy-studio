from typing import Optional

"""
Buddy Studio — Knowledge Base V1

Each entry maps a topic key to:
  - keywords: list of words that trigger this entry
  - answer: the response to return directly (no LLM call needed)

Agent searches this first. If a keyword match is found with confidence >= threshold,
the stored answer is returned immediately — fast and free.
"""

KNOWLEDGE_BASE: list[dict] = [
    {
        "key": "login",
        "keywords": ["login", "log in", "sign in", "signin", "cant login", "cannot login",
                     "login nahi", "login problem", "access", "enter account"],
        "answer": (
            "Login ke liye apna registered email aur password use karo. "
            "Steps:\n"
            "1. /login page par jaao\n"
            "2. Apna email aur password daalo\n"
            "3. 'Log In' button click karo\n\n"
            "Agar password bhool gaye ho, 'Forgot Password' link use karo — "
            "ek OTP aapke email par aayega."
        ),
    },
    {
        "key": "password_reset",
        "keywords": ["password", "forgot password", "reset password", "change password",
                     "password bhool", "password reset", "otp for password", "new password"],
        "answer": (
            "Password reset karne ke liye:\n"
            "1. Login page par 'Forgot Password' click karo\n"
            "2. Apna registered email daalo\n"
            "3. Email mein aaya 6-digit OTP daalo\n"
            "4. Naya password set karo\n\n"
            "OTP 10 minutes mein expire ho jaata hai. "
            "Agar OTP nahi aaya, spam/junk folder zaroor check karo."
        ),
    },
    {
        "key": "otp_not_received",
        "keywords": ["otp nahi aaya", "otp not received", "otp nahi mila", "resend otp",
                     "otp not coming", "otp missing", "verification code", "email nahi aaya"],
        "answer": (
            "OTP nahi mila? Yeh try karo:\n"
            "1. Spam / Junk folder check karo\n"
            "2. 2-3 minutes wait karo — kabhi kabhi delay hota hai\n"
            "3. OTP verify page par 'Resend OTP' button click karo\n"
            "4. Email address sahi hai ya check karo\n\n"
            "Agar fir bhi nahi aaya, humse contact karo."
        ),
    },
    {
        "key": "signup",
        "keywords": ["signup", "sign up", "register", "account banana", "new account",
                     "create account", "registration"],
        "answer": (
            "Naya account banane ke liye:\n"
            "1. /signup page par jaao\n"
            "2. Apna naam, email aur password daalo\n"
            "3. 'Sign Up' click karo\n"
            "4. Email par OTP aayega — use verify karo\n\n"
            "Account verify hone ke baad aap dashboard access kar sakte ho."
        ),
    },
    {
        "key": "booking_process",
        "keywords": ["booking", "book", "kaise book kare", "how to book", "photography book",
                     "package book", "appointment", "session book", "photoshoot book"],
        "answer": (
            "Booking karne ke steps:\n"
            "1. /packages page par jaao aur apna package choose karo\n"
            "2. Package detail page par 'Book Now' click karo\n"
            "3. Event details fill karo — date, venue, phone number\n"
            "4. Submit karo — payment page par redirect hoga\n"
            "5. Razorpay se payment karo (UPI / Card / NetBanking)\n\n"
            "Booking confirm hone ke baad aapko email confirmation milega."
        ),
    },
    {
        "key": "payment",
        "keywords": ["payment", "pay", "razorpay", "upi", "card", "netbanking",
                     "payment kaise", "paisa", "amount", "price", "cost"],
        "answer": (
            "Payment ke baare mein:\n"
            "- Hum Razorpay use karte hain — India ka most trusted payment gateway\n"
            "- Accepted methods: UPI, Credit/Debit Card, Net Banking, Wallets\n"
            "- Payment secure aur encrypted hai\n"
            "- Payment ke baad booking status 'Confirmed' ho jaata hai\n\n"
            "Payment mein issue ho to humse contact karo."
        ),
    },
    {
        "key": "booking_status",
        "keywords": ["booking status", "my booking", "meri booking", "booking kahan hai",
                     "booking confirmed", "booking pending", "check booking"],
        "answer": (
            "Apni booking status check karne ke liye:\n"
            "1. Login karo\n"
            "2. Dashboard (/dashboard) par jaao\n"
            "3. 'My Bookings' section mein apni bookings dekho\n\n"
            "Status meanings:\n"
            "- Pending: Payment awaited\n"
            "- Confirmed: Booking pakki ho gayi\n"
            "- Upcoming: Event scheduled\n"
            "- Completed: Photography done"
        ),
    },
    {
        "key": "packages",
        "keywords": ["packages", "package", "plan", "what packages", "photography package",
                     "wedding package", "birthday package", "events", "price list", "offer"],
        "answer": (
            "Buddy Studio ke photography packages:\n"
            "- Wedding Photography\n"
            "- Birthday Events\n"
            "- Corporate Events\n"
            "- Portrait Sessions\n"
            "- Pre-wedding Shoots\n\n"
            "Sare packages aur prices /packages page par available hain. "
            "Offer prices aur discount bhi wahan dikhte hain. "
            "Kisi specific package ke baare mein poochh sakte ho!"
        ),
    },
    {
        "key": "gallery",
        "keywords": ["gallery", "portfolio", "photos", "sample", "work", "previous work",
                     "examples", "dekhna hai", "photo dikho"],
        "answer": (
            "Humara kaam dekhne ke liye /gallery page visit karo. "
            "Wahan weddings, birthdays, events ka poora portfolio hai. "
            "Different categories mein filter kar sakte ho — Wedding, Birthday, Events, etc."
        ),
    },
    {
        "key": "refund",
        "keywords": ["refund", "money back", "paise wapas", "cancel booking", "cancellation",
                     "cancel karna", "return money"],
        "answer": (
            "Refund ya cancellation ke liye humari support team se directly contact karo. "
            "Yeh automated process nahi hai — team manually handle karti hai.\n\n"
            "📞 Call/WhatsApp karo — contact details neeche hain.\n"
            "Cancellation policy booking confirmation email mein hoti hai."
        ),
    },
    {
        "key": "staff_approval",
        "keywords": ["staff", "approval", "pending approval", "account approved", "staff account",
                     "staff login", "verification pending", "not approved"],
        "answer": (
            "Staff accounts admin review ke baad manually approve hote hain. "
            "Is process mein 1-2 business days lag sakte hain.\n\n"
            "Approve hone par:\n"
            "1. Email notification milega\n"
            "2. Staff panel (/staff) access ho jayega\n\n"
            "Urgent hai to admin se contact karo."
        ),
    },
    {
        "key": "contact",
        "keywords": ["contact", "phone", "call", "whatsapp", "email", "support",
                     "help", "helpline", "reach", "speak to human", "agent", "team"],
        "answer": (
            "Humse contact karne ke liye:\n"
            "📞 Phone / WhatsApp: [SUPPORT_PHONE_PLACEHOLDER]\n"
            "⏰ Available: Mon-Sat, 10 AM – 7 PM\n\n"
            "Aap website par contact form bhi bhej sakte ho."
        ),
    },
]

# English answers (same keys as KNOWLEDGE_BASE entries)
_ANSWERS_EN: dict[str, str] = {
    "login": (
        "Use your registered email and password to log in.\n"
        "Steps:\n"
        "1. Go to /login\n"
        "2. Enter your email and password\n"
        "3. Click 'Log In'\n\n"
        "Forgot password? Use 'Forgot Password' — an OTP will be sent to your email."
    ),
    "password_reset": (
        "To reset your password:\n"
        "1. On the login page, click 'Forgot Password'\n"
        "2. Enter your registered email\n"
        "3. Enter the 6-digit OTP from your email\n"
        "4. Set a new password\n\n"
        "OTP expires in 10 minutes. Check spam/junk if you don't see it."
    ),
    "otp_not_received": (
        "Didn't get the OTP? Try this:\n"
        "1. Check spam / junk folder\n"
        "2. Wait 2-3 minutes — delivery can be delayed\n"
        "3. Click 'Resend OTP' on the verify page\n"
        "4. Confirm your email address is correct\n\n"
        "Still no OTP? Contact our support team."
    ),
    "signup": (
        "To create a new account:\n"
        "1. Go to /signup\n"
        "2. Enter name, email, and password\n"
        "3. Click 'Sign Up'\n"
        "4. Verify the OTP sent to your email\n\n"
        "After verification you can access your dashboard."
    ),
    "booking_process": (
        "How to book:\n"
        "1. Visit /packages and choose a package\n"
        "2. On the package page, click 'Book Now'\n"
        "3. Fill event details — date, venue, phone\n"
        "4. Submit — you'll be redirected to payment\n"
        "5. Pay via Razorpay (UPI / Card / Net Banking)\n\n"
        "You'll get an email confirmation once booking is confirmed."
    ),
    "payment": (
        "About payments:\n"
        "- We use Razorpay — a trusted Indian payment gateway\n"
        "- UPI, cards, net banking, and wallets are accepted\n"
        "- Payments are secure and encrypted\n"
        "- After payment, booking status becomes 'Confirmed'\n\n"
        "Payment issues? Contact support."
    ),
    "booking_status": (
        "To check booking status:\n"
        "1. Log in\n"
        "2. Go to Dashboard (/dashboard)\n"
        "3. See 'My Bookings'\n\n"
        "Statuses: Pending (payment awaited), Confirmed, Upcoming, Completed."
    ),
    "packages": (
        "Buddy Studio photography packages:\n"
        "- Wedding Photography\n"
        "- Birthday Events\n"
        "- Corporate Events\n"
        "- Portrait Sessions\n"
        "- Pre-wedding Shoots\n\n"
        "See all packages and prices at /packages."
    ),
    "gallery": (
        "Visit /gallery to see our portfolio — weddings, birthdays, events, and more. "
        "You can filter by category."
    ),
    "refund": (
        "For refunds or cancellations, contact our support team directly — "
        "this isn't fully automated.\n\n"
        "📞 Call/WhatsApp: [SUPPORT_PHONE_PLACEHOLDER]\n"
        "Cancellation policy is in your booking confirmation email."
    ),
    "staff_approval": (
        "Staff accounts are approved manually by admin (usually 1-2 business days).\n\n"
        "Once approved you'll get an email and access to /staff.\n"
        "Urgent? Contact admin/support."
    ),
    "contact": (
        "Contact us:\n"
        "📞 Phone / WhatsApp: [SUPPORT_PHONE_PLACEHOLDER]\n"
        "⏰ Mon–Sat, 10 AM – 7 PM\n\n"
        "You can also use the contact form on the website."
    ),
}


def _answer_for_entry(entry: dict, language: str) -> str:
    if (language or "hi").lower().strip() == "en":
        return _ANSWERS_EN.get(entry["key"], entry["answer"])
    return entry["answer"]


def search_knowledge_base(message: str, language: str = "hi") -> Optional[str]:
    """
    Search the knowledge base for a matching entry.

    Returns the answer string if a match is found with sufficient keyword hits,
    otherwise returns None (triggers LLM fallback).
    """
    message_lower = message.lower()
    best_match = None
    best_score = 0

    for entry in KNOWLEDGE_BASE:
        score = sum(1 for kw in entry["keywords"] if kw in message_lower)
        if score > best_score:
            best_score = score
            best_match = entry

    if best_score >= 1 and best_match:
        return _answer_for_entry(best_match, language)
    return None
