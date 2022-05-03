
const { menu, departmentQuestions } = require('./lib/Questions');
const inquirer =  require('inquirer');
const Department = require('./lib/classes/Department');
const db = require('./config/connection');

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
        add a role, 
        add an employee, 
        and update an employee role

    MySQL Queries
        view all departments, 
        view all roles, 
        view all employees, 
        add a role, 
        add an employee, 
        and update an employee role
*/

class EmployeeTracker {
    constructor (){
        this.departments = [];
    }

    // Add a department
    async addDepartment () {        
        const { name }= await inquirer.prompt(departmentQuestions);
        console.log(name);
        const department = new Department(name);
        this.departments.push(department);

        // Add Depart to data base        
        const sql = `INSERT INTO department (name)
        VALUES (?)`;
        const params = [name];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            console.log(`Added ${name} to the database\n`);
        });

        return this.menuPrompt();
    }

    async viewDepartments(){
        // Add Depart to data base        
        const sql = `SELECT name FROM department`;

        db.query(sql, (err, rows) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            // Display as a table
            console.log('\n\n');
            //return console.log(rows);
            console.table(rows);
            //return console.table(rows);
            console.log('\n\n');
        });

        //return this.menuPrompt();
        //return await this.menuPrompt();
    }

    // List and process menu options
    async menuPrompt () {
        const { choice: answer } = await inquirer.prompt(menu);

        switch (answer) {
            case 'Add a department': await this.addDepartment();
                break;
            case  'View all departments': await this.viewDepartments();
                break;
            default: process.exit();
        }
        return this.menuPrompt();
    }

    // Initialize application
    async init() {
        console.log("Welcome to Employee Tracker\n\n");
        await this.menuPrompt();
    }
}

// DB connection
db.connect(err => {
    if (err) throw err;
    //console.log('Database connected.');  
});
  
const tracker = new EmployeeTracker();

tracker.init();