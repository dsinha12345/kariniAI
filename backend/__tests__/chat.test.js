// backend/__tests__/chat.test.js
const request = require('supertest');
const { app, connectDB, closeDB } = require('../server');

global.fetch = jest.fn();

// Connect to the database before running tests
beforeAll(async () => {
    await connectDB();
});

// Close the database connection after tests are done
afterAll(async () => {
    await closeDB();
    jest.restoreAllMocks(); // Restore original fetch implementation
});

// Clear mocks before each test
beforeEach(() => {
    fetch.mockClear();
});

describe('Chat API', () => {
    describe('POST /api/chat/query', () => {
        it('should return 400 if message is missing', async () => {
            const res = await request(app)
                .post('/api/chat/query')
                .send({}); // No message
            expect(res.statusCode).toEqual(400);
            expect(res.body.response).toContain('Message is required');
        });

        it('should return 400 if message is empty', async () => {
            const res = await request(app)
                .post('/api/chat/query')
                .send({ message: '   ' }); // Empty message
            expect(res.statusCode).toEqual(400);
            expect(res.body.response).toContain('Message is required');
        });

        // Test successful response when OpenRouter API call succeeds
        it('should return AI response on successful query', async () => {
            const mockAiResponse = "This is a mock AI response.";
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    choices: [{ message: { content: mockAiResponse } }]
                }),
            });

            const userMessage = "Tell me about product X";
            const res = await request(app)
                .post('/api/chat/query')
                .send({ message: userMessage });

            expect(res.statusCode).toEqual(200);
            expect(res.body.response).toEqual(mockAiResponse);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        // Test error handling when OpenRouter API call fails
        it('should return 500 if OpenRouter API call fails', async () => {
            // Simulate a failed fetch response
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({ error: 'API error' }) // Simulate error payload
            });

            const userMessage = "Another question";
            const res = await request(app)
                .post('/api/chat/query')
                .send({ message: userMessage });

            expect(res.statusCode).toEqual(500);
            expect(res.body.response).toContain('Sorry, an error occurred');
            expect(res.body.response).toContain('OpenRouter API request failed: Internal Server Error');
            expect(fetch).toHaveBeenCalledTimes(1);
        });
        it('should return 500 if OpenRouter response format is unexpected', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ unexpected: 'data' }) // Missing choices/message
            });

            const userMessage = "A third question";
            const res = await request(app)
                .post('/api/chat/query')
                .send({ message: userMessage });

            expect(res.statusCode).toEqual(500);
            expect(res.body.response).toContain('Sorry, an error occurred');
            expect(res.body.response).toContain('Received an unexpected response format from the AI');
            expect(fetch).toHaveBeenCalledTimes(1);
        });

    });
});
