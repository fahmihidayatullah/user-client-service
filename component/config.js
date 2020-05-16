require('dotenv').config()

if (process.env.NODE_ENV === 'test') {
	module.exports = {
		mongo: {
			url: ''
		},
		provision_key: '',
		provision_key_reset: '',
		KONG_ADMIN: "",
		KONG_API: "",
		API_PATH: "",
		PORT: 3000,
		SMTP_SERVICE: "",
		SMTP_HOST: "",
		SMTP_PORT:  "",
		SMTP_EMAIL: "",
		SMTP_PASSWORD: "",
		PLATFORM_NAME: ""
	}
} else {
	module.exports = {
		mongo: {
			url: process.env.MONGO_DATABASE_URL
		},
		provision_key: process.env.PROVISION_KEY,
		provision_key_reset: process.env.PROVISION_KEY_RESET,
		KONG_ADMIN: process.env.KONG_ADMIN,
		KONG_API: process.env.KONG_API,
		API_PATH: process.env.API_PATH,
		SMTP_SERVICE: process.env.SMTP_SERVICE,
		SMTP_HOST: process.env.SMTP_HOST,
		SMTP_PORT:  process.env.SMTP_PORT,
		SMTP_EMAIL: process.env.SMTP_EMAIL,
		SMTP_PASSWORD: process.env.SMTP_PASSWORD,
		PLATFORM_NAME: process.env.PLATFORM_NAME
	}
}
