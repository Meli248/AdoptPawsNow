import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../src/database/index.js')).default;
const Post = (await import('../src/models/Post.js')).default;

jest.spyOn(pool, 'query');

describe('Post Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findAll should return all post applications', async () => {
        const mockPosts = [{ application_id: 1, pet_name: 'Fluffy' }];
        pool.query.mockResolvedValueOnce({ rows: mockPosts });

        const result = await Post.findAll({});
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT s.*, u.full_name'),
            []
        );
        expect(result).toEqual(mockPosts);
    });

    it('create should insert a new post application', async () => {
        const mockPost = { application_id: 2, pet_name: 'Max' };
        pool.query.mockResolvedValueOnce({ rows: [mockPost] });

        const result = await Post.create({
            userId: 1, pet_name: 'Max', pet_type: 'Dog', breed: 'Husky',
            age: '1 year', gender: 'Male', reason: 'Moving', image_url: '/img.jpg',
            contact_name: 'Test', contact_email: 'test@test.com', contact_phone: '1234', location: 'City'
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO post_applications'),
            expect.any(Array)
        );
        expect(result).toEqual(mockPost);
    });
});
