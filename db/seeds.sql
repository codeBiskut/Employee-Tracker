USE employee_db;

INSERT INTO department (name)
VALUES
    ("Sales"),
    ("Engineering"),
    ("Finance"),
    ("Legal");
INSERT INTO role (title, salary, department_id)
VALUES
    ("Sales Lead", 100000, 1),
    ("Senior Engineer", 110000, 2),
    ("Accountant", 120000, 3),
    ("Paralegal", 40000, 4);
INSERT INTO employee (first_name, last_name, role_id)
VALUES
    ("Joshua", "Rinehart", 2),
    ("Brian", "Baker", 3),
    ("Whimsy", "Flimsy", 1),
    ("Chris", "Colada", 4);

UPDATE employee SET manager_id=1 WHERE id=2;