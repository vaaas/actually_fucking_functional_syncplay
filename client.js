#!/usr/bin/env node
// jshint asi: true
// jshint esversion: 6

const child_process = require("child_process")
const net = require("net")
const socket_path = "/tmp/mpvsocket.sock"

function Client(ip, port, mpv) {
	mpv.set_callback(pause_unpause)
	const connection = new net.Socket()
	connection.connect(port, ip, on_connect)
	connection.on("error", on_error)
	connection.on("data", on_data)
	connection.on("close", on_close)
	
	function on_connect() { console.log(`connected to ${ip}:${port}`) }
	
	function on_close() {
		console.log("connection closed, exiting")
		process.exit(0) }
	
	function on_error(error) {
		console.log(error)
		process.exit(0) }
	
	function pause_unpause(what) {
		switch(what) {
			case "pause":
				connection.write("pause")
				break
			case "unpause":
				connection.write("unpause")
				break }}
	
	function on_data(buffer) {
		switch(buffer.toString("utf8")) {
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
	let callback = null
	socket.setMaxListeners(0)
	connect()
	socket.on("close", reconnect)
	socket.on("data", listen_pause)
	
	function listen_pause(buffer) {
		let obj
		try {
			obj = JSON.parse(buffer.toString("utf8"))
			if (obj.event === "pause") callback("pause")
			else if (obj.event === "unpause") callback("unpause")
		} catch(e) {
			// do nothing
		}
	}
	
	function connect() {
		socket.connect({path: path}, () => { console.log("connected to mpv socket") })
		observe_pause() }
		
	function reconnect() {
		console.log("Lost connection to socket, attempting to reconnect")
		socket.end()
		connect() }
	
	function observe_pause() {
		send({"command": ["observe_property_string", 1, "pause"]}) }
	
	function play() {
		send({ "command": ["set_property_string", "pause", "no"] }) }
	
	function pause() {
		send({ "command": ["set_property_string", "pause", "yes"] }) }
	
	function send(what) {
		socket.write(JSON.stringify(what) + "\n") }
	
	function set_callback(cb) { callback = cb }
	
	return { play: play, pause: pause, set_callback: set_callback } }

function main() {
	const ip = process.argv[2]
	const file = process.argv[3]
	let ready = false
	const mpv_proc = child_process.spawn("mpv", [file, "--pause", `--input-ipc-server=${socket_path}`])
	mpv_proc.on("exit", () => {
		console.log("video ended, exiting...")
		process.exit(0)})
	mpv_proc.stdout.on("data", () => {
		if (!ready) {
			Client(ip, 8001, MPV(socket_path))
			ready = true }}) }
	
main()
