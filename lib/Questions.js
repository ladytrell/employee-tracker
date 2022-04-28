module.exports = {
    employeeQuestions: [
        {
            type: 'input',
            name: 'name',
            message: 'Name:  ',
            validate: function(answer) {
                if(answer.length > 0) return true;
                return 'Please enter a name? '
            }
        },
        {
            type: 'input',
            name: 'Id',
            message: 'Employee Id number:  ',
            validate: function(answer) {
                if(answer.length > 0) return true;
                return 'Please enter an Id? '
            }
        },
        {
            type: 'input',
            name: 'email',
            message: 'Email address:  ',
            validate: function(answer) {
                if(answer.length > 0) return true;
                return 'Please enter your Id? '
            }
        }
    ]
}// End module.exports