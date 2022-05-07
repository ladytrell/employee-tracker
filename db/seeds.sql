INSERT INTO department (name)
VALUES
  ('Human Resources'),
  ('Legal'),
  ('Finance'),
  ('Infomation Technology'),  
  ('Research and Development');

INSERT INTO role (title, salary, department_id)
VALUES
  ('Director', 150000, 1),
  ('Manager', 100000, 4);

INSERT INTO employee (last_name, first_name, role_id, manager_id)
VALUES
  ('Kent', 'Antrell', 1, 1),
  ('Doe', 'Jadyn', 2, 1);