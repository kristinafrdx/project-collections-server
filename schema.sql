CREATE DATABASE coll;
USE coll;

CREATE TABLE collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  topic TEXT
);

CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tag TEXT
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  admin BOOLEAN DEFAULT false
);

INSERT INTO users (login, password, admin)
VALUES ('admin', 'admin', true);

INSERT INTO collections (name, description, topic)
VALUES ('nameCollection', 'test', 'test');

INSERT INTO items (name, tag)
VALUES ('item1', 'test');
