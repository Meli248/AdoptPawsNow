import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../database/index.js')).default;
const Notification = (await import('../models/Notification.js')).default;

jest.spyOn(pool, 'query');

describe('Notification Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findByUserId should return user notifications', async () => {
        const mockNotifs = [{ notification_id: 1, message: 'Test Notif' }];
        pool.query.mockResolvedValueOnce({ rows: mockNotifs });

        const result = await Notification.findByUserId(10);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM notifications'),
            [10, 50]
        );
        expect(result).toEqual(mockNotifs);
    });

    it('markAsRead should update notification as read', async () => {
        const mockNotif = { notification_id: 1, is_read: true };
        pool.query.mockResolvedValueOnce({ rows: [mockNotif] });

        const result = await Notification.markAsRead(1, 10);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE notifications'),
            [1, 10]
        );
        expect(result).toEqual(mockNotif);
    });
});
