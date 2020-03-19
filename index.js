require("@babel/register")({
	presets: [
		["@babel/preset-env", { targets: { esmodules: true } }]
	],
	plugins: ["@babel/plugin-proposal-class-properties"]
});
  
// Import the rest of our application.
require('./server.js');