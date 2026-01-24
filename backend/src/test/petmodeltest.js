import sequelizeMock from 'sequelize-mock';

const dbMock = new sequelizeMock();

const PetMock = dbMock.define('Pet', {
  name: 'Buddy',
  age: 3,
  type: 'Dog'
});

describe("petmodeltest", () => {
  it("it should create a new pet", async () => {
    const pet = await PetMock.create({
      name: 'Rocky',
      age: 2,
      type: 'Dog'
    });

    expect(pet.name).toBe('Rocky');
    expect(pet.age).toBe(2);
    expect(pet.type).toBe('Dog');
  });
    it("it should find a pet by name", async () => {
        await expect(PetMock.create({})/rejects.toThrow());
    });
});
