
const { menu, departmentQuestions } = require('./lib/Questions');
const inquirer =  require('inquirer');
const Department = require('./lib/classes/Department');
const Roles = require('./lib/classes/Roles');
const Employee = require('./lib/classes/Employee');
const db = require('./config/connection');
const { get } = require('express/lib/request');

/*
To Dos

 Construct inquirer prompts
    •employee
        o	first_name
        o	last_name
        o	role
        o	manager
    Menu options: view all departments, 
        view all roles, 
        view all employees, 
        add an employee, 
        and update an employee role

    MySQL Queries
        view all roles, 
        view all employees, 
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
        this.employees = [];
        
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

    // Add a role
    async addRole () {          
        const {rows: list} = await this.getTable('department', 'name'); 
        console.log(list);
        if(!list){
            console.log("Please add a department first.\n");
            return;
        }
        
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

        const role = new Roles();
        this.roles.push(role);

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

    // Add a employee
    async addEmployee () {
        const {rows} = await this.getTable('role');
        const list =[];

        rows.forEach (item => list.push(item.title));

        if(!list){
            console.log("Please add a role first.\n");
            return;
        }
        
        const { name, roleName, manager } = await inquirer.prompt( [
            {
                type: 'list',
                name: 'roleName',
                message: '\nSelect a role\n',
                choices: list            
            },
            {
                type: 'input',
                name: 'name',
                message: 'Last Name, First Name:  :  ',
                validate: function(answer) {
                    if(answer.length > 0) return true;
                    return 'Please enter a name'
                }
            },
            {
                type: 'input',
                name: 'manager',
                message: 'Manager ID:  '
            }
        ]);
        
        var role_id = null;
        rows.forEach (item => {
            if (item.title === roleName){
                role_id = item.id;
            }
        });           
        
        const [ last_name, first_name ] = name.split(',');
        console.log('manager: ', manager);
        //console.log();        

        const employee = new Employee(first_name, last_name, role_id, manager);
        this.employees.push(employee);

        // Add Role to database   
        let sql;
        if (manager === undefined | manager === '') {
            sql = `INSERT INTO employee (last_name, first_name, role_id)
        VALUES (?,?,?)`;
        }  else {   
            sql = `INSERT INTO employee (last_name, first_name, role_id, manager_id)
        VALUES (?,?,?,?)`;
        }
        console.log('sql: ', sql);
        const params = [last_name, first_name, role_id, manager];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
        });

        console.log(`Added ${last_name}, ${first_name} to the database\n`);
    }// Add Employee

    // Get all table rows
    async getTable(name){
        return new Promise( (resolve, reject) => {
                    
            let sql;

            switch (name) {
                case 'department':  sql = `SELECT * FROM ${name}`;
                    break;
                case 'role':  sql = `SELECT ${name}.id, ${name}.title, ${name}.salary, department.name AS department
                                    FROM ${name}
                                    JOIN department ON ${name}.department_id=department.id;`;
                    break;
                default:    sql = `SELECT * FROM ${name}`;
            }

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

    // Get Single Department by name
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

    async getRoles(){
        return new Promise( (resolve, reject) => {
            // Add Depart to data base        
            const sql = `SELECT title FROM role`;
            
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
    }//End Role Names  

    // List and process menu options
    async menuPrompt () {
        let rows;
        const { choice: answer } = await inquirer.prompt(menu);

        switch (answer) {
            case 'Add a department': await this.addDepartment();
                break;
            case  'Add a role': await this.addRole();
                break;
            case   'Add an employee': await this.addEmployee();
                break;
            case  'View all departments': 
                rows = await this.getTable('department');                
                console.log('\n\n');
                console.table(rows.rows);                
                console.log('\n\nPress down arrow key to display menu');
                break;
            case  'View all roles': 
                rows = await this.getTable('role');                
                console.log('\n\n');
                console.table(rows.rows);                
                console.log('\n\nPress down arrow key to display menu');
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
