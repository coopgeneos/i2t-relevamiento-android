var stms = [];
stms.push(`
	CREATE TABLE if not exists User (
		id INTEGER PRIMARY KEY,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		--phone TEXT NOT NULL,
		email TEXT NOT NULL,
		name TEXT NOT NULL,
		username TEXT NOT NULL,
		password TEXT NOT NULL,
		lastSync TEXT,
		lastUpload TEXT,
		lastDownload TEXT
	);`);

stms.push(`
	CREATE TABLE if not exists Contact (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		user_id INTEGER,
		user_uuid TEXT,
		name TEXT,
		description TEXT,
		address TEXT,
		city TEXT,
		zipCode TEXT,
		phone TEXT,
		email TEXT,
		hours TEXT,
		latitude REAL,
		longitude REAL,
		state INTEGER NOT NULL,
		FOREIGN KEY(user_id) REFERENCES User(id),
		FOREIGN KEY(user_uuid) REFERENCES User(uuid)
	);`);

stms.push(`
	CREATE TABLE if not exists ActivityType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		description TEXT NOT NULL,
		short_name TEXT NOT NULL,
		state INTEGER NOT NULL
	);`);

stms.push(`
	CREATE TABLE if not exists ItemActType (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		activityType_id INTEGER,
		activityType_uuid TEXT,
		type TEXT NOT NULL,
		description TEXT NOT NULL,
		required INTEGER NOT NULL,
		reference TEXT,
		position INTEGER,
		state INTEGER,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(activityType_uuid) REFERENCES ActivityType(uuid)
	);`);

	stms.push(`
		CREATE TABLE if not exists ListItemAct (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			uuid TEXT UNIQUE,
			updated TEXT NOT NULL,
			reference TEXT NOT NULL,
			code TEXT NOT NULL, 
			value TEXT NOT NULL,
			position INTEGER,
			state INTEGER,
			account_id TEXT
		);`);

stms.push(`
	CREATE TABLE if not exists Activity (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		activityType_id INTEGER,
		activityType_uuid TEXT,
		contact_id INTEGER,
		contact_uuid TEXT,
		name TEXT NOT NULL,
		description TEXT NOT NULL,
		priority TEXT,
		planned_date TEXT,
		exec_date TEXT,
		status TEXT NOT NULL,
		state INTEGER NOT NULL,
		cancellation TEXT,
		notes TEXT,
		percent REAL NOT NULL,
		FOREIGN KEY(activityType_id) REFERENCES ActivityType(id),
		FOREIGN KEY(activityType_uuid) REFERENCES ActivityType(uuid),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(contact_uuid) REFERENCES Contact(uuid)
	);`);

stms.push(`
	CREATE TABLE if not exists Configuration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		updated TEXT NOT NULL,
		key TEXT NOT NULL UNIQUE,
		value TEXT
	);`);

stms.push(`
	CREATE TABLE if not exists Answer (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		uuid TEXT UNIQUE,
		updated TEXT NOT NULL,
		activity_id INTEGER,
		activity_uuid TEXT,
		itemActType_id INTEGER,
		itemActType_uuid TEXT,
		contact_id INTEGER,
		contact_uuid TEXT,
		type TEXT NOT NULL,
		text_val TEXT,
		img_val BLOB,
		img_val_change INTEGER,
		img_condition INTEGER,
		img_url TEXT,
		number_val REAL,
		latitude REAL,
		longitude REAL,
		FOREIGN KEY(activity_id) REFERENCES Activity(id),
		FOREIGN KEY(activity_uuid) REFERENCES Activity(uuid),
		FOREIGN KEY(itemActType_id) REFERENCES ItemActType(id),
		FOREIGN KEY(itemActType_uuid) REFERENCES ItemActType(uuid),
		FOREIGN KEY(contact_id) REFERENCES Contact(id),
		FOREIGN KEY(contact_uuid) REFERENCES Contact(uuid)
	);`);

// stms.push(`INSERT INTO User (id, email, name, username, password, lastSync, lastDownload, lastUpload, updated) 
// 	values (1, 'user@notmail.com', 'not Identified', 'user', 'password', '2000/01/01 00:00:01', '2000/01/01 00:00:01', '2000/01/01 00:00:01', '${new Date().toString()}');`);

stms.push(`INSERT INTO User (id, email, name, username, password, lastSync, lastDownload, lastUpload, updated) 
	values (1, 'aenrico@unmail.com', 'Adrian Enrico', 'aenrico', '1q2w', '2000/01/01 00:00:01', '2000/01/01 00:00:01', '2000/01/01 00:00:01', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('USER_NAME', 'Adrian Enrico', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('USER_EMAIL', 'aenrico@unmail.com', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('URL_BACKEND', 'http://relevamiento.i2tsa.com.ar:3007', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('USER_BACKEND', 'aenrico', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('PASS_BACKEND', '1q2w', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('PROXIMITY_RANGE', '1000', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('SHIPMENTS_SHOW', '10', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('PROJECTION_AGENDA', '15', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('CONSULTANT_NUM', '13', '${new Date().toString()}');`);
stms.push(`INSERT INTO Configuration (key, value, updated) values ('HISTORY_SIZE', 5, '${new Date().toString()}');`);

// stms.push(`INSERT INTO Answer(updated) values ('3000/01/01 00:00:01')`);
// stms.push(`UPDATE sqlite_sequence SET seq = 1000000 WHERE name = 'Answer'`);
// stms.push(`DELETE FROM Answer where updated = '3000/01/01 00:00:01'`);

stms.push(`commit;`);

export default {
	SCHEMA: stms
}