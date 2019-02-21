var stms = [];
stms.push(`
	CREATE TABLE if not exists User (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		username TEXT NOT NULL,
		password TEXT NOT NULL,
		lastSync TEXT
	);`);
stms.push(`
	CREATE TABLE if not exists Contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		name TEXT,
		address TEXT,
		city TEXT,
		zipCode TEXT,
		phone TEXT,
		email TEXT,
		hours TEXT,
		latitude REAL,
		longitude REAL,
		FOREIGN KEY(user_id) REFERENCES User(id)
	);`);
stms.push(`
	CREATE TABLE if not exists Schedule (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		contact_id INTEGER,
		type TEXT,
		priority INTEGER,
		planned_date TEXT,
		observations TEXT,
		state TEXT,
		exec_date TEXT,
		cancellation TEXT,
		track INTEGER,
		latitude REAL,
		longitude REAL,
		FOREIGN KEY(user_id) REFERENCES User(id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id)
	);`);
stms.push(`
	CREATE TABLE if not exists ActivityType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		description TEXT NOT NULL
	);`);
stms.push(`
	CREATE TABLE if not exists ItemActType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		activityType_id INTEGER NOT NULL,
		type TEXT NOT NULL,
		description TEXT NOT NULL,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id)
	);`);
stms.push(`
	CREATE TABLE if not exists ListItemAct (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		itemActType_id INTEGER NOT NULL,
		value TEXT NOT NULL,
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id)
	);`);
stms.push(`
	CREATE TABLE if not exists Activity (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		schedule_id INTEGER NOT NULL,
		activityType_id INTEGER NOT NULL,
		contact_id INTEGER NOT NULL,
		state TEXT NOT NULL,
		cancellation TEXT,
		notes TEXT,
		percent REAL NOT NULL,
		FOREIGN KEY(schedule_id) REFERENCES Schedule(id),
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id)
	);`);
stms.push(`
	CREATE TABLE if not exists Contact_ActType (
		contact_id INTEGER NOT NULL,
		activity_id INTEGER NOT NULL,
		PRIMARY KEY (contact_id, activity_id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(activity_id) REFERENCES Activity(id)
	);`);
stms.push(`
	CREATE TABLE if not exists Configuration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL,
		value TEXT
	);`);
stms.push(`
	CREATE TABLE if not exists Answer (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		activity_id INTEGER NOT NULL,
		itemActType_id INTEGER NOT NULL,
		text_val TEXT,
		img_val BLOB,
		FOREIGN KEY(activity_id) REFERENCES Activity(id),
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id)
	);`);

stms.push(`INSERT INTO User(email, name, username, password, lastSync) 
	values ('luis@unmail.com', 'Luis Juan', 'ljuan', 'robi123', '2019/01/16');`);

stms.push(`INSERT INTO Contact(user_id, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (1, 'Jose Suarez (Dueño)', 'Buzon 456', 'Tandil', '7000', '2494875465', 'jsuarez@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (2, 'Mario Ferreyra (Dueño)', 'Paz 440', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (3, 'Fernando Alvareda (Dueño)', 'Paz 440', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -33.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (4, 'Mario Ferreyra (Dueño)', 'Paz 440', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);

stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 1,'Comun', 1, '2019/03/06', '', 'Sin visitar', '2019/03/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 2,'Comun', 1, '2019/03/06', '', 'Sin visitar', '2019/06/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 2,'Comun', 2, '2019/03/12', '', 'Sin visitar', '2019/06/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 2,'Comun', 2, '2019/03/06', '', 'Sin visitar', '2019/07/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 3,'Comun', 1, '2019/04/06', '', 'Sin visitar', '2019/08/10', -35.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 3,'Comun', 2, '2019/04/06', '', 'Sin visitar', '2019/08/10', -35.353535, -59.125458);`);

stms.push(`INSERT INTO ActivityType (description) values ('Relevamiento fotográfico');`);
stms.push(`INSERT INTO ActivityType (description) values ('Encuesta de calidad');`);
stms.push(`INSERT INTO ItemActType (activityType_id, description, type) values (1, 'Imagen del exterior', 'imagen');`);
stms.push(`INSERT INTO ItemActType (activityType_id, description, type) values (1, 'Imagen del interior', 'imagen');`);
stms.push(`INSERT INTO ItemActType (activityType_id, description, type) values (2, 'Uso del display', 'lista');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (3, 'No usa');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (3, 'Usa el de CAS');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (3, 'Usa uno propio');`);

stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, state, percent) 
values (1, 1, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, state, percent) 
values (2, 2, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, state, percent) 
values (3, 1, 2, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, state, percent) 
values (3, 2, 2, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, state, percent) 
values (3, 2, 2, 'new', 0.0);`);

stms.push(`INSERT INTO Answer (activity_id, itemActType_id, text_val) values (1, 3, 'Usa el de CAS');`);

stms.push(`INSERT INTO Configuration (key, value) values ('USER_NAME', 'Jose Suarez');`);
stms.push(`INSERT INTO Configuration (key, value) values ('USER_EMAIL', 'jsuarez@unmail.com');`);
stms.push(`INSERT INTO Configuration (key, value) values ('URL_BACKEND', 'http://www.server.com:8000');`);
stms.push(`INSERT INTO Configuration (key, value) values ('USER_BACKEND', 'jsuarez');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PASS_BACKEND', '12345678');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PROXIMITY_RANGE', '1000');`);
stms.push(`INSERT INTO Configuration (key, value) values ('SHIPMENTS_SHOW', '30');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PROJECTION_AGENDA', '15');`);

stms.push(`commit;`);

export default {
	SCHEMA: stms
}