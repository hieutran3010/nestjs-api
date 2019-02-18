import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from 'joi';

const HOST_PORT_PATTERN = '^(http|https|redis):(/){2}([a-zA-Z0-9])+:([0-9]){4,5}$';

export interface EnvConfig {
  [prop: string]: string;
}

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['dev', 'prod', 'uat'])
        .default('dev'),
      DOMAIN: Joi.string().default('localhost'),
      PORT: Joi.number().default(3000),
      SOCKET_HOST: Joi.string().regex(new RegExp(HOST_PORT_PATTERN)),
      BRAND_NAME: Joi.string().default('FLESS API PLATFORM'),

      APP_LOGGER_NAME: Joi.string().default('api-default-logger'),
      APP_LOGGER_PATH: Joi.string().default('./logs/app.log'),
      APP_LOGGER_ROTATE_PERIOD: Joi.number().default(1),
      APP_LOGGER_ROTATE_KEEPING_COUNT: Joi.number().default(3),
      APP_LOGGER_LEVEL: Joi.string().default('debug'),
      APP_LOGGER_TYPE: Joi.number().default(0),

      LOGZIO_API_TOKEN: Joi.string(),

      DB_SERVER: Joi.string(),
      DB_NAME: Joi.string(),
      DB_ACCOUNT: Joi.string(),
      DB_PASSWORD: Joi.string(),

      TASK_SCHEDULER_COLLECTION_NAME: Joi.string().default('task-schedulers'),
      AUTH_TOKEN_EXPIRES_IN: Joi.string().default('4h'),
      RESET_PASS_TOKEN_EXPIRES_IN: Joi.string().default('0.5h'),
      LIMIT_LOGIN_ATTEMPTS: Joi.number(),
      JWT_SECRET_KEY: Joi.string().default('apiSecretKey'),
      INVISIBLE_RECAPTCHA_SECRETKEY: Joi.string(),
      INVISIBLE_RECAPTCHA_VERIRY_URL: Joi.string().default('https://www.google.com/recaptcha/api/siteverify'),

      ADMIN_EMAIL_ADDRESS: Joi.string(),
      CMS_GUI_URL: Joi.string(),

      FACEBOOK_APP_ID: Joi.string(),
      FACEBOOK_ACCOUNT_KIT_SECRET_ID: Joi.string(),
      ACCOUNT_KIT_ME_BASE_URL: Joi.string(),
      ACCOUNT_KIT_TOKEN_EXCHANGE_BASE_URL: Joi.string(),

      REDIS_HOST: Joi.string(),
      REDIS_PORT: Joi.string(),
      REDIS_PASSWORD: Joi.string(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(envConfig, envVarsSchema);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get env() {
    return {
      name: this.envConfig.NODE_ENV,
      domain: this.envConfig.DOMAIN,
      port: +this.envConfig.PORT,
      brandName: this.envConfig.BRAND_NAME
    };
  }

  get socketConfig() {
    return { host: this.envConfig.SOCKET_HOST };
  }

  get logging() {
    const logging = {
      name: this.envConfig.APP_LOGGER_NAME,
      path: this.envConfig.APP_LOGGER_PATH,
      rotatePeriod: +this.envConfig.APP_LOGGER_ROTATE_PERIOD,
      rotateKeepingCount: +this.envConfig.APP_LOGGER_ROTATE_KEEPING_COUNT,
      level: this.envConfig.APP_LOGGER_LEVEL,
      loggerType: +this.envConfig.APP_LOGGER_TYPE,
      logzIoApiToken: this.envConfig.LOGZIO_API_TOKEN,
    };
    return logging;
  }

  get dbConfig() {
    const config = {
      server: process.env.DB_SERVER || this.envConfig.DB_SERVER, // Refer config in process.env
      dbName: this.envConfig.DB_NAME,
    };

    return config;
  }

  get taskSchedulerConfig() {
    return {
      dbServer: this.dbConfig.server,
      dbName : this.dbConfig.dbName,
      collectionName: this.envConfig.TASK_SCHEDULER_COLLECTION_NAME,
    };
  }

  get authentication() {
    return {
      tokenExpireIn: this.envConfig.AUTH_TOKEN_EXPIRES_IN,
      resetPassTokenExpireIn: this.envConfig.RESET_PASS_TOKEN_EXPIRES_IN,
      limitLoginAttempts: +this.envConfig.LIMIT_LOGIN_ATTEMPTS,
      jwtSecretKey: this.envConfig.JWT_SECRET_KEY,
      invisibleRecaptcha: {
        secretKey: this.envConfig.INVISIBLE_RECAPTCHA_SECRETKEY,
        verifyUrl: this.envConfig.INVISIBLE_RECAPTCHA_VERIRY_URL
      }
    };
  }

  get facebookAppConfig() {
    return {
      appId: this.envConfig.FACEBOOK_APP_ID,
    };
  }

  get facebookAccountKit() {
    return {
      secretId: this.envConfig.FACEBOOK_ACCOUNT_KIT_SECRET_ID,
      meBaseUrl: this.envConfig.ACCOUNT_KIT_ME_BASE_URL,
      tokenExchangeBaseUrl: this.envConfig.ACCOUNT_KIT_TOKEN_EXCHANGE_BASE_URL,
      graphGetInfoUrl: this.envConfig.FACEBOOK_GRAPH_GET_INFO_URL,
    };
  }

  get adminConfig() {
    return {
      email: this.envConfig.ADMIN_EMAIL_ADDRESS,
      cmsGuiUrl: process.env.CMS_GUI_URL || this.envConfig.CMS_GUI_URL
    };
  }

  get jobConfig() {
    return {
      timeout: this.envConfig.IPOS_JOB_TIMEOUT,
      retryTimes: this.envConfig.IPOS_JOB_RETRY_TIMES,
    };
  }

  get redisConfig() {
    return {
      redis: {
        port: process.env.REDIS_PORT || this.envConfig.REDIS_PORT, // Refer config in process.env
        host: process.env.REDIS_HOST || this.envConfig.REDIS_HOST, // Refer config in process.env
        auth: process.env.REDIS_PASSWORD || this.envConfig.REDIS_PASSWORD, // Refer config in process.env
        db: this.envConfig.IPOS_JOB_REDIS_DB, // if provided select a non-default redis db}
      }
    };
  }
}
