DROP TABLE IF EXISTS products;

SELECT version();

-- Run this in your PostgreSQL query tool
SELECT current_database();

-- Run this in your PostgreSQL query tool
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

create table products
(
id SERIAL primary key,
name varchar(255) not null,
type varchar(255) not null,
price numeric(10,2) not null,
description text,
image_url text
);

SELECT *
FROM products