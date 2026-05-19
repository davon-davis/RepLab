// Relay worker — the stockfish IIFE detects it is running as a worker via the
// "#<wasmUrl>,worker" hash convention. We create an inner worker with that hash
// so the engine resolves its .wasm file correctly, then relay messages.

var jsUrl  = new URL('./stockfish-18-lite-single.js',   self.location.href).href
var wasmUrl = new URL('./stockfish-18-lite-single.wasm', self.location.href).href
var engineUrl = jsUrl + '#' + encodeURIComponent(wasmUrl) + ',worker'

var engine = new Worker(engineUrl)

engine.onmessage = function(e) { self.postMessage(e.data) }
self.onmessage   = function(e) { engine.postMessage(e.data) }
