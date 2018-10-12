#!/usr/bin/env node
// jshint asi: true
// jshint esversion: 6

const ws = require("ws")
const readline = require("readline")

function WebSocketServer(ip, port) {
	const server = new ws.Server({ port: port, host: ip})
	server.on("connection", on_connection)
	console.log("websocket listening to", ip + ":" + port)
	console.log("'play' to play, 'pause' to pause, 'quit' to quit")	
	Readline(on_readline)
	
	function on_readline(message) {
		switch(message) {
			case "pause":
				pause()
				break
			case "play":
				play()
				break
			case "quit":
				process.exit(0)
				break }}

	function on_connection(socket) {
		console.log(socket._socket.remoteAddress, "connected")
		socket.on("message", on_message) }

	function on_message(message) {
		switch(message) {
			case "pause":
				pause()
				break
			case "unpause":
				play()
				break }}
	
	function play() { broadcast("play") }
	function pause() { broadcast("pause") }
	
	function broadcast(what) {
		server.clients.forEach(client => {
			client.send(what) })}}

function Readline (cb) {
	const rl = readline.createInterface({
		input: process.stdin, output: process.stdout })
	ask()
	function ask() { rl.question("affs > ", answer_listener) }
	function answer_listener(answer) {
		cb(answer)
		ask() }}

function main() {
	const ip = process.argv[2] ? process.argv[2] : "0.0.0.0"
	WebSocketServer(ip, 8001) }

main()
