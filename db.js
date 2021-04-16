const config = require('./config.json');
const g = require("./global")
const mariadb = require("mariadb")

class Database {
	conn = false
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
		}
	}
	async disconnect() {
		await this.conn.end()
		this.conn = false;
	}
	//Deletes current database and creates a new one
	async clear() {
		try {
			console.log(g.tagInfo, "Deleting database...")
			await this.conn.query("DROP DATABASE IF EXISTS " + config.dbname)
			console.log(g.tagInfo, "Creating new database and tables...")
			await this.conn.query("CREATE DATABASE " + config.dbname + " CHARACTER SET = 'utf8'")
			await this.conn.query("USE " + config.dbname)
			await this.conn.query("CREATE TABLE `emails` (`hash` TEXT(65535) NULL DEFAULT NULL,`registered` TINYINT(4) NULL DEFAULT '0')")
			console.log(g.tagInfo, "Done")
		} catch(e) {
			console.error(e);
		}
	}
	//Check if the address if eligible for a code
	async check(address, hash) {
		try {
			await this.conn.query("USE " + config.dbname)
			let match = await this.conn.query("SELECT hash, registered FROM emails WHERE hash = '" + hash + "'")
			//First time we encountered this email, creade code and send it
			if (match.length == 0) {
				await this.conn.query("INSERT INTO emails (hash) VALUES ('" + hash + "')")
				return true
			} else {
				//Account hasn't been made yet, send code again
				if (match[0].registered == 0) {
					return true
				}
				//Account has already been made
				return false
			}
		} catch(e) {
			console.error(e)
		}		
	}
}
module.exports = Database