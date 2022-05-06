
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
    Menu options:     
        and update an employee role

    MySQL Queries  
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
        
        if(list.length == 0){
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

        if(list.length == 0){
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

    // Get all rows of a table 
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
                    
                case 'employee':  sql = `SELECT e.id, CONCAT (e.first_name, ' ', e.last_name) AS name, role.title AS title, department.name AS department, role.salary AS salary,
                                        CONCAT (m.first_name, ' ', m.last_name) AS manager
                                        FROM ${name} e
                                        JOIN ${name} m ON e.manager_id=m.id
                                        JOIN role ON e.role_id=role.id
                                        JOIN department ON role.department_id=department.id`;
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
    }//End getTable

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

    // Get all rows of a table 
async updateEmployeeRole(){
        let rows  = await this.getTable('employee'); 
        const results = rows.rows;

        const list =[];
        results.forEach(element => {
            const tempStr = element.id + ' ' + element.name;
            list.push(tempStr);
           }
        )
        console.log(list);
        const {employee} = await inquirer.prompt( [
            {
                type: 'list',
                name: 'employee',
                message: '\nSelect an employee\n',
                choices: list            
            }
        ]);
        console.log(employee);
        const [id, ...name ]= employee.split(' ');
        console.log(id);

         /*   return new Promise( (resolve, reject) => {
                
            const sql = `SELECT e.id, CONCAT (e.first_name, ' ', e.last_name) AS name, role.title AS title, department.name AS department, role.salary AS salary,
                                        CONCAT (m.first_name, ' ', m.last_name) AS manager
                                        FROM ${name} e
                                        JOIN ${name} m ON e.manager_id=m.id
                                        JOIN role ON e.role_id=role.id
                                        JOIN department ON role.department_id=department.id`;

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
            })*/
        
    }//End updateEmployeeRole
    
    printTable (table, rows) {
          
        if(rows.length == 0) {
            console.log(`No ${table}s are present\n`)
            return;
        }             
        console.log('\n\n');
        console.table(rows);  
    }

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
                this.printTable('department', rows.rows);
                break;
            case  'View all roles': 
                rows  = await this.getTable('role'); 
                this.printTable('role', rows.rows);
                break;
            case  'View all employees': 
                rows  = await this.getTable('employee'); 
                this.printTable('employee', rows.rows);
                break;
            case   'Update an employee\'s role': await this.updateEmployeeRole();
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
