var stms = [];
stms.push(`
	CREATE TABLE User (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		username TEXT NOT NULL,
		password TEXT NOT NULL,
		lastSync TEXT
	);`);
stms.push(`
	CREATE TABLE Contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		description TEXT,
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
	CREATE TABLE Schedule (
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
	CREATE TABLE ActivityType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		description TEXT NOT NULL
	);`);
stms.push(`
	CREATE TABLE ItemActType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		activityType_id INTEGER NOT NULL,
		type TEXT NOT NULL,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id)
	);`);
stms.push(`
	CREATE TABLE ListItemAct (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		itemActType_id INTEGER NOT NULL,
		value TEXT NOT NULL,
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id)
	);`);
stms.push(`
	CREATE TABLE Activity (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		schedule_id INTEGER NOT NULL,
		activityType_id INTEGER NOT NULL,
		contact_id INTEGER NOT NULL,
		answer_image BLOB,
		answer_text TEXT,
		FOREIGN KEY(schedule_id) REFERENCES Schedule(id),
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id)
	);`);
stms.push(`
	CREATE TABLE Contact_ActType (
		contact_id INTEGER NOT NULL,
		activity_id INTEGER NOT NULL,
		PRIMARY KEY (contact_id, activity_id),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(activity_id) REFERENCES Activity(id)
	);`);
stms.push(`
	CREATE TABLE Configuration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		key TEXT NOT NULL,
		value TEXT
	);`);

stms.push(`INSERT INTO User(email, name, username, password, lastSync) values ('luis@unmail.com', 'Luis Juan', 'ljuan', 'robi123', '2019/01/16');`);
stms.push(`INSERT INTO Contact(user_id, description, address, city, zipCode, phone, email, hours, latitude, longitude) 
	values (1, 'Jose Suarez (Dueño)', 'Buzon 456', 'Tandil', '7000', '2494875465', 'jsuarez@unmail.com', '8 a 16 hs', -37.3214476 , -59.1179599);`);
stms.push(`INSERT INTO Schedule(user_id, contact_id, type, priority, planned_date, observations, state, exec_date, latitude, longitude)
	values (1, 1,'Comun', 2, '2019/03/06', '', 'Sin visitar', '2019/03/10', -37.353535, -59.125458);`);
stms.push(`INSERT INTO ActivityType (description) values ('Relevamiento fotográfico exterior');`);
stms.push(`INSERT INTO ActivityType (description) values ('Uso del display');`);
stms.push(`INSERT INTO ItemActType (activityType_id, type) values (1, 'imagen');`);
stms.push(`INSERT INTO ItemActType (activityType_id, type) values (1, 'lista');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (2, 'No usa');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (2, 'Usa el de CAS');`);
stms.push(`INSERT INTO ListItemAct (itemActType_id, value) values (2, 'Usa uno propio');`);
stms.push(`INSERT INTO Activity (schedule_id, activityType_id, contact_id, answer_text)
	values (1, 2, 1, 'Usa el de CAS');`);

export default {
	SCHEMA: stms
}