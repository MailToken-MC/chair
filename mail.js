const g = require("./global")
const imaps = require('imap-simple')
const nodemailer = require('nodemailer')
const crypto = require("crypto")

class Mail {
	config = {
		imap: {
			user: g.email,
			password: g.email_pass,
			host: 'imap.gmail.com',
			port: 993,
			tls: true,
			tlsOptions : {
				rejectUnauthorized: false
			},
			authTimeout: 3000
		}
	}
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: g.email,
			pass: g.email_pass
		}
	})
	constructor(server) {
		this.server = server
	}
	//Starts the process of fetching email, checking addresses against the database and sending email
	async process() {
		let addresses = await this.fetch()
		if (addresses.length > 0) {
			addresses.forEach(async (address) => {
				let hash = crypto.createHash("sha256").update(address).digest('hex')
				try {
					//Check if address is eligible for a code
					let eligible = await this.server.database.check(address, hash)
					//Send mail with the results
					this.server.mail.send(address, hash, eligible)
				} catch(e) {
					console.error(e)
				}
			})
		} else {
			console.log(g.tagInfo, "No new emails")
		}	
	}
	//Fetches any eligible emails and returns the addresses
	async fetch() {
		try {
			console.log(g.tagInfo, "Fetching emails...")
			let senders = []
			let conn = await imaps.connect(this.config)
			let box = await conn.openBox('INBOX')
			let searchCriteria = [["UNSEEN"], ["HEADER", "SUBJECT", "REGISTRO"]]
			let fetchOptions = {
				markSeen: false,
				envelope: true,
			}
			let mails = await conn.search(searchCriteria, fetchOptions)
			for (let mail of mails) {
				let sender = mail.attributes.envelope.sender[0].mailbox + "@" + mail.attributes.envelope.sender[0].host
				//Check if it isnt an eligible address
				//if (sender.search("@udec.cl") == -1) {continue}
				//Check if sender is not already on senders list
				let alreadyQueued = false
				for (let queuedSender of senders) {
					if (queuedSender == sender) {
						alreadyQueued = true
						break
					}
				}
				if (!alreadyQueued) {
					senders.push(sender)
				}
			}
			return senders
		} catch(e) {
			console.error(e)
		}
	}
	//Send email
	async send(address, hash, eligible) {
		console.log(g.tagInfo, "Sending mail to " + address)
		let code = hash.substring(0, 5).toUpperCase()
		let message
		if (eligible) {
			message = "<p>Tu codigo es " + code + "</p>"
		} else {
			message = "<p>Este email ya ha sido utilizado para crear una cuenta</p>"
		}
		let mailOptions = {
			from: g.email,
			to: address,
			subject: "Minecraft hardcore pruebas",
			html: message
		}
		try {
			await this.transporter.sendMail(mailOptions)
		} catch(e) {
			console.log(e)
		}
	}
	//Send a test mail
	async test() {
		let mailOptions = {
			from: g.email,
			to: g.email,
			subject: "Correo de prueba",
			html: "<p>Correo de prueba</p>",
		}
		try {
			let result = await this.transporter.sendMail(mailOptions)
			console.log(result)
		} catch(e) {
			console.log(e)
		}
	}
}
module.exports = Mail