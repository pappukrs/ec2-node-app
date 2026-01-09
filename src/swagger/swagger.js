const swaggerJSDoc = require('swagger-jsdoc');
const config = require('../config');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Full Stack API',
    version: '1.0.0',
    description: 'Production-ready backend API with JWT authentication',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: config.server.isProduction
        ? 'https://api.yourdomain.com'
        : `http://localhost:${config.server.port}`,
      description: config.server.isProduction ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User unique identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          bio: {
            type: 'string',
            description: 'User biography'
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            description: 'User avatar URL'
          },
          phone: {
            type: 'string',
            description: 'User phone number'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'User date of birth'
          },
          address: {
            $ref: '#/components/schemas/Address'
          },
          preferences: {
            type: 'object',
            description: 'User preferences'
          },
          emailVerified: {
            type: 'boolean',
            description: 'Email verification status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          }
        }
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          country: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 1,
            description: 'User password'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password (minimum 6 characters)'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          bio: { type: 'string' },
          phone: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          address: { $ref: '#/components/schemas/Address' },
          preferences: { type: 'object' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            description: 'Current password'
          },
          newPassword: {
            type: 'string',
            minLength: 6,
            description: 'New password (minimum 6 characters)'
          }
        }
      },
      DeleteAccountRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: {
            type: 'string',
            description: 'Current password for confirmation'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: {
            type: 'string',
            description: 'JWT access token'
          }
        }
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'New JWT access token'
          }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Response message'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['OK'],
            description: 'Service status'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Current timestamp'
          },
          environment: {
            type: 'string',
            description: 'Environment name'
          },
          version: {
            type: 'string',
            description: 'API version'
          }
        }
      },
      UsersSearchResponse: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User'
            }
          },
          limit: {
            type: 'integer',
            description: 'Number of results per page'
          },
          offset: {
            type: 'integer',
            description: 'Pagination offset'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./src/auth/auth.routes.js', './src/user/user.routes.js', './src/app.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
