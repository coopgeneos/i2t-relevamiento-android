CREATE TABLE User (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL,
	name TEXT NOT NULL,
	username TEXT NOT NULL,
	password TEXT NOT NULL
);

CREATE TABLE Contact (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	description TEXT,
	address TEXT,
	phone TEXT,
	email TEXT,
	hours TEXT,
	latitude REAL,
	longitude REAL,
);

CREATE TABLE Schedule (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT,
	priority TEXT,
	planned_date TEXT,
	observations TEXT,
	state TEXT,
	exec_date TEXT,
	cancellation TEXT,
	track INTEGER
);

CREATE TABLE Survey (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	
);

INSERT INTO user(email, name, username, password) values ('roberto@unmail.com', 'Roberto Perez', 'robperez', 'robi123');
INSERT INTO user(email, name, username, password) values ('luis@unmail.com', 'Luis Juan', 'ljuan', 'robi123');
