var stms = [];
stms.push(`
	CREATE TABLE if not exists User (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		username TEXT NOT NULL,
		password TEXT NOT NULL,
		lastSync TEXT
	);`);

stms.push(`
	CREATE TABLE if not exists Contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		user_id INTEGER,
		user_uuid TEXT,
		name TEXT,
		address TEXT,
		city TEXT,
		zipCode TEXT,
		phone TEXT,
		email TEXT,
		hours TEXT,
		latitude REAL,
		longitude REAL,
		FOREIGN KEY(user_id) REFERENCES User(id),
		FOREIGN KEY(user_uuid) REFERENCES User(uuid)
	);`);

/* stms.push(`
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
	);`); */

stms.push(`
	CREATE TABLE if not exists ActivityType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		description TEXT NOT NULL
	);`);

stms.push(`
	CREATE TABLE if not exists ItemActType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		activityType_id INTEGER,
		activityType_uuid TEXT,
		type TEXT NOT NULL,
		description TEXT NOT NULL,
		required TEXT NOT NULL,
		reference TEXT,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(activityType_uuid) REFERENCES ActivityType(uuid)
	);`);

/* stms.push(`
	CREATE TABLE if not exists ListItemAct (
		id TEXT PRIMARY KEY,
		itemActType_id INTEGER NOT NULL,
		value TEXT NOT NULL,
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id)
	);`); */

	stms.push(`
		CREATE TABLE if not exists ListItemAct (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			uuid TEXT UNIQUE,
			reference TEXT NOT NULL,
			value TEXT NOT NULL
		);`);

/* stms.push(`
	CREATE TABLE if not exists Activity (
		id TEXT PRIMARY KEY,
		schedule_id INTEGER NOT NULL,
		activityType_id TEXT NOT NULL,
		contact_id TEXT NOT NULL,
		state TEXT NOT NULL,
		cancellation TEXT,
		notes TEXT,
		percent REAL NOT NULL,
		FOREIGN KEY(schedule_id) REFERENCES Schedule(id),
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id)
	);`); */

stms.push(`
	CREATE TABLE if not exists Activity (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		activityType_id INTEGER,
		activityType_uuid TEXT,
		contact_id INTEGER,
		contact_uuid TEXT,
		description TEXT NOT NULL,
		priority INTEGER,
		planned_date TEXT,
		exec_date TEXT,
		state TEXT NOT NULL,
		cancellation TEXT,
		notes TEXT,
		percent REAL NOT NULL,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(activityType_uuid) REFERENCES ActivityType(uuid),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(contact_uuid) REFERENCES Contact(uuid)
	);`);

/* stms.push(`
	CREATE TABLE if not exists Contact_ActType (
		contact_id INTEGER NOT NULL,
		activity_id INTEGER NOT NULL,
		PRIMARY KEY (contact_id, activity_id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(activity_id) REFERENCES Activity(id)
	);`); */

stms.push(`
	CREATE TABLE if not exists Configuration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL,
		value TEXT
	);`);

stms.push(`
	CREATE TABLE if not exists Answer (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		activity_id INTEGER,
		activity_uuid TEXT,
		itemActType_id INTEGER,
		itemActType_uuid TEXT,
		text_val TEXT,
		img_val BLOB,
		FOREIGN KEY(activity_id) REFERENCES Activity(id),
		FOREIGN KEY(activity_uuid) REFERENCES Activity(uuid),
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id),
		FOREIGN KEY(itemActType_uuid) REFERENCES ItemActType(uuid)
	);`);

stms.push(`INSERT INTO User (email, name, username, password, lastSync) 
	values ('aenrico@unmail.com', 'Luis Enrico', 'aenrico', 'robi123', '2019/01/16');`);

/* stms.push(`INSERT INTO Contact(id, user_id, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values ('cc45bc93-77b3-08f4-8911-5c745233212f', 1, 'Jose Suarez (Dueño)', 'Buzon 456', 'Tandil', '7000', '2494875465', 'jsuarez@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, uuid, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (1, 'werr', 'Mario Ferreyra (Dueño)', 'Paz 440', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, uuid, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (1, 'wegr35h', 'Fernando Alvareda (Dueño)', 'Paz 440', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -33.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Contact(user_id, uuid, name, address, city, zipCode, phone, email, 
	hours, latitude, longitude) 
	values (1, 'asfef45g','Juan Perez (Dueño)', 'España 100', 'Tandil', '7000', '2494875465', 'mf@unmail.com', 
	'8 a 16 hs', -37.3214476 , -59.1179599);`);

stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 1,'Comun', 1, '2019/03/06', '', 'Sin visitar', '2019/03/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 3,'Comun', 1, '2019/03/06', '', 'Sin visitar', '2019/06/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 2,'Comun', 2, '2019/03/12', '', 'Sin visitar', '2019/06/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 2,'Comun', 2, '2019/03/06', '', 'Sin visitar', '2019/07/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, 
	observations, state, exec_date, latitude, longitude)
	values (1, 4,'Comun', 1, '2019/04/06', '', 'Sin visitar', '2019/08/10', -35.353535, -59.125458);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date,
	observations, state, exec_date, latitude, longitude)
	values (1, 4,'Comun', 2, '2019/04/06', '', 'Sin visitar', '2019/08/10', -35.353535, -59.125458);`);


stms.push(`INSERT INTO ActivityType (uuid, description) values ('sdf45hh', 'Relevamiento fotográfico');`);
stms.push(`INSERT INTO ActivityType (uuid, description) values ('vfwe678ihg', 'Encuesta de calidad');`);
stms.push(`INSERT INTO ItemActType (uuid, activityType_id, description, type, required) values ('asfas09dg', 1, 'Imagen del exterior', 'imagen', 1);`);
stms.push(`INSERT INTO ItemActType (uuid, activityType_id, description, type, required) values ('dfjsrth564yr', 1, 'Imagen del interior', 'imagen', 0);`);
stms.push(`INSERT INTO ItemActType (uuid, activityType_id, description, type, required) values ('dfgsg98g97f7g', 2, 'Uso del display', 'lista', 1);`);

stms.push(`INSERT INTO ListItemAct (uuid, itemActType_id, value) values ('sdf', 3, 'No usa');`);
stms.push(`INSERT INTO ListItemAct (uuid, itemActType_id, value) values ('aergqer', 3, 'Usa el de CAS');`);
stms.push(`INSERT INTO ListItemAct (uuid, itemActType_id, value) values ('wr3raw', 3, 'Usa uno propio');`);

stms.push(`INSERT INTO ItemActType (uuid, activityType_id, description, type, required) values ('rthtrh', 1, 'Detalles', 'texto', 0);`);
stms.push(`INSERT INTO ItemActType (uuid, activityType_id, description, type, required) values ('3wet43', 1, 'Ingrese Metros Cuadrados', 'numerico', 0);`);


stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
values (1, 1, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
values (1, 1, 2, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
values (2, 3, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
values (3, 2, 2, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent) 
values (4, 2, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent)
values (5, 4, 1, 'new', 0.0);`);
stms.push(`INSERT INTO Activity (schedule_id, contact_id, activityType_id, state, percent)
values (6, 4, 2, 'new', 0.0);`) ;*/

stms.push(`INSERT INTO Configuration (key, value) values ('USER_NAME', 'Adrian Enrico');`);
stms.push(`INSERT INTO Configuration (key, value) values ('USER_EMAIL', 'aenrico@unmail.com');`);
stms.push(`INSERT INTO Configuration (key, value) values ('URL_BACKEND', 'http://tstvar.i2tsa.com.ar:3006/');`);
stms.push(`INSERT INTO Configuration (key, value) values ('USER_BACKEND', 'aenrico');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PASS_BACKEND', '1q2w');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PROXIMITY_RANGE', '1000');`);
stms.push(`INSERT INTO Configuration (key, value) values ('SHIPMENTS_SHOW', '30');`);
stms.push(`INSERT INTO Configuration (key, value) values ('PROJECTION_AGENDA', '15');`);

stms.push(`commit;`);

export default {
	SCHEMA: stms
}