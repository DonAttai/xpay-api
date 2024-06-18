declare namespace NodeJs {
  export interface ProcessEnv {
    DB_DATABASE: string;
    DB_PASSWORD: string;
    DB_USERNAME: string;
    DB_PORT: number;
    DB_HOST: string;
    CLIENT_URL_LOCAL: string;
    CLIENT_URL_REMOTE: string;
    JWT_SECRET: string;
    REFRESH_JWT_SECRET: string;
    COOKIE_SECRET: string;
    FORGOT_PASSWORD_TOKEN_SECRET: string;
    VERIFY_EMAIL_TOKEN_SECRET: string;
    PORT: number;
    BREVO_USER: string;
    BREVO_PASS: string;
    PAYSTACK_SECRET_KEY: string;
    NODE_ENV: "development" | "production" | "test";
    MAILTRAP_USER: string;
    MAILTRAP_PASS: string;
    DB_URI: string;
  }
}
