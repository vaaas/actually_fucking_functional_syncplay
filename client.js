#!/usr/bin/env node
// jshint asi: true
// jshint esversion: 6

const child_process = require("child_process")
const net = require("net")
const ws = require("ws")
const socket_path = "/tmp/mpvsocket.sock"

function WebSocketClient(ip, port, mpv) {
	const connection = new ws(`ws://${ip}:${port}/`)
	connection.on("open", () => {
		console.log("connected to websocket server") })
	connection.on("message", on_message)
	
	function on_message(what) {
		console.log(what)
		switch(what) {
			case "play":
				mpv.play()
				break
			case "pause":
				mpv.pause()
				break
			case "quit":
				process.exit(0)
				break }}}

function MPV(path) {
	const socket = new net.Socket()
	socket.setMaxListeners(0)
	connect()
	socket.on("close", reconnect)
	
	function connect() {
		socket.connect({path: path}, () => { console.log("connected to mpv socket") }) }
		
	function reconnect() {
		console.log("Lost connection to socket, attempting to reconnect")
		socket.end()
		connect() }
	
	function play() {
		send({ "command": ["set_property_string", "pause", "no"] }) }
	
	function pause() {
		send({ "command": ["set_property_string", "pause", "yes"] }) }
	
	function send(what) {
		socket.write(JSON.stringify(what) + "\n") }
	
	return { play: play, pause: pause } }

function main() {
	const ip = process.argv[2]
	const file = process.argv[3]
	let ready = false
	const mpv_proc = child_process.spawn("mpv", [file, "--pause", `--input-ipc-server=${socket_path}`])
	mpv_proc.stdout.on("data", () => {
		if (!ready) {
			WebSocketClient(ip, 8001, MPV(socket_path))
			ready = true }}) }
	
main()
