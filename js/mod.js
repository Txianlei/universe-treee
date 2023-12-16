let modInfo = {
	name: "A piece of s**t",
	id: "mymod",
	author: "user incremental",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(1), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("g",11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(1)
	//ADD
	if (hasUpgrade("g",12)) gain = gain.add(0.02)
	if (hasUpgrade("g",13)) gain = gain.add(0.05)
	if (hasUpgrade("g",14)) gain = gain.add(upgradeEffect("g",14))

	//MULT
	if (hasUpgrade("g",21)) gain = gain.times(2)
	if (hasUpgrade("g",33)) gain = gain.times(3)
	if (hasUpgrade("g",23)) gain = gain.times(upgradeEffect("g",23))
	if (hasUpgrade("g",32)) gain = gain.times(upgradeEffect("g",32))
	if (hasUpgrade("g",32)) gain = gain.times(upgradeEffect("g",32))
	if (hasUpgrade("q",33)) gain = gain.times(upgradeEffect("q",33))
	if (hasUpgrade("q",55)) gain = gain.times(upgradeEffect("q",55))
	if (hasUpgrade("p",11)) gain = gain.times(10)
	if (hasUpgrade("p",21)) gain = gain.times(upgradeEffect("p",21))
	if (hasUpgrade("p",51)) gain = gain.times(upgradeEffect("p",51))
	if (hasUpgrade("p",72) && player.e.onpointmode) gain = gain.times(upgradeEffect("g",14).add(1))
	if (hasUpgrade("n",43)) gain = gain.times(upgradeEffect("n",43))
	if (inChallenge("n",11)) gain = gain.div(player.n.c11eff)
	if (player.q.unlocked) gain = gain.times(tmp.q.powerEffofu)


	//POWER
	if(hasUpgrade("q",41)) gain = gain.pow(1.15)
	if(hasUpgrade("p",34)) gain = gain.pow(1.1)
	if(hasUpgrade("n",54)) gain = gain.pow(1.03)
	if(inChallenge("p",31)) gain = gain.pow(0.666)
	if (player.e.onpointmode) gain = gain.pow(tmp.e.effofpointcharge)

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}