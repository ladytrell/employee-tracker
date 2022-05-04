
const { menu, departmentQuestions } = require('./lib/Questions');
const inquirer =  require('inquirer');
const Department = require('./lib/classes/Department');
const Roles = require('./lib/classes/Roles');
const db = require('./config/connection');
const { get } = require('express/lib/request');

/*
To Dos

Create Classes
        •employee
        o	id
        o	first_name
        o	last_name
        o	role_id
        o	manager_id

 Construct inquirer prompts
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
        view all roles, 
        view all employees, 
        add a role, 
        add an employee, 
        and update an employee role
*/

class EmployeeTracker {
    constructor (){
        this.departments = [];
       /* const {rows: list} = this.getDepartments()
        .then(() => {
            this.departments = list;
        });
        */
        this.roles = [];
        
    }

    // Add a department
    async addDepartment () {        
        const { name } = await inquirer.prompt(departmentQuestions);
        //console.log(name);
        const department = new Department(name);
        this.departments.push(department);

        // Add Department to database        
        const sql = `INSERT INTO department (name)
        VALUES (?)`;
        const params = [name];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
        });

        console.log(`Added ${name} to the database\n`);
    }

    async getDepartments(){
        return new Promise( (resolve, reject) => {
            // Add Depart to data base        
            const sql = `SELECT name FROM department`;

            db.query(sql, (err, rows) => {
                if (err) {
                    reject({ error: err.message });
                    return;
                } else {
                   resolve({
                        ok: true,
                        rows:  rows
                    }) 
                }
            })
        });
    }//End getDepartments

    async getDepartment(name){
        return new Promise( (resolve, reject) => {
            // Add Depart to data base        
            const sql = `SELECT * FROM department
            WHERE name = ?`;
            const params = name;

            db.query(sql, params, (err, rows) => {
                if (err) {
                    reject({ error: err.message });
                    return;
                } else {
                   resolve({
                        ok: true,
                        rows:  rows
                    }) 
                }
            })
        });
    }//End getDepartment

    // Add a role
    async addRole () {          
        const {rows: list} = await this.getDepartments(); 
        if(!list){
            console.log("Please add a department first.\n");
            return;
        }
        //console.log('127',list);
        const {department, title, salary} = await inquirer.prompt( [
            {
                type: 'list',
                name: 'department',
                message: '\nSelect a department\n',
                choices: list            
            },
            {
                type: 'input',
                name: 'title',
                message: 'Role title:  ',
                validate: function(answer) {
                    if(answer.length > 0) return true;
                    return 'Please enter a title? '
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Annual Salary:  ',
                validate: function(answer) {
                    if(answer.length > 0) return true;
                    return 'Please enter a salary? '
                }
            }
        ]);
        
        const {rows: departName} = await this.getDepartment(department);        
        const id = departName[0].id;
        
        // Add Role to database        
        const sql = `INSERT INTO role (title, salary, department_id)
        VALUES (?,?,?)`;
        const params = [title, salary, id];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
        });

        console.log(`Added ${title} to the database\n`);
    }

    // List and process menu options
    async menuPrompt () {
        const { choice: answer } = await inquirer.prompt(menu);

        switch (answer) {
            case 'Add a department': await this.addDepartment();
                break;
            case  'View all departments': 
                const rows = await this.getDepartments();                
                console.log('\n\n');
                console.table(rows.rows);                
                console.log('\n\nPress down arrow key to display menu');
                break;
            case  'Add a role': await this.addRole();
                break;
            default: process.exit();
        }
        return this.menuPrompt();
    }

    // Initialize application
    async init() {
        
        console.log("Welcome to Employee Tracker");
        await this.menuPrompt();
    }
}

// DB connection
db.connect(err => {
    if (err) throw err;
    //console.log('Database connected.');  
});
  
const tracker = new EmployeeTracker();
//console.log(tracker.departments);
tracker.init();
