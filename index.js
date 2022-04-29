
const { menu, departmentQuestions } = require('./lib/Questions');
const inquirer =  require('inquirer');

/*
To Dos

Create Classes
    •role
        o	id
        o	title
        o	salary
        o	department_id
    •employee
        o	id
        o	first_name
        o	last_name
        o	role_id
        o	manager_id

 Construct inquirer prompts
    department
        o	name
    •role
        o	title
        o	salary
        o	department
    •employee
        o	first_name
        o	last_name
        o	role
        o	manager
    Menu options: view all departments, 
        view all roles, 
        view all employees, 
        add a department, 
        add a role, 
        add an employee, 
        and update an employee role

    MySQL Queries
        view all departments, 
        view all roles, 
        view all employees, 
        add a department, 
        add a role, 
        add an employee, 
        and update an employee role
*/

class EmployeeTracker {
    constructor (){
        this.departments = [];
    }

    async menuPrompt() {
        const answer = await inquirer.prompt(menu);
        console.log(answer);
    }

    init() {
        console.log("Welcome to Employee Tracker\n\n");
        await this.menuPrompt();
    }
}

const tracker = new EmployeeTracker();

tracker.init();