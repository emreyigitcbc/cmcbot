const fs = require("fs");
require('colors');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

const { bot } = require("../index")

// change it to "spawn" if bot is not working
bot.once('login', async () => {
    // Start visuals if you want
    //mineflayerViewer(bot, { port: 3001 })
    //inventoryViewer(bot)
    // inventory viewer port: 3000
    bot.defaultMove = new Movements(bot)
    await bot.pathfinder.setMovements(bot.defaultMove)

    // Start macros
    bot.macroList = []
    bot.initedList = []
    bot.macroNames = {}
    bot.runAfter = [];
    bot.actionGroups = {};
    let files = fs.readdirSync("Macros");
    files = files.filter(x => x.endsWith(".json"))
    // IT CAN RUN ONLY 1 "START" TRIGGER
    let closed = false;
    for (let file of files) {
        let x = require("../Macros/" + file)
        let macroName = file.replace(".json", "")
        bot.macroList[macroName] = x;
        if (x.trigger == "start") {
            await bot.triggerMacro(macroName)
            closed = true;
        } else {
            bot.runAfter.push(macroName);
        }
    }
    for (let macro of bot.runAfter) {
        if (!bot.initedList.includes(macro)) {
            await bot.triggerMacro(macro)
        }
    }
})

module.exports = {
    name: "onBotStart"
}