class Employee {
    constructor(first_name, last_name, role_id, manager_id, id = null) {
        this.first_name = first_name; 
        this.last_name = last_name; 
        this.id = id; 
        this.role_id = role_id;
        this.manager_id = manager_id;
    }

    getFirstName() {
        return this.first_name;
    }

    getLastName() {
        return this.last_name;
    }

    getId() {
        return this.id;
    }

    getRoleID() {
        return this.role_id;
    }

    getManagerID() {
        return this.manager_id;
    }

    setID(ID) {
        this.id = ID;
    }
}

module.exports = Employee;