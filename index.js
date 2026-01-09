#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();

// Validate configuration
require('./src/config');

// Start the server
require('./src/server');
