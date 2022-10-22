const inquirer = require("inquirer")
const db = require("./config/connection")
const { printTable } = require("console-table-printer")

// run the menu on start
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
    // grab all departments
    db.query("select * from department", (err, data) => {
        printTable(data)
        menu()
    })
}

function viewRoles() {
    // grab all roles
    db.query("select * from role", (err, data) => {
        printTable(data)
        menu()
    })
}

function viewEmployees() {
    // grab employee information and replace id's with names
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
LEFT JOIN employee as mgr ON employee.manager_id =  mgr.id
`, (err, data) => {
        printTable(data)
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
        // prompt questions to add a department, then query to add
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

        // prompt questions to add a role, then query to add
        inquirer.prompt(roleAddQuestions).then(role => {
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
    // query to get roles as names
    db.query("select title as name, id as value from role", (er, roleData) => {
        db.query(`select CONCAT(first_name, " " , last_name) as name,  id as value from employee`, (err, managerData) => {
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
                    name: "manager_id",
                    message: "Who is the employee's manager?",
                    choices: managerData
                }
            ]

            // prompt questions to add employee
            inquirer.prompt(employeeAddQuestions).then(employee => {
                // create new employee with the selected manager
                let newEmp = {
                    first_name:employee.first_name,
                    last_name:employee.last_name,
                    role_id:employee.role_id,
                    manager_id:employee.manager_id
                }

                // add it
                db.query('INSERT INTO employee SET ?', newEmp, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log(newEmp)
                        console.log('added employee!')
                        viewEmployees()
                    }
                })
            })
            })
        }
    )
}

function updateEmployeeRole() {
    // query to get employee names
    db.query(`select CONCAT(first_name, " ", last_name) as name, id as value from employee`, (err, employeeData) => {
        // query to get role names
        db.query("select title as name, id as value from role", (err, roleData) => {
            // prompt name and role
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'id',
                    message: 'What employee do you want to update?',
                    choices: employeeData
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'What role should the employee be updated to?',
                    choices: roleData
                }])
                .then(employee => {
                    let newRole = {
                        role_id: employee.role_id
                    }
                    // then query to update employee
                    db.query(`UPDATE employee SET ? WHERE id=${employee.id}`, newRole, err => {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            console.log('updated employee!')
                            viewEmployees()
                        }
                    })
                })
        })
    })
}