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