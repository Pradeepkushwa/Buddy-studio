from pydantic_settings import BaseSettings

# ── Support phone placeholder (real number only in .env / Render — never commit) ─
BUDDY_STUDIO_SUPPORT_NUMBER = "+91-XXXXXXXXXX"


class Settings(BaseSettings):
    # LLM provider: gemini (free tier) | openai (paid) | none (KB + escalate only)
    llm_provider: str = "gemini"

    # Google Gemini (free API key from https://aistudio.google.com/apikey)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-latest"

    # OpenAI (optional — only if llm_provider=openai)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    support_phone: str = BUDDY_STUDIO_SUPPORT_NUMBER
    support_whatsapp: str = BUDDY_STUDIO_SUPPORT_NUMBER
    allowed_origins: str = "*"
    max_history_messages: int = 20
    escalation_threshold: int = 3
    rate_limit_requests: int = 30
    rate_limit_window_seconds: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def llm_ready(self) -> bool:
        if self.llm_provider == "none":
            return False
        if self.llm_provider == "gemini":
            return bool(self.gemini_api_key.strip())
        if self.llm_provider == "openai":
            return bool(self.openai_api_key.strip())
        return False


settings = Settings()
