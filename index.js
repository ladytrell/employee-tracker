
const { menu, departmentQuestions } = require('./lib/Questions');
const inquirer =  require('inquirer');
const Department = require('./lib/classes/Department');
const Roles = require('./lib/classes/Roles');
const Employee = require('./lib/classes/Employee');
const db = require('./config/connection');

class EmployeeTracker {
    constructor (){
        this.departments = [];
        this.roles = [];
        this.employees = [];
        
    }

    //Refactor TO DO: Load database content at app start
    loadDepartments() {

    }

    // Add a department
    async addDepartment () {        
        // Prompt for input
        const { name } = await inquirer.prompt(departmentQuestions);
        const department = new Department(name);
        this.departments.push(department);

        // Add Department to database        
        const sql = `INSERT INTO department (name)
        VALUES (?)`;
        const params = [name];
    
        // Write entry to the database
        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err.message, '\n');
                return;
            }
        });

        console.log(`Added ${name} to the database\n`);
    }

    // Add a role
    async addRole () {    
        // Get department selection options      
        const {rows: list} = await this.getTable('department', 'name'); 
        
        if(list.length == 0){
            console.log("Please add a department first.\n");
            return;
        }
        
        // Prompt for input
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
                    if(Number.isInteger(parseInt(answer))) return true;
                    return 'Please enter a numerical salary? '
                }
            }
        ]);

        // retrieve the department id
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
                console.log(err.message, '\n');
                return;
            }
        });

        console.log(`Added ${title} to the database\n`);
    }

    // Add a employee
    async addEmployee () {
        // Get role options
        const {rows} = await this.getTable('role');
        const list =[];

        // Add titles for array for use in inquirer prompts
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
                    if(answer.length > 0 && answer.search(/,/)) return true;
                    return 'Please enter a name in Last-name, First-name format\n'
                }
            },
            {
                type: 'input',
                name: 'manager',
                message: 'Manager ID:  ',
                validate: function(answer) {
                    if(Number.isInteger(parseInt(answer))) return true;
                    return 'Please enter the manager id number'
                }
            }
        ]);
        
        var role_id = null;
        rows.forEach (item => {
            if (item.title === roleName){
                role_id = item.id;
            }
        });           
        
        const [ last_name, first_name ] = name.split(',');

        const employee = new Employee(first_name, last_name, role_id, manager);
        this.employees.push(employee);

        // Add Employee to database   
        let sql;
        if (manager === undefined | manager === '') {
            sql = `INSERT INTO employee (last_name, first_name, role_id)
        VALUES (?,?,?)`;
        }  else {   
            sql = `INSERT INTO employee (last_name, first_name, role_id, manager_id)
        VALUES (?,?,?,?)`;
        }
        
        const params = [last_name, first_name, role_id, manager];
    
        db.query(sql, params, (err, result) => {
            if (err) {
                console.log(err.message, '\n');
                return;
            }
        });

        console.log(`Added ${last_name}, ${first_name} to the database\n`);
    }// End Add Employee

    // Get Single Department by name
    async getDepartment(name){
        return new Promise( (resolve, reject) => {
                    
            const sql = `SELECT * FROM department
            WHERE name = ?`;
            const params = name;

            db.query(sql, params, (err, rows) => {
                if (err) {
                    console.log(err.message, '\n');
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

    // Get Roles
    async getRoles(){
        return new Promise( (resolve, reject) => {
            // Add Depart to data base        
            const sql = `SELECT title FROM role`;
            
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err.message, '\n');
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

    // Update Employee role 
    async updateEmployeeRole(){
        // Retrieve current employees
        let rows  = await this.getTable('employee'); 
        let results = rows.rows;

        if(results.length == 0){
            console.log("Please add an employee first.\n");
            return;
        }

        const employeeList =[];
        results.forEach(element => {
            const tempStr = element.id + ' ' + element.name;
            employeeList.push(tempStr);
           }
        );

        // Retrieve current roles
        rows = await this.getTable('role'); 
        results = rows.rows;
        const roleList =[];

        results.forEach (element => {
            const tempStr = element.id + ' ' +  element.title;
            roleList.push(tempStr);
        });

        if(roleList.length == 0){
            console.log("Please add a role first.\n");
            return;
        }    
        
        // Prompt for user input
        const {employee, roleName} = await inquirer.prompt( [
            {
                type: 'list',
                name: 'employee',
                message: '\nSelect an employee\n',
                choices: employeeList            
            },
            {
                type: 'list',
                name: 'roleName',
                message: '\nSelect a role\n',
                choices: roleList            
            }
        ]);  
       
        const [employeeID, ...name ]= employee.split(' ');
        const [newRoleID, ...str2 ]= roleName.split(' ');

        // Update database
        return new Promise( (resolve, reject) => {
                
            const sql = `UPDATE employee
                        SET role_id=${newRoleID}
                        WHERE employee.id=${employeeID};`;

            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err.message, '\n');
                    return;
                } else {
                    resolve({
                        ok: true,
                        rows:  rows
                    }) 
                }
            })
        });
        
    }//End updateEmployeeRole
    
    // Print table content
    printTable (table, rows) {
          
        if(rows.length == 0) {
            console.log(`No ${table}s are present\n`)
            return;
        }             
        console.log('\n\n');
        console.table(rows);  
    }

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
                    console.log(err.message, '\n');
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

    // List and process menu options
    async menuPrompt () {
        let result;
        const { choice: answer } = await inquirer.prompt(menu);

        switch (answer) {
            case 'Add a department': await this.addDepartment();
                break;
            case  'Add a role': await this.addRole();
                break;
            case   'Add an employee': await this.addEmployee();
                break;
            case  'View all departments': 
                result = await this.getTable('department'); 
                this.printTable('department', result.rows);
                break;
            case  'View all roles': 
                result  = await this.getTable('role'); 
                this.printTable('role', result.rows);
                break;
            case  'View all employees': 
                result  = await this.getTable('employee'); 
                this.printTable('employee', result.rows);
                break;
            case   'Update an employee\'s role': 
                result = await this.updateEmployeeRole();
                if(result.ok)
                {
                    console.log('Employee Role Updated');
                }
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
tracker.init();
