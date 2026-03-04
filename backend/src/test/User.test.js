import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../database/index.js')).default;
const User = (await import('../models/User.js')).default;

jest.spyOn(pool, 'query');

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findByEmail should find a user by their email address', async () => {
        const mockUser = { user_id: 1, email: 'test@example.com', role: 'user' };
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        const user = await User.findByEmail('test@example.com');

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT user_id, username, email'),
            ['test@example.com']
        );
        expect(user).toEqual(mockUser);
    });

    it('findById should return undefined if user is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const user = await User.findById(999);

        expect(pool.query).toHaveBeenCalled();
        expect(user).toBeUndefined();
    });

    it('create should insert new user data', async () => {
        const mockInsertedUser = { user_id: 2, username: 'johndoe' };
        pool.query.mockResolvedValueOnce({ rows: [mockInsertedUser] });

        const result = await User.create({
            username: 'johndoe',
            email: 'john@example.com',
            hashedPassword: 'hash',
            fullName: 'John Doe'
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO users'),
            ['johndoe', 'john@example.com', 'hash', 'John Doe', 'user']
        );
        expect(result).toEqual(mockInsertedUser);
    });
});
