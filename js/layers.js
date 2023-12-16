 addLayer("g", {
    name: "genesis", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "genesis", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.5)
        if (player.g.points.gte(5e9) || hasUpgrade("g",35)) exp = exp.add(-0.25)
        if (hasUpgrade("p",45)) exp = exp.add(0.02)
        if (inChallenge("p",12)) exp = exp.div(30)
        if (inChallenge("p",32)) exp = exp.div(3e5)
        if (player.e.ongenesisexmode) exp = exp.add(tmp.e.effofgenesisexcharge)
        if (player.e.ongenesismode && hasUpgrade("p",81)) exp = exp.add(0.01)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (!inChallenge("n",12)) {
            if (hasUpgrade("g",22)) mult = mult.times(2)
            if (hasUpgrade("g",24)) mult = mult.times(upgradeEffect("g",24))
            if (hasUpgrade("g",31)) mult = mult.times(upgradeEffect("g",31))
            if (hasUpgrade("g",34)) mult = mult.times(3)
            if (hasUpgrade("q",13)) mult = mult.times(upgradeEffect("q",13))
            if (hasUpgrade("q",34)) mult = mult.times(upgradeEffect("q",34))
            if (hasUpgrade("q",54)) mult = mult.times(upgradeEffect("q",54))
        }
        if (hasUpgrade("p",12)) mult = mult.times(5)
        if (hasUpgrade("p",53)) mult = mult.times(upgradeEffect("p",53))
        if (hasUpgrade("p",64)) mult = mult.times(upgradeEffect("p",23))
        if (hasUpgrade("p",73)) mult = mult.times(upgradeEffect("g",23))
        if (inChallenge("p",41)) mult = mult.times(0)
        if (player.q.unlocked) mult = mult.times((tmp.q.powerEffofd).add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        if (hasUpgrade("q",65)) pow = pow.times(1.1)
        if (hasUpgrade("p",25)) pow = pow.times(1.05)
        if (player.e.ongenesisexmode&&hasUpgrade("n",22)) pow = pow.times(1.25)
        if (player.e.ongenesismode) pow = pow.times(tmp.e.effofgenesischarge)
        return pow
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for genesis", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = [tmp.g.upgrades[35]];
        if (hasMilestone("q",1) && resettingLayer=="q" || hasMilestone("p",1)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
    },
    layerShown(){return true},
    tabFormat: ["main-display",
    ["display-text",
    function() {return "YOU NEED TO DO A HARD RESET BEFORE YOU GETTING STARTED!"},
        {}],
    "prestige-button",
    "blank",
    ["display-text",
        function() {return player.g.points.gte(5e9) ? 'Genesis gain is less after 5e9 genesis!' : ""},
            {}],
    "blank",
     "upgrades"],
    passiveGeneration() {
        let rate = 0
        if (hasMilestone("q",0)) rate = 1
        if (hasMilestone("p",2)) rate = 10
        if (inChallenge("p",11)) rate = -0.1
        return rate 
    },
    upgrades:{
        rows:12,
        cols:5,
        11:{
            title:"The beginning of everything",
            description(){return "Add 1 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){ 
                return player.g.unlocked
            }
        },
        12:{
            title:"Boosting",
            description(){return "Add 0.02 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("g",11)
            }
        },
        13:{
            title:"Breaking",
            description(){return "Add 0.05 to point generation."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("g",12)
            }
        },
        14:{
            title:"Changing",
            description(){return "Add a number to point generation based on your genesis."},
            cost(){return new Decimal(2)},
            unlocked(){
                return hasUpgrade("g",13)
            },
            effect(){return inChallenge("p",42) ? new Decimal(0) : hasUpgrade("q",43) ? player.g.points.add(10).log10().pow(4).div(hasUpgrade("g",15) ? 50 : 100).pow(hasChallenge("p",42) ? 1.5 : 1):player.g.points.add(10).log10().pow(4).div(hasUpgrade("g",15) ? 50 : 100).pow(hasChallenge("p",42) ? 1.5 : 1).min(1000)},
            effectDisplay(){return `+${format(upgradeEffect("g",14))}`}
        },
        15:{
            title:"Major boost of this row I",
            description(){return "Double the effect of \"changing\"."},
            cost(){return new Decimal(2)},
            unlocked(){
                return hasUpgrade("g",14)
            },
        },
        21:{
            title:"Gathering",
            description(){return "Double point generation."},
            cost(){return new Decimal(3)},
            unlocked(){
                return hasUpgrade("g",15)
            },
        },
        22:{
            title:"Charging",
            description(){return "Double genesis gain."},
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("g",21)
            },
        },
        23:{
            title:"Waiting",
            description(){return "Boost point generation based on points."},
            cost(){return new Decimal(7)},
            unlocked(){
                return hasUpgrade("g",22)
            },
            effect(){return player.points.add(1).log10().pow(3).pow(2).div(hasUpgrade("p",35) ? 1 : hasUpgrade("g",25) ? 35:100).add(1).pow(hasUpgrade("n",21)&&player.e.onpointexmode ? 1.8 :1).min(hasUpgrade("q",23) ? new Decimal(1000).times(upgradeEffect("q",23)).pow(hasUpgrade("n",21)&&player.e.onpointexmode ? 1.8 :1) : 1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",23))}`}
        },
        24:{
            title:"Low energy level",
            description(){return "Boost genesis gain based on your points."},
            cost(){return new Decimal(12)},
            unlocked(){
                return hasUpgrade("g",23)
            },
            effect(){return player.points.add(1).log10().pow(hasUpgrade("g",25)? 4:3.3).pow(2.3).div(70).add(1).min(hasUpgrade("q",24) ? new Decimal(1000).times(upgradeEffect("q",24)) : 1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",24))}`}
        },
        25:{
            title:"Major boost of this row II",
            description(){return "The effect of \"Waiting\" and \"Low energy level\" are better."},
            cost(){return new Decimal(15)},
            unlocked(){
                return hasUpgrade("g",24)
            },
        },
        31:{
            title:"Mid energy level",
            description(){return "Boost genesis gain based on your genesis."},
            cost(){return new Decimal(25)},
            unlocked(){
                return hasUpgrade("g",25)
            },
            effect(){return hasUpgrade("q",44) ? player.g.points.add(1).log10().pow(4 ).div(50).add(1) : player.g.points.add(1).log10().pow(4 ).div(50).add(1).min(1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",31))}`}
        },
        32:{
            title:"High energy level",
            description(){return "Boost point gain based on \"Changing\"'s effect."},
            cost(){return new Decimal(30)},
            unlocked(){
                return hasUpgrade("g",31)
            },
            effect(){return hasUpgrade("q",63) ? upgradeEffect("g",14).pow(5).add(1).ln().pow(2.5).add(1).min(hasUpgrade("n",55) ? upgradeEffect("n",55).times(1000) : 1000) : upgradeEffect("g",14).times(5).add(1).pow(0.25).min(hasUpgrade("n",55) ? upgradeEffect("n",55).times(1000) : 1000)},
            effectDisplay(){return `x${format(upgradeEffect("g",32))}`}
        },
        33:{
            title:"Unreachable energy level",
            description(){return "Triple point gain."},
            cost(){return new Decimal(50)},
            unlocked(){
                return hasUpgrade("g",32)
            },
        },
        34:{
            title:"True vaccum",
            description(){return "Triple genesis gain."},
            cost(){return new Decimal(100)},
            unlocked(){
                return hasUpgrade("g",33)
            },
        },
        35:{
            title:"Big bang",
            description(){return "The cost scaling of genesis start from 0 but unlock Quark."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("g",34)
            },
        },
    }
}),
addLayer("q", {
    name: "quark", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        total: new Decimal(0),
        upquark: new Decimal(0),
        downquark: new Decimal(0),
        strange: new Decimal(0),
        charm: new Decimal(0),
        top: new Decimal(0),
        bottom: new Decimal(0),
    }},
    color: "#C24545",
    requires: new Decimal(1e8), // Can be a function that takes requirement increases into account
    resource: "quark", // Name of prestige currency
    baseResource: "genesis", // Name of resource prestige is based on
    baseAmount() {return player.g.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.15)
        if (hasUpgrade("p",45)) exp = exp.add(0.02)
        if (inChallenge("p",32)) exp = exp.div(3e5)
        if (player.e.onquarkmode && hasUpgrade("p",82)) exp = exp.add(0.01)
        if (player.e.onquarkexmode) exp = exp.add(tmp.e.effofquarkexcharge)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("q",14)) mult = mult.times(2)
        if (hasUpgrade("q",22)) mult = mult.times(upgradeEffect("q",22))
        if (hasUpgrade("q",31)) mult = mult.times(tmp.q.powerEffofcharm)
        if (hasUpgrade("q",42)) mult = mult.times(upgradeEffect("q",42))
        if (hasUpgrade("q",53)) mult = mult.times(upgradeEffect("q",53))
        if (hasUpgrade("p",43)) mult = mult.times(upgradeEffect("p",43))
        if (hasUpgrade("q",65)) mult = mult.times(3)
        if (hasUpgrade("p",13)) mult = mult.times(2)
        if (hasUpgrade("p",54)) mult = mult.times(upgradeEffect("p",54))
        if (inChallenge("p",22)) mult = mult.times(0)
        if (inChallenge("n",22)) mult = mult.times(-1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let pow = new Decimal(1)
        if (player.e.onquarkexmode&&hasUpgrade("n",24)) pow = pow.times(1.2)
        if (player.e.onquarkmode) pow = pow.times(tmp.e.effofquarkcharge)
        if (inChallenge("n",22)) pow = new Decimal(1)
        return pow
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    update(diff) {
        if (player.q.unlocked) player.q.upquark = player.q.upquark.plus(tmp.q.effectofup.times(diff));
        if (player.q.unlocked) player.q.downquark = player.q.downquark.plus(tmp.q.effectofdown.times(diff));
        if (hasUpgrade("q",21)) player.q.strange = player.q.strange.plus(tmp.q.effectofstr.times(diff));
        if (hasUpgrade("q",31)) player.q.charm = player.q.charm.plus(tmp.q.effectofcharm.times(diff));
        if (hasUpgrade("q",51)) player.q.top = player.q.top.plus(tmp.q.effectoftop.times(diff));
        if (hasUpgrade("q",51)) player.q.bottom = player.q.bottom.plus(tmp.q.effectofbottom.times(diff));
    },
    hotkeys: [
        {key: "q", description: "Q: Reset for quark", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    resetsNothing() { return hasMilestone("p",0)  },
    effBase() {
        let base = new Decimal(0.6);
        if (hasUpgrade("q",52)) base = base.add(0.15)
        if (hasUpgrade("p",14)) base = base.add(0.12)
        if (hasUpgrade("p",93)&&player.e.onsixmode) exp = exp.add(0.08)
        return base;
    },
    effectofup() {
        if (!player.q.unlocked) return new Decimal(0);
        let eff = Decimal.pow(player.q.points,this.effBase()).max(0);
        if (hasUpgrade("q",11)) eff = eff.times(2)
        if (hasUpgrade("q",15)) eff = eff.times(upgradeEffect("q",15))
        if (hasUpgrade("p",22)) eff = eff.times(upgradeEffect("p",22))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    effectofdown() {
        if (!player.q.unlocked) return new Decimal(0);
        let eff = Decimal.pow(player.q.points,this.effBase()).max(0);
        if (hasUpgrade("q",12)) eff = eff.times(2)
        if (hasUpgrade("q",15)) eff = eff.times(upgradeEffect("q",15))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    effectofstr() {
        if (!hasUpgrade("q",21)) return new Decimal(0);
        let eff = Decimal.pow(player.q.upquark,this.effBase()).pow(0.3).max(0);
        if (hasUpgrade("q",35)) eff = eff.times(upgradeEffect("q",35))
        if (hasUpgrade("p",44)) eff = eff.times(upgradeEffect("p",44))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    effectofcharm() {
        if (!hasUpgrade("q",31)) return new Decimal(0);
        let eff = Decimal.pow(player.q.downquark,this.effBase()).pow(0.45).max(0);
        if (hasUpgrade("q",35)) eff = eff.times(upgradeEffect("q",35))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("q",51)) eff = eff.times(tmp.q.powerEffoftop)
        if (hasUpgrade("n",15)) eff = eff.times(upgradeEffect("p",42))
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    effectoftop() {
        if (!hasUpgrade("q",51)) return new Decimal(0);
        let eff = Decimal.pow(player.q.strange,this.effBase()).add(1).log10().pow(4).times(10).div(hasUpgrade("p",71) ? 1 : tmp.q.powerEffofbottom);
        if (hasUpgrade("q",64)) eff = eff.times(upgradeEffect("q",64))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("p",23)) eff = eff.times(upgradeEffect("p",23))
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    effectofbottom() {
        if (!hasUpgrade("q",51)) return new Decimal(0);
        let eff = Decimal.pow(player.q.charm,this.effBase()).add(1).log10().pow(3).times(15).div(hasUpgrade("p",71) ? 1 : tmp.q.powerEffoftop);
        if (hasUpgrade("q",64)) eff = eff.times(upgradeEffect("q",64))
        if (hasUpgrade("p",61)) eff = eff.times(upgradeEffect("p",61))
        if (hasUpgrade("p",64)) eff = eff.times(upgradeEffect("p",53))
        if (player.e.onsixmode) eff = eff.times(tmp.e.effofsixcharge)
        return eff;
    },
    powerExp() {
        let exp = new Decimal(1/6);
        if (hasUpgrade("q",32)) exp = exp.add(1/13)
        if (hasUpgrade("p",32)) exp = exp.add(1/10)
        if (hasUpgrade("p",74)&&player.e.onsixmode) exp = exp.add(1/11)
        if (inChallenge("n",21)) exp = new Decimal(0)
        return exp;
    },
    powerEffofu() {
        if (!player.q.unlocked && player.q.upquark.gt(0) || inChallenge("p",21)) return new Decimal(1);
        let pow = player.q.upquark.add(1).pow(this.powerExp()).min("1e1000");
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        if (hasUpgrade("q",25)) pow = pow.times(tmp.q.powerEffofstr);
        return pow
    },
    powerEffofd() {
        if (!player.q.unlocked && player.q.upquark.gt(0) || inChallenge("p",21)) return new Decimal(1);
        let pow = player.q.downquark.add(1).times(0.5).pow(this.powerExp()).min("1e1000");
        if (hasUpgrade("q",25)) pow = pow.times(tmp.q.powerEffofstr);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    powerEffofstr() {
        if (!hasUpgrade("q",21) && player.q.strange.gt(0)) return new Decimal(1);
        let pow =  player.q.strange.add(1).ln().pow(this.powerExp()).pow(8).add(1);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow
    },
    powerEffofcharm() {
        if (!hasUpgrade("q",31)) return new Decimal(1);
        let pow = Decimal.pow(player.q.charm,this.effBase()).pow(0.25).max(1);
        if (hasUpgrade("q",51)) pow = pow.times(tmp.q.powerEffofbottom)
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        return pow;
    },
    powerEffofbottom() {
        if (!hasUpgrade("q",31) && player.q.top.gt(0)) return new Decimal(1);
        let pow = player.q.bottom.add(1).ln().add(1).pow(this.powerExp());
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        if (hasUpgrade("n",44)) pow = pow.pow(10)
        return pow
    },
    powerEffoftop() {
        if (!player.q.unlocked && player.q.bottom.gt(0)) return new Decimal(1);
        let pow = player.q.top.add(1).ln().add(1).pow(this.powerExp());
        if (hasUpgrade("p",24)) pow = pow.times(upgradeEffect("p",24))
        if (hasUpgrade("n",44)) pow = pow.pow(10) 
        return pow
    },
    branches:["g"],
    layerShown(){return hasUpgrade("g",35) || player.q.unlocked},
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("p",3)) {
            keep.push("upgrades")
            keep.push("milestones")
        }
        if (layers[resettingLayer].row > this.row) layerDataReset("q", keep)
    },
    passiveGeneration() {return hasMilestone("p",2) ? 1.5 : hasMilestone("q",2)? 1: 0},
    tabFormat: ["main-display",
    "prestige-button",
    ["display-text",
    function() {return 'You have ' + format(player.q.upquark) + ' upquark, which boost your point generation by '+format(tmp.q.powerEffofu)+"("+format(tmp.q.effectofup)+"/s)"},
        {}],
    "blank",
    ["display-text",
    function() {return 'You have ' + format(player.q.downquark) + ' downquark, which boost your genesis gain by '+(format(tmp.q.powerEffofd.add(1).times(0.5)))+"("+format(tmp.q.effectofdown)+"/s)"},
        {}],
    "blank",
    ["display-text",
        function() {return hasUpgrade("q",21) ? 'You have ' + format(player.q.strange) + ' strangequark, which boost your upquark effect by '+(format(tmp.q.powerEffofstr))+"("+format(tmp.q.effectofstr)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",31) ? 'You have ' + format(player.q.charm) + ' charmquark, which boost your quark gain by '+(format(tmp.q.powerEffofcharm))+"("+format(tmp.q.effectofcharm)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",51) ? 'You have ' + format(player.q.top) + ' topquark, which boost 4 types of quark gain and divide bottom quark gain by '+(format(tmp.q.powerEffoftop))+"("+format(tmp.q.effectoftop)+"/s)" : ""},
        {}],
    "blank",
    ["display-text",
    function() {return hasUpgrade("q",51) ? 'You have ' + format(player.q.bottom) + ' bottomquark, which boost 4 types of quark effect and divide top quark gain by '+(format(tmp.q.powerEffofbottom))+"("+format(tmp.q.effectofbottom)+"/s)" : ""},
        {}],
    "blank",
    "milestones",
    "upgrades"],
    milestones:{
        0: {
            requirementDescription: "2 total quarks",
            effectDescription: "Auto generate genesis.",
            done() { return player.q.total.gte(2) }
        },
        1: {
            requirementDescription: "3 total quarks and genesis upgrade \"big bang\"",
            effectDescription: "Keep genesis upgrades on quark reset.",
            done() { return player.q.total.gte(3) && hasUpgrade("g",35) }
        },
        2: {
            requirementDescription: "15 total quarks",
            effectDescription: "Auto generate quark.",
            done() { return player.q.total.gte(15) }
        },
    },
    upgrades:{
        rows:12,
        cols:5,
        11:{
            title:"Quark delay",
            description(){return "Double upquark gain.(needs \"bigbang\")"},
            cost(){return new Decimal(1)},
            unlocked(){
                return player.q.unlocked && hasUpgrade("g",35)
            }
        },
        12:{
            title:"Quark exist",
            description(){return "Double downquark gain.(needs \"bigbang\")"},
            cost(){return new Decimal(1)},
            unlocked(){
                return player.q.unlocked && hasUpgrade("g",35)
            }
        },
        13:{
            title:"Quark boost",
            description(){return "Boost genesis gain based on quark."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("q",11) && hasUpgrade("q",12)
            },
            effect(){return hasUpgrade("n",52) ? player.q.points.pow(0.05).add(1).log10().pow(10).div(60).max(1) : player.q.points.add(1).ln().pow(3).div(20).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",13))}`}
        },
        14:{
            title:"Quark enhance",
            description(){return "Double quark gain."},
            cost(){return new Decimal(1)},
            unlocked(){
                return hasUpgrade("q",13)
            },
        },
        15:{
            title:"Major boost of this row III",
            description(){return "boost upquark and downquark based on themselves."},
            cost(){return new Decimal(2)},
            unlocked(){
                return hasUpgrade("q",14)
            },
            effect(){return hasUpgrade("q",44) ? player.q.upquark.times(player.q.downquark).add(1).ln().pow(2.5).div(50).add(1) : player.q.upquark.add(player.q.downquark).add(1).log10().pow(4).div(75).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",15))}`}
        },
        21:{
            title:"Starnge ones",
            description(){return "Unlock a new type of quark."},
            cost(){return new Decimal(3)},
            unlocked(){
                return hasUpgrade("q",15)
            },
        },
        22:{
            title:"Strange boost",
            description(){return "Points boost quark gain."},
            cost(){return new Decimal(5)},
            unlocked(){
                return hasUpgrade("q",21)
            },
            effect(){return player.points.add(1).log10().div(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",22))}`}
        },
        23:{
            title:"Strange cross",
            description(){return "downquark delays the hardcap of \"waiting\"."},
            cost(){return new Decimal(8)},
            unlocked(){
                return hasUpgrade("q",22)
            },
            effect(){return hasUpgrade("q",43) ? player.q.downquark.add(1).pow(4).ln().times(3).add(1):player.q.downquark.pow(0.4).div(100).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",23))}`}
        },
        24:{
            title:"Strange duocross",
            description(){return "strangequark delays the hardcap of \"low energy level\"."},
            cost(){return new Decimal(11)},
            unlocked(){
                return hasUpgrade("q",22)
            },
            effect(){return player.q.strange.pow(0.3).div(20).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",24))}`}
        },
        25:{
            title:"Major boost of this row IV",
            description(){return "strangequark boost downquark's effect."},
            cost(){return new Decimal(25)},
            unlocked(){
                return hasUpgrade("q",24)
            },
        },
        31:{
            title:"Charmful time",
            description(){return "Unlock a new type of quark."},
            cost(){return new Decimal(50)},
            unlocked(){
                return hasUpgrade("q",25)
            },
        },
        32:{
            title:"Charmful boost",
            description(){return "Increase boosts of 4 kinds of quarks."},
            cost(){return new Decimal(100)},
            unlocked(){
                return hasUpgrade("q",31)
            },
        },
        33:{
            title:"Charmful delay",
            description(){return "4 quarks boost point generation."},
            cost(){return new Decimal(350)},
            unlocked(){
                return hasUpgrade("q",32)
            },
            effect(){return hasUpgrade("q",43) ? player.q.downquark.times(player.q.upquark).times(player.q.strange).add(1).log10().times(player.q.charm).add(1).log10().times(player.q.charm).pow(0.35).add(1).min(1e135) : player.q.downquark.add(player.q.upquark).times(player.q.strange).add(1).log10().pow(player.q.charm).add(1).log10().div(300).pow(0.2).add(1).min(1e135)},
            effectDisplay(){return `x${format(upgradeEffect("q",33))}`}
        },
        34:{
            title:"Charmful part",
            description(){return "4 quarks boost genesis gain."},
            cost(){return new Decimal(2000)},
            unlocked(){
                return hasUpgrade("q",33)
            },
            effect(){return player.q.downquark.add(player.q.upquark).times(player.q.strange).add(1).ln().pow(player.q.charm).add(1).log10().div(300).pow(0.15).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",34))}`}
        },
        35:{
            title:"Major boost of this row V",
            description(){return"boost strange quark and charm quark based on themselves."},
            unlocked(){
                return hasUpgrade("q",34)
            },
            cost(){return new Decimal(3000)},
            effect(){return hasUpgrade("q",44) ? player.q.strange.times(player.q.charm).pow(2).add(1).ln().pow(2.5).div(50).max(1) : player.q.strange.times(player.q.charm).add(1).ln().pow(3).div(500).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",35))}`}
        },
        41:{
            title:"A break of quarks",
            description(){return "Point generation is raised to ^1.15"},
            unlocked(){
                return hasUpgrade("q",35)
            },
            cost(){return new Decimal(12000)},
        },
        42:{
            title:"Quark protection",
            description(){return "Boost quark gain based on your genesis."},
            unlocked(){
                return hasUpgrade("q",41)
            },
            cost(){return new Decimal(15000)},
            effect(){return hasUpgrade("q",45) ? player.g.points.add(1).ln().pow(2).div(115).max(1) : player.g.points.add(1).log10().pow(2.5).div(215).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",42))}`}
        },
        43:{
            title:"Quark quark",
            description(){return "The effect formulas of \"charmful delay\",\"strange cross\"is better and remove the hardcap of \"changing\"."},
            unlocked(){
                return hasUpgrade("q",42)
            },
            cost(){return new Decimal(200000)},
        },
        44:{
            title:"Quark power",
            description(){return "The effect formulas of \"Major boost III\",\"Major boost V\"is better and remove the hardcap of \"mid energy level\"."},
            unlocked(){
                return hasUpgrade("q",43)
            },
            cost(){return new Decimal(500000)},
        },
        45:{
            title:"Major boost of this row VI",
            description(){return "\"Quark protection\"'s formula is better."},
            unlocked(){
                return hasUpgrade("q",44)
            },
            cost(){return new Decimal(700000)},
        },
        51:{
            title:"Quark family",
            description(){return "Unlock last 2 types of quark."},
            unlocked(){
                return hasUpgrade("q",45)
            },
            cost(){return new Decimal(1.4e6)},
        },
        52:{
            title:"Quark being",
            description(){return "Increase the production of 6 types of quarks."},
            unlocked(){
                return hasUpgrade("q",51)
            },
            cost(){return new Decimal(1e7)},
        },
        53:{
            title:"Quark antiboost",
            description(){return "Boost quark gain based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",52)
            },
            cost(){return new Decimal(5e7)},
            effect(){return player.q.upquark.times(player.q.downquark).pow(player.q.charm.times(player.q.strange).pow(0.2).add(1).log10()).add(1).log10().pow(player.q.top.times(player.q.bottom).add(1).log10().add(1).log10()).pow(0.65).times(hasUpgrade("q",61) ? upgradeEffect("q",61) : 1).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",53))}`}
        },
        54:{
            title:"Quark antiboost+",
            description(){return "Boost genesis gain based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",53)
            },
            cost(){return new Decimal(1e9)},
            effect(){return player.q.upquark.times(player.q.downquark.pow(1.2)).pow(player.q.charm.times(player.q.strange).pow(0.45).add(1).log10()).add(1).log10().pow(player.q.top.pow(player.q.bottom).add(1).log10().add(1).log10()).pow(0.6).add(1).ln().pow(1.5).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",54))}`}
        },
        55:{
            title:"Quark antiboost++",
            description(){return "Boost point generation based on your 6 types of quark."},
            unlocked(){
                return hasUpgrade("q",54)
            },
            cost(){return new Decimal(1e10)},
            effect(){return player.q.upquark.pow(player.q.downquark.add(1).ln()).times(player.q.charm.times(player.q.strange).pow(2).add(1).log10()).add(1).log10().pow(player.q.top.pow(player.q.bottom).add(1).ln().add(1).log10()).pow(0.3).add(1).ln().pow(1.3).times(hasUpgrade("q",62) ? upgradeEffect("q",62) : 1).add(1).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",55))}`}
        },
        61:{
            title:"Quark antiboost+++",
            description(){return "Boost \"quark antiboost\" based on your \"quark antiboost+\"."},
            unlocked(){
                return hasUpgrade("q",55)
            },
            cost(){return new Decimal(2e10)},
            effect(){return upgradeEffect("q",54).pow(2).add(1).log10()},
            effectDisplay(){return `x${format(upgradeEffect("q",61))}`}
        },
        62:{
            title:"Quark antiboost++++",
            description(){return "Boost \"quark antiboost++\" based on your \"quark antiboost+\"."},
            unlocked(){
                return hasUpgrade("q",61)
            },
            cost(){return new Decimal(1e11)},
            effect(){return upgradeEffect("q",54).pow(2).add(1).ln().pow(0.6).add(1).times(hasUpgrade("n",62) ? upgradeEffect("n",62) : 1)},
            effectDisplay(){return `x${format(upgradeEffect("q",62))}`}
        },
        63:{
            title:"Quark antiboost+5",
            description(){return "THe formula of \"high energy level\" is better."},
            unlocked(){
                return hasUpgrade("q",62)
            },
            cost(){return new Decimal(1e12)},
        },
        64:{
            title:"Quark antiboost+n",
            description(){return "Top quark and bottom quark boost each other."},
            unlocked(){
                return hasUpgrade("q",63)
            },
            cost(){return new Decimal(2e12)},
            effect(){return player.q.top.pow(player.q.bottom).add(1).log10().add(1).ln().pow(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("q",64))}`}
        },
        65:{
            title:"Truth of quarks",
            description(){return "Unlock proton, genesis gain is raised to ^1.1, Triple quark gain."},
            unlocked(){
                return hasUpgrade("q",64)
            },
            cost(){return new Decimal(1)},
        },
    }
}),
addLayer("p", {
    name: "proton", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#1111EF",
    requires: new Decimal(1e14), // Can be a function that takes requirement increases into account
    resource: "proton", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.142857)
        if (hasUpgrade("n",32)) exp = exp.add(0.03)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p",15)) mult = mult.times(2)
        if (hasUpgrade("p",31)) mult = mult.times(2)
        if (hasUpgrade("p",41)) mult = mult.times(upgradeEffect("p",41))
        if (hasUpgrade("p",42)) mult = mult.times(upgradeEffect("p",42))
        if (hasAchievement("a",41)) mult = mult.times(3)
        if (hasUpgrade("p",52)) mult = mult.times(upgradeEffect("p",52))
        if (hasChallenge("p",31)) mult = mult.times(10)
        if (hasUpgrade("p",63)) mult = mult.times(upgradeEffect("p",63))
        if (hasUpgrade("p",84)) mult = mult.times(upgradeEffect("p",84))
        if (hasUpgrade("p",93)) mult = mult.times(upgradeEffect("p",53))
        if (hasUpgrade("p",94)) mult = mult.times(upgradeEffect("p",94))
        if (hasUpgrade("n",11)) mult = mult.times(upgradeEffect("n",11))
        if (player.e.onprotonmode||hasUpgrade("p",91)) mult = mult.times(tmp.e.effofprotoncharge)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        if (hasUpgrade("p",73)) pow = pow.times(1.2)
        if (hasUpgrade("n",45)&&player.e.onprotonmode) pow = pow.times(1.02)
        return pow
    },
    passiveGeneration() {return hasChallenge("p",21) ? 0.2 : 0},
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for proton", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("q",65)||player.p.unlocked},
    tabFormat: ["main-display",
    "prestige-button",
    "milestones",
    "blank",
    "upgrades",
    "blank",
    "challenges"],
    branches:["q"],
    milestones:{
        0: {
            requirementDescription: "1 proton",
            effectDescription: "Quark resets nothing.",
            done() { return player.p.points.gte(1) }
        },
        1: {
            requirementDescription: "2 proton",
            effectDescription: "Keep genesis upgrades on all resets.",
            done() { return player.p.points.gte(2) }
        },
        2: {
            requirementDescription: "3 proton",
            effectDescription: "Increase the speed of genesis generation and quark generation.",
            done() { return player.p.points.gte(3) }
        },
        3: {
            requirementDescription: "4 proton",
            effectDescription: "Keep quark upgrades and milestones on all resets. Unlock a proton challenge.",
            done() { return player.p.points.gte(4) }
        },
        4: {
            requirementDescription: "1e6 proton",
            effectDescription: "Electron resets nothing.",
            done() { return player.p.points.gte(1e6) },
            unlocked() {return hasChallenge("p",31)}
        },
        5: {
            requirementDescription: "1e9 proton",
            effectDescription: "You can charge 2 resources at the same time.",
            done() { return player.p.points.gte(1e9) },
            unlocked() {return hasChallenge("p",32)}
        },
        6: {
            requirementDescription: "3e19 proton",
            effectDescription: "You can charge 3 resources at the same time.",
            done() { return player.p.points.gte(3e19) },
            unlocked() {return hasChallenge("p",41)}
        },
    },
    upgrades:{
        11:{
            title:"Second structure",
            description(){return "10x point gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        12:{
            title:"Third structure",
            description(){return "5x genesis gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        13:{
            title:"Fourth structure",
            description(){return "Double quark gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        14:{
            title:"Fifth structure",
            description(){return "Increase the production of 6 types of quarks."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        15:{
            title:"Sixth structure",
            description(){return "Double proton gain."},
            unlocked(){
                return player.p.unlocked
            },
            cost(){return new Decimal(1)},
        },
        21:{
            title:"Proton boost I",
            description(){return "Boost point generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(2)},
            effect(){return new Decimal(hasUpgrade("p",33) ? 3 : 2).pow(player.p.points).pow(0.25).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",21))}`}
        },
        22:{
            title:"Proton boost II",
            description(){return "Boost upquark generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(2)},
            effect(){return new Decimal(10).times(player.p.points).add(1).ln().pow(1.5).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",22))}`}
        },     
        23:{
            title:"Proton boost III",
            description(){return "Boost topquark generation based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(4)},
            effect(){return new Decimal(7).pow(player.p.points).add(1).ln().pow(0.5).max(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",23))}`}
        },
        24:{
            title:"Proton boost IV",
            description(){return "Boost all quark's effect based on your proton."},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(6)},
            effect(){return player.p.points.pow(10).pow(10).add(1).log10().pow(0.3).max(1).min(1e15)},
            effectDisplay(){return `x${format(upgradeEffect("p",24))}`}
        },
        25:{
            title:"Proton boost V",
            description(){return "Point generation is raised to ^1.05 "},
            unlocked(){
                return hasChallenge("p",11)
            },
            cost(){return new Decimal(10)},
        },
        31:{
            title:"Proton boost VI",
            description(){return "Double proton gain."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        32:{
            title:"Proton boost VII",
            description(){return "Increase the effect of 6 types of quarks."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        33:{
            title:"Proton boost VIII",
            description(){return "\"Proton boost\"'s base is 3"},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        34:{
            title:"Proton boost IX",
            description(){return "Point gain is raised to ^1.1"},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        35:{
            title:"Proton boost X",
            description(){return "remove the divisor of \"waiting\"."},
            unlocked(){
                return hasChallenge("p",12)
            },
            cost(){return new Decimal(20)},
        },
        41:{
            title:"Proton boost XI",
            description(){return "Boost proton gain based on your points."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(250)},
            effect(){return player.points.pow(5).add(1).log10().pow(0.2).max(1).times(hasUpgrade("n",61) ? upgradeEffect("n",61) : 1)},
            effectDisplay(){return `x${format(upgradeEffect("p",41))}`}
        },
        42:{
            title:"Proton boost XII",
            description(){return "Boost proton gain based on your bottomquark."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(500)},
            effect(){return player.q.bottom.add(1).log10().pow(0.35).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",42))}`}
        },
        43:{
            title:"Proton boost XIII",
            description(){return "Boost quark gain based on \"Quark boost +++\"'s effect."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(500)},
            effect(){return upgradeEffect("q",61).pow(2).div(6).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",43))}`}
        },
        44:{
            title:"Proton boost XIV",
            description(){return "Boost strangequark gain based on your proton."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(500)},
            effect(){return player.p.points.pow(0.3).add(1).log10().pow(1.2).times(2).add(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",44))}`}
        },
        45:{
            title:"Proton boost XV",
            description(){return "Increase genesis and quark gain base."},
            unlocked(){
                return hasChallenge("p",21)
            },
            cost(){return new Decimal(500)},
        },
        51:{
            title:"Electron boost I",
            description(){return "Electron boost point generation."},
            unlocked(){
                return player.e.unlocked
            },
            cost(){return new Decimal(50000)},
            effect(){return Decimal.pow((hasUpgrade("n",34) ? 2.4 : 1.2),player.e.points).pow(hasUpgrade("n",34) ? 0.6 : 0.3).add(1).times(3).max(1).min(1e20)},
            effectDisplay(){return `x${format(upgradeEffect("p",51))}`}
        },
        52:{
            title:"Electron boost II",
            description(){return "Electron boost proton gain."},
            unlocked(){
                return hasUpgrade("p",51)
            },
            cost(){return new Decimal(100000)},
            effect(){return Decimal.pow(1.05,player.e.points).pow(0.2).add(1).times(5).max(1).min(1e20)},
            effectDisplay(){return `x${format(upgradeEffect("p",52))}`}
        },
        53:{
            title:"Electron boost III",
            description(){return "Electron boost genesis gain."},
            unlocked(){
                return hasUpgrade("p",52)
            },
            cost(){return new Decimal(500000)},
            effect(){return Decimal.pow(1.25,player.e.points).pow(0.2).add(1).times(2).max(1).min(1e20)},
            effectDisplay(){return `x${format(upgradeEffect("p",53))}`}
        },
        54:{
            title:"Electron boost IV",
            description(){return "Electron boost quark gain."},
            unlocked(){
                return hasUpgrade("p",53)
            },
            cost(){return new Decimal(800000)},
            effect(){return Decimal.pow(1.12,player.e.points).pow(0.32).add(1).times(2).max(1).min(1e20)},
            effectDisplay(){return `x${format(upgradeEffect("p",54))}`}
        },
        55:{
            title:"Electron boost V",
            description(){return "Point divides electron price. Unlock a proton challenge."},
            unlocked(){
                return hasUpgrade("p",54)
            },
            cost(){return new Decimal(1000000)},
            effect(){return player.points.add(1).log10().add(1).ln().pow(1.35).add(1).max(1).times(hasUpgrade("n",63) ? upgradeEffect("n",63) : 1)},
            effectDisplay(){return `/${format(upgradeEffect("p",55))}`}
        },
        61:{
            title:"Electron boost VI",
            description(){return "Boost 6 types of quarks gain based on electron."},
            unlocked(){
                return hasChallenge("p",31)
            },
            cost(){return new Decimal(3e6)},
            effect(){return player.e.points.add(1).pow(100).log10().add(1).pow(50).log10().add(1).pow(25).log10().add(1).pow(10).log10().times(player.e.points).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",61))}`}
        },
        62:{
            title:"Electron boost VII",
            description(){return "The power of charging electrons are increased."},
            unlocked(){
                return hasUpgrade("p",61)
            },
            cost(){return new Decimal(1e7)},
        },
        63:{
            title:"Electron boost VIII",
            description(){return "Proton boost itself."},
            unlocked(){
                return hasUpgrade("p",62)
            },
            cost(){return new Decimal(1e8)},
            effect(){return player.p.points.div(3e6).pow(0.25).add(1).min(1e10)},
            effectDisplay(){return `x${format(upgradeEffect("p",63))}`}
        },
        64:{
            title:"Electron boost IX",
            description(){return "\"Electron boost III\" affects bottomquark and \"Proton boost III\" affects to genesis gain."},
            unlocked(){
                return hasUpgrade("p",63)
            },
            cost(){return new Decimal(1e9)},
        },
        65:{
            title:"Electron boost X",
            description(){return "Genesis divides electron price, unlock a proton challenge."},
            unlocked(){
                return hasUpgrade("p",64)
            },
            cost(){return new Decimal(2e9)},
            effect(){return player.g.points.add(1).times(10).log10().pow(0.25).add(1)},
            effectDisplay(){return `/${format(upgradeEffect("p",65))}`}
        },
        71:{
            title:"Electron boost XI",
            description(){return "Remove the debuff of topquark and bottomquark."},
            unlocked(){
                return hasChallenge("p",32)
            },
            cost(){return new Decimal(1e11)},
        },
        72:{
            title:"Electron boost XII",
            description(){return "If you charge electron into points, \"Changing\" will affect point gain as a multiplier too."},
            unlocked(){
                return hasUpgrade("p",71)
            },
            cost(){return new Decimal(2e11)},
        },
        73:{
            title:"Electron boost XIII",
            description(){return "Proton gain is raised to ^1.2, \"Waiting\" affects to genesis."},
            unlocked(){
                return hasUpgrade("p",72)
            },
            cost(){return new Decimal(4e11)},
        },
        74:{
            title:"Electron boost XIV",
            description(){return "If you charge electron into all types of quarks, will increase the effect base of 6 quarks."},
            unlocked(){
                return hasUpgrade("p",73)
            },
            cost(){return new Decimal(4e18)},
        },
        75:{
            title:"Electron boost XV",
            description(){return "Quark divides electron price, unlock a proton challenge."},
            unlocked(){
                return hasUpgrade("p",74)
            },
            cost(){return new Decimal(1e19)},
            effect(){return player.q.points.add(1).log10().add(1).ln().pow(0.8).pow(1.4).max(1)},
            effectDisplay(){return `/${format(upgradeEffect("p",75))}`}
        },
        81:{
            title:"Electron boost XVI",
            description(){return "If you charge electron into genesis, add 0.01 to genesis base."},
            unlocked(){
                return hasChallenge("p",41)
            },
            cost(){return new Decimal(1e24)},
        },
        82:{
            title:"Electron boost XVII",
            description(){return "If you charge electron into quark, add 0.01 to quark base."},
            unlocked(){
                return hasUpgrade("p",81)
            },
            cost(){return new Decimal(3e24)},
        },
        83:{
            title:"Electron boost XVIII",
            description(){return "Increase the effect of row 2 charge."},
            unlocked(){
                return hasUpgrade("p",82)
            },
            cost(){return new Decimal(2e25)},
        },
        84:{
            title:"Electron boost XIX",
            description(){return "If you charge electron into proton, point will boost proton gain."},
            unlocked(){
                return hasUpgrade("p",83)
            },
            cost(){return new Decimal(1e52)},
            effect(){return player.e.onprotonmode ? player.points.add(1).log10().div(4).pow(0.54).min(1e8) : new Decimal(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",84))}`}
        },
        85:{
            title:"Electron boost XX",
            description(){return "Add 7 electron to row 3 effectable electron. Unlock a proton challenge."},
            unlocked(){
                return hasUpgrade("p",84)
            },
            cost(){return new Decimal(2e53)},
        },
        91:{
            title:"Final charge",
            description(){return "The effect of charging proton is effectable out of charging."},
            unlocked(){
                return hasChallenge("p",42)
            },
            cost(){return new Decimal(1e54)},
        },
        92:{
            title:"Defence of quarks",
            description(){return "Charging all types of quarks won't reset these quarks."},
            unlocked(){
                return hasUpgrade("p",91)
            },
            cost(){return new Decimal(1e61)},
        },
        93:{
            title:"Affact chaos",
            description(){return "\"Electron boost XIV\" affects quark's production, \"Proton boost XII\" will divde electron price, \"Electron boost III\" affects proton."},
            unlocked(){
                return hasUpgrade("p",92)
            },
            cost(){return new Decimal(1e64)},
        },
        94:{
            title:"Begone and Beyond",
            description(){return "Charmquark affects to proton gain with a reduced effect."},
            unlocked(){
                return hasUpgrade("p",93)
            },
            cost(){return new Decimal(1e66)},
            effect(){return tmp.q.powerEffofcharm.add(1).log10().pow(0.6).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("p",94))}`}
        },
        95:{
            title:"Last one",
            description(){return "Electron price is square-rooted, unlock neutron."},
            unlocked(){
                return hasUpgrade("p",94)
            },
            cost(){return new Decimal(1e66)},
        },
    },
    challenges:{
        11: {
            name: "No idle",
            challengeDescription: "You lose 10% of your genesis gain on reset every second, genesis generation is disabled.",
            canComplete: function() {return player.points.gte(5e36)},
            goalDescription(){return "5e36 points"},
            rewardDescription(){return "Unlock 5 proton upgrades."},
            unlocked() {
                return hasMilestone("p",3)
            }
        },
        12: {
            name: "Expensive things",
            challengeDescription: "Genesis reqiurement is much increased.",
            canComplete: function() {return player.points.gte(1e43)},
            goalDescription(){return "1e43 points"},
            rewardDescription(){return "Unlock 5 proton upgrades."},
            unlocked() {
                return hasUpgrade("p",21)&&hasUpgrade("p",22)&&hasUpgrade("p",23)&&hasUpgrade("p",24)&&hasUpgrade("p",25)
            }
        },
        21: {
            name: "Unorganize quarks",
            challengeDescription: "Effect of upquark and downquark are disabled.",
            canComplete: function() {return player.points.gte(1e45)},
            goalDescription(){return "1e45 points"},
            rewardDescription(){return "Unlock 5 proton upgrades. Auto generate proton."},
            unlocked() {
                return hasUpgrade("p",31)&&hasUpgrade("p",32)&&hasUpgrade("p",33)&&hasUpgrade("p",34)&&hasUpgrade("p",35)
            }
        },
        22: {
            name: "Before and after",
            challengeDescription: "You can't gain quarks.",
            canComplete: function() {return player.points.gte(2e36)},
            goalDescription(){return "2e36 points"},
            rewardDescription(){return "Unlock electron."},
            unlocked() {
                return hasUpgrade("p",41)&&hasUpgrade("p",42)&&hasUpgrade("p",43)&&hasUpgrade("p",44)&&hasUpgrade("p",45)
            }
        },
        31: {
            name: "Unlucky exponent",
            challengeDescription: "Point gain is raised to ^0.666",
            canComplete: function() {return player.points.gte(1e48)},
            goalDescription(){return "1e48 points"},
            rewardDescription(){return "You can charge electron into point, unlock a proton milestone. x10 proton gain."},
            unlocked() {
                return hasUpgrade("p",55)
            }
        },
        32: {
            name: "Very expensive things",
            challengeDescription: "The reqiurements of genesis and quark are much much increased.",
            canComplete: function() {return player.points.gte(1e78)},
            goalDescription(){return "1e78 points"},
            rewardDescription(){return "You can charge electron into 3 new things, unlock a proton milestone."},
            unlocked() {
                return hasUpgrade("p",65)
            }
        },
        41: {
            name: "Wait....what????",
            challengeDescription: "You can't gain genesis.",
            canComplete: function() {return player.points.gte(1e26)},
            goalDescription(){return "1e26 points"},
            rewardDescription(){return "You can charge electron into 3 new things, unlock a proton milestone."},
            unlocked() {
                return hasUpgrade("p",75)
            }
        },
        42: {
            name: "No adder!",
            challengeDescription: "The effect of \"changing\" is 0.",
            canComplete: function() {return player.points.gte(1e185)},
            goalDescription(){return "1e185 points"},
            rewardDescription(){return "The effect of \"Changing\" is raised to ^1.5"},
            unlocked() {
                return hasUpgrade("p",85)
            }
        },
    }
}),
addLayer("e", {
    name: "electron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        ongenesismode:false,
        onquarkmode:false,
        onpointmode:false,
        onprotonmode:false,
        onsixmode:false,
        onpointexmode:false,
        ongenesisexmode:false,
        onquarkexmode:false,
        onelectronmode:false,
        onneutronmode:false,
        onscoremode:false,
    }},
    color: "#FEEF00",
    requires: new Decimal(1e26), // Can be a function that takes requirement increases into account
    resource: "electron", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base() {
        let base = 2.25
        return base
    },
    exponent() {
        cap = new Decimal(65)
        if (hasChallenge("n",12)) cap = cap.add(3) 
        exp = new Decimal(1.5).add(player.e.points.sub(cap).div(20))
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p",55)) mult = mult.div(upgradeEffect("p",55))
        if (hasUpgrade("p",65)) mult = mult.div(upgradeEffect("p",65))
        if (hasUpgrade("p",75)) mult = mult.div(upgradeEffect("p",75))
        if (hasUpgrade("p",93)) mult = mult.div(upgradeEffect("p",42))
        if (hasUpgrade("n",13)) mult = mult.div(upgradeEffect("n",13))
        if (player.e.onelectronmode) mult = mult.div(tmp.e.effofelectroncharge)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        if (hasUpgrade("p",95)) pow = pow.times(2)
        if (hasUpgrade("n",25)) pow = pow.div(upgradeEffect("n",25))
        if (hasUpgrade("n",35)&&player.e.onelectronmode) pow = pow.div(0.9)
        return pow
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for electron", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    effofgenesischarge(){
        let eff = player.e.points.add(1).log10().pow(2).add(1).pow(1.5).div(hasUpgrade("p",62)? 15 : 25).add(1).max(1).min(2.25)
        return eff
    },
    effofquarkcharge(){
        let eff = player.e.points.add(1).log10().pow(3).add(1).pow(1.4).div(hasUpgrade("p",62) ? 20 : 35).add(1).max(1).min(2.1)
        return eff
    },
    effofpointcharge(){
        let eff = player.e.points.add(player.e.onpointexmode ? tmp.e.effofpointexcharge.add(1) : 1).ln().pow(0.3).times(player.e.points.add(player.e.onpointexmode ? tmp.e.effofpointexcharge : 0)).add(1).log10().pow(1.2).div(hasUpgrade("p",62) ? 10 : 25).add(1).max(1).min(2.5)
        return eff
    },
    effofprotoncharge(){
        let eff = new Decimal(hasUpgrade("p",83) ? 1.28 : 1.25).pow(player.e.points).pow(1.3).add(1).min(1e25)
        return eff
    },
    effofsixcharge(){
        let eff = new Decimal(hasUpgrade("p",83) ? 1.6 : 1.5).pow(player.e.points).pow(0.75).add(1).min(1e25)
        return eff
    },
    effofpointexcharge(){
        let eff = hasUpgrade("n",21) ? player.e.points.add(player.n.score).pow(4).add(1).log10().pow(3) : player.e.points.times(hasUpgrade("p",83)? 0.4 : 0.35)
        return eff
    },
    effofgenesisexcharge(){
        let eff = hasUpgrade("n",22) ? player.e.points.times(player.n.score).add(1).log10().add(1).ln().pow(2.2222).add(1).div(25).max(0).min(0.1) : player.e.points.add(hasUpgrade("p",85) ? 8 : 1).log10().pow(0.7).div(125).min(0.1)
        return eff
    },
    effofquarkexcharge(){
        let eff = hasUpgrade("n",24) ? player.e.points.times(player.n.score).add(1).ln().pow(0.35).div(5).pow(2.333).add(1).log10().max(0).min(0.05) : player.e.points.add(hasUpgrade("p",85) ? 8 : 1).log10().pow(0.75).div(135).min(0.08)
        return eff
    },
    effofelectroncharge(){
        let eff = player.e.points.add(hasUpgrade("p",85) ? 7 : 0).pow(2).add(1).ln().pow(1.4).max(1)
        return eff
    },
    effofneutroncharge(){
        if (!hasUpgrade("n",41)) return new Decimal(1)
        let eff = player.e.points.sub(75).pow(4).add(1).div(20).ln().pow(5).times(2).add(1).max(1)
        return eff
    },
    effofscorecharge(){
        if (!hasUpgrade("n",41)) return new Decimal(0)
        let eff = player.e.points.sub(77).times(4).pow(0.333).div(2)
        return eff
    },
    charging(){
        let now = 0
        if (player.e.ongenesismode) now += 1
        if (player.e.onquarkmode) now += 1
        if (player.e.onpointmode) now += 1
        if (player.e.onprotonmode) now += 1
        if (player.e.onpointexmode) now += 1        
        if (player.e.onsixmode) now += 1
        if (player.e.ongenesisexmode) now += 1
        if (player.e.onquarkexmode) now += 1
        if (player.e.onelectronmode) now += 1
        if (player.e.onneutronmode) now += 1
        if (player.e.onscoremode) now += 1
        return now
    },
    chargelimit(){
        let limit = 1
        if (hasMilestone("p",5)) limit = 2
        if (hasMilestone("p",6)) limit = 3
        if (hasUpgrade("n",15)) limit = 4
        if (hasUpgrade("n",23)) limit = 5
        if (hasUpgrade("n",42)) limit = 6
        if (hasUpgrade("n",53)) limit = 7
        if (hasUpgrade("n",64)) limit = 9
        return limit
    },
    resetsNothing() {return hasMilestone("p",4)},
    layerShown(){return hasChallenge("p",22)||player.e.unlocked},
    tabFormat: ["main-display",
    "prestige-button",
    ["display-text",
    function() {return "You can only charge electron to " + tmp.e.chargelimit + (tmp.e.chargelimit>1 ? " resources!" : " resource!")},
        {}],
    ["display-text",
    function() {return player.e.points.gte(65) ? "electron after 65 is more expensive!" : ""},
        {}],
    "milestones",
    "blank",
    "clickables"],
    branches:["p","q"],
    clickables:{
        11:{
            title(){return player.e.ongenesismode ? "End charging" : "Charge electron into genesis"},
            display(){return `Genesis gain is raised to ^${format(tmp.e.effofgenesischarge)}(Based on your electron).`},
            style:{"height":"150px","width":"150px","background-color":"#FFFFFF"},
            unlocked(){return player.e.unlocked},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.ongenesismode=!player.e.ongenesismode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.ongenesismode}
        },
        12:{
            title(){return player.e.onquarkmode ? "End charging" : "Charge electron into quark"},
            display(){return `Quark gain is raised to ^${format(tmp.e.effofquarkcharge)}(Based on your electron).`},
            style:{"height":"150px","width":"150px","background-color":"#CF2D4E"},
            unlocked(){return player.e.unlocked},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onquarkmode=!player.e.onquarkmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onquarkmode}
        },
        13:{
            title(){return player.e.onpointmode ? "End charging" : "Charge electron into points"},
            display(){return `Point gain is raised to ^${format(tmp.e.effofpointcharge)}(Based on your electron).`},
            style:{"height":"150px","width":"150px","background-color":"#CCCCC1"},
            unlocked(){return hasChallenge("p",31)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onpointmode=!player.e.onpointmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onpointmode}
        },
        21:{
            title(){return player.e.onprotonmode ? "End charging" : "Charge electron into proton"},
            display(){return `Proton gain is multiplied by ${format(tmp.e.effofprotoncharge)}(Based on your electron).`},
            style:{"height":"150px","width":"150px","background-color":"#4565DE"},
            unlocked(){return hasChallenge("p",32)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onprotonmode=!player.e.onprotonmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onprotonmode}
        },
        22:{
            title(){return player.e.onsixmode ? "End charging" : "Charge electron into 6 types of quarks"},
            display(){return `All types of quarks  gain is multiplied by ${format(tmp.e.effofsixcharge)}(Based on your electron)(Will reset all types of quarks!).`},
            style:{"height":"150px","width":"150px","background-color":"#E22343"},
            unlocked(){return hasChallenge("p",32)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                if (!hasUpgrade("p",92)) {
                    player.q.upquark = new Decimal(0)
                    player.q.downquark = new Decimal(0)                
                    player.q.strange = new Decimal(0)                
                    player.q.charm = new Decimal(0)                
                    player.q.top = new Decimal(0)                
                    player.q.bottom = new Decimal(0)
                }
                player.e.onsixmode=!player.e.onsixmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onsixmode}
        },
        23:{
            title(){return player.e.onpointexmode ? "End charging" : "Charge electron into charging points"},
            display(){return `Add ${format(tmp.e.effofpointexcharge)} effectable electron on charging points.(Based on your electron)`},
            style:{"height":"150px","width":"150px","background-color":"#D6D0D5"},
            unlocked(){return hasChallenge("p",32)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onpointexmode=!player.e.onpointexmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onpointexmode}
        },
        31:{
            title(){return player.e.ongenesisexmode ? "End charging" : "Charge electron into genesis base"},
            display(){return `Add ${format(tmp.e.effofgenesisexcharge)} to genesis gain base.(Based on your electron)(You can only choose one between this and genesis base!)`},
            style:{"height":"150px","width":"150px","background-color":"#FFFFFF"},
            unlocked(){return hasChallenge("p",41)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.ongenesisexmode=!player.e.ongenesisexmode
            },
            canClick(){return (!(tmp.e.charging>=tmp.e.chargelimit)&&(!player.e.onquarkexmode)) || player.e.ongenesisexmode}
        },
        32:{
            title(){return player.e.onquarkexmode ? "End charging" : "Charge electron into quark base"},
            display(){return `Add ${format(tmp.e.effofquarkexcharge)} to quark gain base.(Based on your electron)(You can only choose one between this and genesis base!)`},
            style:{"height":"150px","width":"150px","background-color":"#AA2002"},
            unlocked(){return hasChallenge("p",41)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onquarkexmode=!player.e.onquarkexmode
            },
            canClick(){return (!(tmp.e.charging>=tmp.e.chargelimit)&&(!player.e.ongenesisexmode)) || player.e.onquarkexmode}
        },
        33:{
            title(){return player.e.onelectronmode ? "End charging" : "Charge electron into itself"},
            display(){return `Divide electron price by ${format(tmp.e.effofelectroncharge)}.(Based on your electron)`},
            style:{"height":"150px","width":"150px","background-color":"#ECEC4E"},
            unlocked(){return hasChallenge("p",41)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onelectronmode=!player.e.onelectronmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onelectronmode}
        },
        41:{
            title(){return player.e.onneutronmode ? "End charging" : "Charge electron into neutron"},
            display(){return `Multipliy neutron gain by ${format(tmp.e.effofneutroncharge)}.(Based on your electron)`},
            style:{"height":"150px","width":"150px","background-color":"#EF0202"},
            unlocked(){return hasUpgrade("n",41)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onneutronmode = !player.e.onneutronmode
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onneutronmode}
        },
        42:{
            title(){return player.e.onscoremode ? "End charging" : "Charge electron into nuclear score"},
            display(){return `Add ${format(tmp.e.effofscorecharge)} to nuclear score.(Based on your electron)`},
            style:{"height":"150px","width":"150px","background-color":"#FF2345"},
            unlocked(){return hasUpgrade("n",41)},
            onClick(){
                player.points = new Decimal(0)
                player.g.points = new Decimal(0)
                player.q.points = new Decimal(0)
                player.e.onscoremode = !player.e.onscoremode
                player.n.score = new Decimal(0)
            },
            canClick(){return !(tmp.e.charging>=tmp.e.chargelimit) || player.e.onscoremode}
        },
    }
}),
addLayer("n", {
    name: "neutron", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "N", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        score: new Decimal(0),
        c11eff: new Decimal(1),
    }},
    color: "#EF1111",
    requires: new Decimal("1e230"), // Can be a function that takes requirement increases into account
    resource: "neutron", // Name of prestige currency
    baseResource: "quark", // Name of resource prestige is based on
    baseAmount() {return player.q.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() {
        exp = new Decimal(0.005)
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multip lier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("n",12)) mult = mult.times(upgradeEffect("n",12))
        if (hasChallenge("n",11)) mult = mult.times(3)
        if (hasUpgrade("n",31)) mult = mult.times(upgradeEffect("n",31))
        if (hasUpgrade("n",32)) mult = mult.times(upgradeEffect("n",32))
        if (hasUpgrade("n",33)) mult = mult.times(upgradeEffect("n",33))
        if (player.e.onneutronmode) mult = mult.times(tmp.e.effofneutroncharge)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        pow = new Decimal(1)
        if (hasUpgrade("n",65)) pow = pow.times(1.2)
        return pow
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade("p",95)||player.n.unlocked},
    tabFormat: ["main-display",
    ["display-text", 
    function() {return 'You are gaining ' + format(tmp.n.effect) + " neutron per second."},
        {}],
    ["display-text",
    function() {return 'You nuclear score is ' + format(player.n.score) +(hasUpgrade("n",51) ? ".(Based on your proton, electron and neutron)" : ".(Based on your proton and electron)")},
        {}],
    "milestones",
    "blank",
    "upgrades",
    "blank",
    ["display-text",
    function() {return hasUpgrade("n",25) ? "Every neutron challenge is the harder version of its proton challenge!" : ""},
        {}],
    "challenges"],
    branches:["q","e"],
    effect() {
        if (!player.n.unlocked) return new Decimal(0)
        let gain = player.q.points.div(1e230).pow(tmp.n.exponent)
        gain = gain.times(tmp.n.gainMult)
        gain = gain.pow(tmp.n.gainExp)
        return gain
    },
    update(diff) {
        player.n.unlocked = hasUpgrade("p",95)
        if (player.n.unlocked) player.n.points = player.n.points.plus(tmp.n.effect.times(diff));
        if (player.n.unlocked) player.n.score = tmp.n.getscore
        if (player.e.onscoremode) player.n.score = tmp.n.getscore.add(tmp.e.effofscorecharge)
        if (inChallenge("n",11)) player.n.c11eff = player.n.c11eff.times(player.q.upquark.pow(0.2).add(1).log10().pow(2).add(1).times(diff)).max(1)
    },
    getscore() {
        if (!player.n.unlocked) return new Decimal(0)
        let protonscore = player.p.points.add(1).log10().pow(2)
        let electronscore = player.e.points.pow(2)
        let neutronscore = player.n.points.add(1).ln().pow(1.25).times(player.n.points.pow(4).add(1).log10()).max(0)
        let finalscore = protonscore.add(electronscore).div(7500)
        if (hasUpgrade("n",51)) finalscore = protonscore.times(electronscore.pow(3)).add(1).ln().times(neutronscore).add(1).times(electronscore).pow(0.18).max(0)
        if (hasUpgrade("n",14)) finalscore = finalscore.add(upgradeEffect("n",14))
        return finalscore
    },
    upgrades:{
        11:{
            title:"Score to proton",
            description(){return "Boost proton gain based on your nuclear score."},
            unlocked(){
                return true
            },
            cost(){return new Decimal(5)},
            effect(){return player.n.score.add(1).times(100).pow(1.5).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",11))}`}
        },
        12:{
            title:"Score to neutron",
            description(){return "Boost neutron gain based on your nuclear score."},
            unlocked(){
                return hasUpgrade("n",11)
            },
            cost(){return new Decimal(10)},
            effect(){return player.n.score.add(1).pow(2).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",12))}`}
        },
        13:{
            title:"Score to electron",
            description(){return "Divide electron price based on your nuclear score."},
            unlocked(){
                return hasUpgrade("n",12)
            },
            cost(){return new Decimal(50)},
            effect(){return player.n.score.times(5).pow(10).add(1).log10().pow(4).add(1)},
            effectDisplay(){return `/${format(upgradeEffect("n",13))}`}
        },
        14:{
            title:"Score to score",
            description(){return "Increase nuclear score based on your nuclear score."},
            unlocked(){
                return hasUpgrade("n",13)
            },
            cost(){return new Decimal(70)},
            effect(){return player.n.score.pow(0.35).div(10).pow(0.5).div(5)},
            effectDisplay(){return `+${format(upgradeEffect("n",14))}`}
        },
        15:{
            title:"Charmful charge",
            description(){return "You can charge 4 resources in the same time. \"Proton boost XII\" affects charmquark."},
            unlocked(){
                return hasUpgrade("n",14)
            },
            cost(){return new Decimal(70)},
        },
        21:{
            title:"Charging improve I",
            description(){return "If you charge electron into charging points, the effect of \"Waiting\" will raised to ^1.8 and improve the formula of this charging."},
            unlocked(){
                return hasUpgrade("n",15)
            },
            cost(){return new Decimal(100)},
        },
        22:{
            title:"Charging improve II",
            description(){return "If you charge electron into genesis base, gain ^1.25 genesis and improve the formula of this charging."},
            unlocked(){
                return hasUpgrade("n",21)
            },
            cost(){return new Decimal(150)},
        },
        23:{
            title:"Charging improve III",
            description(){return "You can charge 5 resources at the same time."},
            unlocked(){
                return hasUpgrade("n",22)
            },
            cost(){return new Decimal(230)},
        },
        24:{
            title:"Charging improve IV",
            description(){return "If you charge electron into quark base, gain ^1.2 quark and improve the formula of this charging."},
            unlocked(){
                return hasUpgrade("n",23)
            },
            cost(){return new Decimal(30000)},
        },
        25:{
            title:"Electron boost XXI",
            description(){return "Electron reduce the cost of itself, Unlock a neutron challenge."},
            unlocked(){
                return hasUpgrade("n",24)
            },
            cost(){return new Decimal(1e6)},
            effect(){return new Decimal(1).div(player.e.points).times(70).min(1)},
            effectDisplay(){return `^${format(upgradeEffect("n",25))}`}
        },
        31:{
            title:"Neutron boost I",
            description(){return "Genesis boost neutron gain"},
            unlocked(){
                return hasChallenge("n",11)
            },
            cost(){return new Decimal(5e6)},
            effect(){return player.g.points.add(1).ln().pow(0.25).add(1).ln().add(1).pow(3).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",31))}`}
        },
        32:{
            title:"Neutron boost II",
            description(){return "Quark boost neutron gain, add 0.03 to proton gain base."},
            unlocked(){
                return hasChallenge("n",11)
            },
            cost(){return new Decimal(5e7)},
            effect(){return player.q.points.add(1).ln().pow(0.3).add(1).ln().add(1).pow(2).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",32))}`}
        },
        33:{
            title:"Neutron boost III",
            description(){return "Proton boost neutron gain."},
            unlocked(){
                return hasUpgrade("n",32)
            },
            cost(){return new Decimal(4e8)},
            effect(){return player.p.points.add(1).ln().pow(0.45).add(1).ln().add(1).pow(1.5).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",33))}`}
        },
        34:{
            title:"Neutron boost IV",
            description(){return "Double the effect base of \"Electron boost I\"."},
            unlocked(){
                return hasUpgrade("n",33)
            },
            cost(){return new Decimal(2e10)},
        },
        35:{
            title:"Charging improve V",
            description(){return "If you charge electron into itself, electron price will be raised to ^0.9. Unlock a neutron challenge."},
            unlocked(){
                return hasUpgrade("n",34)
            },
            cost(){return new Decimal(3.5e10)},
        },
        41:{
            title:"Electron boost XXII",
            description(){return "You can charge electron into neutron and nuclear score."},
            unlocked(){
                return hasChallenge("n",12)
            },
            cost(){return new Decimal(7e11)},
        },
        42:{
            title:"Electron boost XXIII",
            description(){return "You can charge 6 resources at the same time."},
            unlocked(){
                return hasUpgrade("n",41)
            },
            cost(){return new Decimal(1e12)},
        },
        43:{
            title:"Neutron boost V",
            description(){return "Neutron boost point generation."},
            unlocked(){
                return hasUpgrade("n",42)
            },
            cost(){return new Decimal(1e15)},
            effect(){return player.n.points.pow(0.65).add(1).log10().pow(6).add(1).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",43))}`}
        },
        44:{
            title:"Neutron boost VI",
            description(){return "Increase the effect of topquark and bottom quark."},
            unlocked(){
                return hasUpgrade("n",43)
            },
            cost(){return new Decimal(1e16)},
        },
        45:{
            title:"Major boost of this row VII",
            description(){return "If you charge electron into proton, proton gain will raised to ^1.02, unlock a neutron challenge."},
            unlocked(){
                return hasUpgrade("n",44)
            },
            cost(){return new Decimal(1e22)},
        },
        51:{
            title:"The reqiure of neutron",
            description(){return "Nuclear score is based on proton,electron and neutron now."},
            unlocked(){
                return hasChallenge("n",21)
            },
            cost(){return new Decimal(2e22)},
        },
        52:{
            title:"How do you think of that?",
            description(){return "Imporve the formula of \"Quark boost\"."},
            unlocked(){
                return hasUpgrade("n",51)
            },
            cost(){return new Decimal(6e22)},
        },
        53:{
            title:"Slow down",
            description(){return "You can charge 7 resources at the same time."},
            unlocked(){
                return hasUpgrade("n",52)
            },
            cost(){return new Decimal(6.25e22)},
        },
        54:{
            title:"Careless",
            description(){return "Point gain is raised to ^1.03"},
            unlocked(){
                return hasUpgrade("n",53)
            },
            cost(){return new Decimal(6.5e23)},
        },
        55:{
            title:"Over-increasing",
            description(){return "Neutron delays the hardcap of \"High energy level\""},
            unlocked(){
                return hasUpgrade("n",54)
            },
            cost(){return new Decimal(1e24)},
            effect(){return player.n.points.pow(2).add(1).pow(1.2).add(1).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",55))}`}
        },
        61:{
            title:"Weird boost",
            description(){return "Boost \"Proton boost XI\" based on neutron."},
            unlocked(){
                return hasChallenge("n",22)
            },
            cost(){return new Decimal(1.1e24)},
            effect(){return player.n.points.pow(0.35).add(1).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",61))}`}
        },
        62:{
            title:"Very weird boost",
            description(){return "Boost \"Quark antiboost++++\" based on \"Proton boost XI\"."},
            unlocked(){
                return hasUpgrade("n",61)
            },
            cost(){return new Decimal(3e24)},
            effect(){return upgradeEffect("p",41).pow(3).add(1).log10().pow(1.25).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",62))}`}
        },
        63:{
            title:"Very very weird boost",
            description(){return "Boost \"Electron boost V\" based on \"Quark antiboost++++\"."},
            unlocked(){
                return hasUpgrade("n",62)
            },
            cost(){return new Decimal(4e24)},
            effect(){return upgradeEffect("q",62).add(1).ln().pow(4.5).times(4).max(1)},
            effectDisplay(){return `x${format(upgradeEffect("n",63))}`}
        },
        64:{
            title:"Calm down",
            description(){return "You can charge 9 resources at the same time."},
            unlocked(){
                return hasUpgrade("n",63)
            },
            cost(){return new Decimal(5e24)},
        },
        65:{
            title:"Not calm at all",
            description(){return "Neutron gain is raised to ^1.2, unlock a neutron challenge."},
            unlocked(){
                return hasUpgrade("n",64)
            },
            cost(){return new Decimal(6e24)},
        },
    },
    challenges:{
        11: {
            name: "True-no idle",
            challengeDescription() { return "Divides points gain based on your upquark.<br>Currently: /"+format(player.n.c11eff)},
            canComplete: function() {return player.points.gte("1e520")},
            goalDescription(){return "1e520 points"},
            rewardDescription(){return "Triple neutron gain and unlock a neutron upgrade."},
            unlocked() {
                return hasUpgrade("n",25)
            },
            onExit() {
                player.n.c11eff = new Decimal(1)
            }
        },
        12: {
            name: "True-expensive things",
            challengeDescription() { return "Disable all pre-proton genesis multiplier"},
            canComplete: function() {return player.points.gte("1e640")},
            goalDescription(){return "1e640 points"},
            rewardDescription(){return "Electron cost scaling starts 3 later and unlock a neutron upgrade."},
            unlocked() {
                return hasUpgrade("n",35)
            },
        },
        21: {
            name: "True-unorganized quarks",
            challengeDescription() { return "All quark's basic effect is 1."},
            canComplete: function() {return player.points.gte("1e268")},
            goalDescription(){return "1e268 points"},
            rewardDescription(){return "Unlock a neutron upgrade."},
            unlocked() {
                return hasUpgrade("n",45)
            },
        },
        22: {
            name: "B.E.Y.O.N.D",
            challengeDescription() { return "Quark gain is multiplied by -1. All quark gain power is disabled."},
            canComplete: function() {return player.points.gte("1e195")},
            goalDescription(){return "1e195 points"},
            rewardDescription(){return "Unlock a neutron upgrade."},
            unlocked() {
                return hasUpgrade("n",55)
            },
        },
    }
}),
addLayer("a", {
    startData() { return {
        unlocked: true,
    }},
    color: "yellow",
    row: "side",
    layerShown() {return true}, 
    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    achievements: {
        rows: 17,
        cols: 4,
        11: {
            name: "The beginning",
            done() { return player.g.points.gt(0) },
            tooltip: "Perform a Genesis reset.",
        },
        12: {
            name: "Meanless upgrades",
            done() { return hasUpgrade("g",15) },
            tooltip: "Purchase the \"Major boost in this row I\"",
        },
        13: {
            name: "Boring to Boring",
            done() { return hasUpgrade("g",25) },
            tooltip: "Purchase the \"Major boost in this row II\"",
        },
        14: {
            name: "Big bang",
            done() { return hasUpgrade("g",35) },
            tooltip: "Purchase the \"Big bang\"",
        },
        21: {
            name: "The story just begins",
            done() { return player.q.points.gt(0) },
            tooltip: "Perform a Quark reset.",
        },
        22: {
            name: "No,you must buy it",
            done() { return hasMilestone("q",2) },
            tooltip: "Get all quark milestones",
        },
        23: {
            name: "up to up",
            done() { return player.q.upquark.gte(1e11) },
            tooltip: "Get 1e11 upquark.",
        },
        24: {
            name: "Three by one and two",
            done() { return hasUpgrade("q",65) },
            tooltip: "Purchase all quark upgrades.",
        },
        31: {
            name: "Another annoying thing",
            done() { return player.p.points.gt(0) },
            tooltip: "Perform a Proton reset.",
        },
        32: {
            name: "The chosen one",
            done() { return hasMilestone("p",3) },
            tooltip: "Get 4 proton milestones",
        },
        33: {
            name: "A timewall day",
            done() { return hasChallenge("p",11) },
            tooltip: "Complete \"No idle\".",
        },
        34: {
            name: "Now you understand it!",
            done() { return hasUpgrade("p",45) },
            tooltip: "Purchase \"Proton boost XV\"",
        },
        41: {
            name: "Are they enough?",
            done() { return player.e.points.gt(0) },
            tooltip: "Perform a electron reset.<br>reward:Triple proton gain",
        },
        42: {
            name: "You've learn how to do it",
            done() { return tmp.e.charging>=2 },
            tooltip: "Charge 2 resources at the same time.",
        },
        43: {
            name: "Never enough",
            done() { return player.points.gte("1.8e308") },
            tooltip: "Reach Infinite points.",
        },
        44: {
            name: "LOL",
            done() { return player.e.points.gte(69) },
            tooltip: "Get 69 electron.",
        },
        51: {
            name: "Three by two and one",
            done() { return player.n.points.gt(0) },
            tooltip: "Start generating neutron.",
        },
    update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
        adjustNotificationTime(diff);
    },
    },
    tabFormat: [
        "blank", 
        ["display-text", function() { return "Achievements: "+player.a.achievements.length+"/15" }], 
        "blank", "blank",
        "achievements",
    ],
})

