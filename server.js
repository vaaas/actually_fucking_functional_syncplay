#!/usr/bin/env node
// jshint asi: true
// jshint esversion: 6

const net = require("net")
const readline = require("readline")

function Server(ip, port) {
	const connections = new Set()
	const server = net.createServer(on_connection)
	server.listen(port, ip)
	console.log(`tcp server listening to ${ip}:${port}`)
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
		console.log(`${socket.remoteAddress} connected`)
		connections.add(socket)
		socket.on("data", on_data)
		socket.on("close", on_close)
		socket.on("error", on_error) }

	function on_data(buffer) {
		switch(buffer.toString("utf8")) {
			case "pause":
				pause()
				break
			case "unpause":
				play()
				break }}
	
	function on_close() { connections.delete(this) }
	function on_error() { connections.delete(this) }
	
	function play() { broadcast("play") }
	function pause() { broadcast("pause") }
	
	function broadcast(what) {
		connections.forEach(client => {
			client.write(what) })}}

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
	Server(ip, 8001) }

main()
