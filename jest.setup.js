const mongoose = require('mongoose');
require('dotenv').config();

// Mock MongoDB connection for tests
jest.mock('./src/config/database', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock Redis connection for tests
jest.mock('./src/config/cache', () => ({
    connectRedis: jest.fn().mockImplementation(() => Promise.resolve()),
    redisClient: {
        isOpen: true,
        connect: jest.fn().mockImplementation(() => Promise.resolve()),
        disconnect: jest.fn().mockImplementation(() => Promise.resolve()),
        set: jest.fn().mockImplementation(() => Promise.resolve()),
        get: jest.fn().mockImplementation(() => Promise.resolve()),
        del: jest.fn().mockImplementation(() => Promise.resolve()),
    },
    setCache: jest.fn().mockImplementation(() => Promise.resolve()),
    getCache: jest.fn().mockImplementation(() => Promise.resolve()),
    invalidateCache: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Setup and teardown for each test suite
beforeAll(async () => {
    // Use an in-memory MongoDB server for tests or mock connection
    process.env.NODE_ENV = 'test';
    // Since we're mocking the database connection, we don't need to actually connect
});

afterAll(async () => {
    // Clean up any resources
    await mongoose.connection.close();
}); 