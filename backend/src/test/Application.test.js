import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../database/index.js')).default;
const Application = (await import('../models/Application.js')).default;

jest.spyOn(pool, 'query');

describe('Application Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('create should insert a new adoption application', async () => {
        const mockApp = { application_id: 1, pet_id: 5, applicant_name: 'Jane' };
        pool.query.mockResolvedValueOnce({ rows: [mockApp] });

        const result = await Application.create({
            pet_id: 5, applicant_name: 'Jane', email: 'jane@test.com',
            phone: '123', address: '123 St', reason: 'Love pets'
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO adoption_applications'),
            [5, 'Jane', 'jane@test.com', '123', '123 St', 'Love pets']
        );
        expect(result).toEqual(mockApp);
    });

    it('updateStatus should update application status', async () => {
        const mockApp = { application_id: 1, status: 'approved' };
        pool.query.mockResolvedValueOnce({ rows: [mockApp] });

        const result = await Application.updateStatus(1, 'approved');

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE adoption_applications'),
            ['approved', 1]
        );
        expect(result).toEqual(mockApp);
    });
});
