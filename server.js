const g = require("./global")
const Database = require("./db")
const Prompt = require("./prompt")
const Mail = require("./mail")

class Server {
	database = new Database(this)
	prompt = new Prompt(this)
	mail = new Mail(this)
	constructor() {
		console.log(g.tagInfo, "Chair 0.1")
	}
	async start() {
		await this.database.connect()
		this.prompt.start()
	}
	async stop() {
		await this.database.disconnect()
		process.exit(1)
	}
}

main = new Server()
main.start().then(r => {
	function update() {
		main.mail.process().then(() => setTimeout(update, 10000))
	}
	update()
})