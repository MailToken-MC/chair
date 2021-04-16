const config = require('./config.json');
const g = require("./global")
const mariadb = require("mariadb")

class Database {
	constructor(server) {
		this.server = server
	}
	async connect() {
		let pool = mariadb.createPool({
			user: config.dbuser,
			password: config.dbpass
		})
		try {
			this.conn = await pool.getConnection()
			console.log(g.tagInfo, "Successfully connected to database server")
		} catch(e) {
			console.error(e)
			console.error(g.tagError, "Failed to connect to database server, Exiting...")
			this.server.stop()
		}
	}
	async disconnect() {
		if (this.conn) {
			await this.conn.end()
			this.conn = false;
		}
	}
	//Deletes current database and creates a new one
	async clear() {
		try {
			console.log(g.tagInfo, "Deleting database...")
			await this.conn.query("DROP DATABASE IF EXISTS " + config.dbname)
			console.log(g.tagInfo, "Creating new database and tables...")
			//Create database
			await this.conn.query("CREATE DATABASE " + config.dbname + " CHARACTER SET = 'utf8'")
			await this.conn.query("USE " + config.dbname)
			//Token table
			await this.conn.query("CREATE TABLE `emails` (`hash` TEXT(65535) NULL DEFAULT NULL,`registered` TINYINT(4) NULL DEFAULT '0')")
			//Accounts table
			await this.conn.query("CREATE TABLE `cuenta` (`user` TEXT NOT NULL,`pass` TEXT(32) NOT NULL DEFAULT '')")
			console.log(g.tagInfo, "Done")
		} catch(e) {
			console.error(e);
			console.error(g.tagError, "Database error, exiting...")
			this.server.stop()
		}
	}
	//Check if the address is eligible for a code
	async check(address, hash) {
		try {
			await this.conn.query("USE " + config.dbname)
			let match = await this.conn.query("SELECT hash, registered FROM emails WHERE hash = '" + hash + "'")
			//First time we encountered this email, create code and send it
			if (match.length === 0) {
				await this.conn.query("INSERT INTO emails (hash) VALUES ('" + hash + "')")
				return true
			} else {
				//Account hasn't been made yet, send code again
				if (match[0]["registered"] === 0) {
					return true
				}
				//Account has already been made
				return false
			}
		} catch(e) {
			console.error(e)
			console.error(g.tagError, "Database error, exiting...")
			this.server.stop()
		}		
	}
}
module.exports = Database