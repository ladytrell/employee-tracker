module.exports = {
    menu: [
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?\n',
            choices: ['Add a department']            
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
    ]/*,
        {
            type: 'input',
            name: 'email',
            message: 'Email address:  ',
            validate: function(answer) {
                if(answer.length > 0) return true;
                return 'Please enter your Id? '
            }
        }
    ]*/
}// End module.exports