import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: jest.fn(),
        on: jest.fn(),
    };
    return { default: { Pool: jest.fn(() => mPool) }, Pool: jest.fn(() => mPool) };
});

const pool = (await import('../src/database/index.js')).default;
const Pet = (await import('../src/models/Pet.js')).default;

jest.spyOn(pool, 'query');

describe('Pet Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('findAll should query pets matching filters', async () => {
        const mockPets = [{ pet_id: 1, name: 'Fido', species: 'Dog' }];
        pool.query.mockResolvedValueOnce({ rows: mockPets });

        const filters = { species: 'Dog', status: 'available' };
        const result = await Pet.findAll(filters);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('WHERE LOWER(status) = LOWER($1) AND species = $2'),
            ['available', 'Dog']
        );
        expect(result.rows).toEqual(mockPets);
        expect(result.count).toBe(1);
    });

    it('delete should remove a pet belonging to a specific user', async () => {
        const deletedMock = { pet_id: 5 };
        pool.query.mockResolvedValueOnce({ rows: [deletedMock] });

        const result = await Pet.delete(5, 10); // Pet 5, User 10

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM pets WHERE pet_id = $1 AND user_id = $2'),
            [5, 10]
        );
        expect(result).toEqual(deletedMock);
    });
});
