export const {
    APP_PORT,
    NODE_ENV,
    JWT_SECRET,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    WALLET_PATH
} = process.env

export const IN_PROD = NODE_ENV === 'production'
