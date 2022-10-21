const inquirer = require("inquirer")
const db = require("./config/connection")

// replace this with an npm package
require("console.table")

db.connect(() => {
    menu()
})

const menuQuestion = [
    {
        type: "list",
        name: "menu",
        message: "choose the following options:",
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"]
    }
]

function menu() {
    inquirer.prompt(menuQuestion)
        .then(response => {
            if (response.menu === "view all departments") {
                viewDepartments()
            }
            else if (response.menu === "view all roles") {
                viewRoles()
            }
            else if (response.menu === "view all employees") {
                viewEmployees()
            }
            else if (response.menu === "add a department") {
                addDepartment()
            }
            else if (response.menu === "add a role") {
                addRole()
            }
            else if (response.menu === "add an employee") {
                addEmployee()
            }
            else if (response.menu === "update an employee role") {
                updateEmployeeRole()
            }
        })
}

function viewDepartments() {
    db.query("select * from department", (err, data) => {
        console.table('\n', data)
        menu()
    })
}

function viewRoles() {
    db.query("select * from role", (err, data) => {
        console.table('\n', data)
        menu()
    })
}

function viewEmployees() {
    db.query(`
    SELECT 
employee.id,
employee.first_name,
employee.last_name,
role.title,
department.name as department,
role.salary,
CONCAT(mgr.first_name, " " , mgr.last_name) as manager
FROM employee
LEFT JOIN role ON role.id= employee.role_id
LEFT JOIN department ON role.department_id=department.id
LEFT JOIN employee as mgr ON employee.id =  mgr.manager_id
`, (err, data) => {
        console.table('\n', data)
        menu()
    })
}

function addDepartment() {
    const departmentAddQuestions = [
        {
            type: "input",
            name: "name",
            message: "What is the name of the department you would like to add?"

        }
    ]

    inquirer.prompt(departmentAddQuestions).then(response => {
        db.query('INSERT INTO department SET ?', response, err => {
            if (err) {
                console.log(err)
            }
            else {
                console.log('added department!')
            }
            viewDepartments();
        })
    })
}

function addRole() {
    db.query('select name as name, id as value from department', (err, departmentData) => {
        const roleAddQuestions = [
            {
                type: "input",
                name: "title",
                message: "What is the title of the role you would like to add?"

            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role you would like to add?"
            },
            {
                type: "list",
                name: "department_id",
                message: "What is the department of the role you would like to add?",
                choices: departmentData
            }
        ]

        inquirer.prompt(roleAddQuestions).then(role => {
            // const parameters = [role.title, role.salary, role.department_id]
            db.query('INSERT INTO role SET ?', role, err => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log('added role!')
                    viewRoles();
                }
            })
        })
    }
    )
}

function addEmployee() {
    db.query("select title as name, id as value from role", (er, roleData) => {

        const employeeAddQuestions = [
            {
                type: "input",
                name: "first_name",
                message: "What is your first name?",

            },
            {
                type: "input",
                name: "last_name",
                message: "What is your last name?",

            },
            {
                type: "list",
                name: "role_id",
                message: "Choose the following role title",
                choices: roleData
            },
            {
                type: "list",
                name: "managerBool",
                message: "Is the employee a manager?",
                choices: ['Yes', 'No']
            }
        ]

        inquirer.prompt(employeeAddQuestions).then(employee => {
            if (employee.managerBool === 'Yes') {
                delete employee.managerBool
                db.query("INSERT INTO employee SET ?", employee, err => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log(employee)
                        viewEmployees()
                    }
                })
            }
            else if (employee.managerBool === 'No') {
                db.query(`select CONCAT(first_name, " " , last_name) as name,  id as value from employee where manager_id is null `, (err, managerData) => {
                    inquirer.prompt([{
                        type: 'list',
                        name: 'manager_id',
                        message: "What is the id of the employee's manager?",
                        choices: managerData
                    }])
                        .then(subordinate => {
                            delete employee.managerBool

                            let newEmp = {
                                ...employee,
                                ...subordinate
                            }

                            db.query('INSERT INTO employee SET ?', newEmp, (err) => {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    console.log(newEmp)
                                    viewEmployees()
                                }
                            })
                        })
                })
            }
        })
    })
}

function updateEmployeeRole() {

}