const Department = require('../lib/classes/Department');

describe('Department class', () => {
  describe('Initialization', () => {
    it("should create an object with 'name'", () => {
      //Create an Department
       const department = new Department('Human Resources');

      expect(department.name).toEqual('Human Resources'); 
      expect(department.id).toEqual(null); 
    });
  });

  describe('getName', () => {
    it('return Department name', () => {
       const department = new Department('Human Resources');
      let name = department.getName();

      expect(name).toEqual('Human Resources');
    });
  });
  
  describe('getId', () => {
    it('return Department ID number', () => {
       const department = new Department('Human Resources', 1);
      let id = department.getId();

      expect(id).toEqual(1);
    });
  });  
});

