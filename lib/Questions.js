

module.exports = {
    menu: [
        {
            type: 'list',
            name: 'choice',
            message: '\n\nWhat would you like to do?\n',
            pageSize: 8,
            choices: ['Add a department', 
            'Add a role', 
            'Add an employee', 
            'View all departments', 
            'View all roles', 
            'View all employees', 
            'Update an employee\'s role', 
            'Exit' ]            
        }
    ],
    departmentQuestions: [
        {
            type: 'input',
            name: 'name',
            message: 'Department name:  ',
            validate: function(answer) {
                if(answer.length > 0) return true;
                return 'Please enter a name? '
            }
        }
    ]
}// End module.exports