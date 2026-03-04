import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../../database/index.js')).default;
const userController = await import('../../controller/user/userController.js');

jest.spyOn(pool, 'query');

describe('User Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { userId: 1 },
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getDashboardStats', () => {
        it('should return dashboard stats successfully', async () => {
            // Mock Pet.countByUserIdAndStatus for 'adopted' and 'available' and total
            pool.query
                .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // countByUserIdAndStatus missing status (total)
                .mockResolvedValueOnce({ rows: [{ post_id: 1 }] }) // postRequests
                .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // adoptedPets
                .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // availablePets

            await userController.getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    totalPosts: 3, // 2 petPostsCount + 1 postRequestsCount
                    adopted: 1,
                    missing: 0,
                    available: 1
                })
            }));
        });

        it('should handle internal server error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB Error'));

            await userController.getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Internal server error'
            }));
        });
    });

    describe('getUserPosts', () => {
        it('should return user posts successfully', async () => {
            const mockPosts = [{ pet_id: 1, name: 'Buddy' }];
            pool.query.mockResolvedValueOnce({ rows: mockPosts });

            await userController.getUserPosts(req, res);

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('FROM pets p'),
                [1]
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: mockPosts
            }));
        });
    });
});
