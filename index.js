const inquirer = require("inquirer")
const db = require("./config/connection")

// replace this with an npm package
require("console.table")

db.connect( () => {
    menu()
})

const menuQuestion = [
    {
        type:"list",
        name:"menu",
        message:"choose the following options:",
        choices:["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"]
    }
]

function menu(){
    inquirer.prompt(menuQuestion)
    .then(response => {
        if(response.menu === "view all departments"){
            viewDepartments()   
        }
        else if(response.menu === "view all roles"){
            viewRoles()
        }
        else if(response.menu === "view all employees"){
            viewEmployees()
        }
        else if(response.menu === "add a department"){
            addDepartment()
        }
        else if(response.menu === "add a role"){
            addRole()
        }
        else if(response.menu === "add an employee"){
            addEmployee()
        }
        else if(response.menu === "update an employee role"){
            updateEmployeeRole()
        }
    })
}

function viewDepartments(){
    db.query("select * from department", (err, data) => {
        console.table(data)
        menu()
    })
}

function viewRoles(){
    db.query("select * from role", (err, data) => {
        console.table(data)
        menu()
    })
}

function viewEmployees(){
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
    console.table(data)
    menu()
})
}

function addEmployee(){
    db.query("select title as name, id as value from role", (er, roleData)=>{

           db.query(`select CONCAT(first_name, " " , last_name) as name,  id as value from employee where  manager_id is null `, (err, managerData)=>{
            const employeeAddQuestions=[
                {
                    type:"input",
                    name:"first_name",
                    message:"What is your first name?",
            
                },
                {
                    type:"input",
                    name:"last_name",
                    message:"What is your first name?",
            
                },
                {
                    type:"list",
                    name:"role_id",
                    message:"Choose the following role title",
                    choices:roleData
                },{
                    type:"list",
                    name:"manager_id",
                    message:"Choose the following manager",
                    choices:managerData
                }
            
            ]
            inquirer.prompt(employeeAddQuestions).then(response=>{
                const parameters=[response.first_name,response.last_name,response.role_id, response.manager_id]
                db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id)VALUES(?,?,?,?)",parameters,(err, data)=>{

                    viewEmployees()
                })
            })
           })
    })
}