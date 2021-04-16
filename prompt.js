const g = require("./global")
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})

class Prompt {
	constructor(server) {
		this.server = server
	}
	start() {
		rl.on('line', async (input) => {
			rl.pause()
			await this.input(input)
			rl.prompt()
		})
		rl.prompt(true)
	}
	async input(input) {
		switch (input) {
			case "cleardb": {
				await this.server.database.clear()
				break
			}
			case "stop": {
				this.server.stop()
				break
			}
			case "mail": {
				await this.server.mail.process()
				break
			}
			case "test": {
				await this.server.mail.test()
				break
			}
			default: {
				console.log(g.tagInfo, "Unknown command '" + input + "'")
			}
		}
	}
}
module.exports = Prompt