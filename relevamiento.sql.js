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
		priority TEXT,
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
		answer_image BLOB NOT NULL,
		answer_text TEXT NOT NULL,
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

stms.push(`INSERT INTO user(email, name, username, password, lastSync) values ('luis@unmail.com', 'Luis Juan', 'ljuan', 'robi123', '2019/01/16');`);

export default {
	SCHEMA: stms
}