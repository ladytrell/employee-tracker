class Roles {
    constructor(title, salary, department, id = null) {
        this.title = title; 
        this.id = id; 
        this.salary = salary;
        this.department = department;
    }

    getName() {
        return this.title;
    }

    getId() {
        return this.id;
    }

    getSalary() {
        return this.salary;
    }

    getDepartment() {
        return this.department;
    }
}

module.exports = Roles;