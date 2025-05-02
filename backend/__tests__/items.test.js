const request = require('supertest');
const { app, connectDB, closeDB } = require('../server'); // Adjust path as necessary

// Connect to the database before running tests
beforeAll(async () => {
    await connectDB();
});

// Close the database connection after tests are done
afterAll(async () => {
    await closeDB();
});

describe('Items API', () => {
    // Test for GET /api/items
    describe('GET /api/items', () => {
        it('should return all items as an array', async () => {
            const res = await request(app).get('/api/items');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            // Optionally, check if the array is not empty if you expect data
            // expect(res.body.length).toBeGreaterThan(0);
        });
    });

    // Test for GET /api/items/search
    describe('GET /api/items/search', () => {
        it('should return 400 if search query "q" is missing', async () => {
            const res = await request(app).get('/api/items/search');
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toEqual('Search query is required');
        });

        it('should return search results as an array when query "q" is provided', async () => {
            // Replace 'testQuery' with a term likely to exist in your data for a better test
            const searchQuery = 'testQuery';
            const res = await request(app).get(`/api/items/search?q=${searchQuery}`);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            // You might add more specific checks based on expected search results
        });

        it('should return an empty array if search query yields no results', async () => {
            const searchQuery = 'aVeryUnlikelyQueryStringXYZ123'; // Use a query unlikely to match
            const res = await request(app).get(`/api/items/search?q=${searchQuery}`);
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toEqual(0); // Expecting no results
        });
    });
});
