const fs = require("fs");
require('colors');

module.exports = (bot) => {
    // EVENTS
    bot.modules = ["handler.js"]
    // future features :)
    bot.commands = new Map();
    bot.commands_list = { fun: [], general: [], moderation: [], owner: [] }
    bot.cooldown = new Map();
    fs.readdir("./Events/", (err, files) => {
        if (err) console.error(err);
        let eventFiles = files.filter(f => f.split(".").pop() === "js" && !f.startsWith("!"));
        if (eventFiles.length <= 0) return console.log("No events found!".red);
        console.log("%s event found!".yellow, eventFiles.length);
        eventFiles.forEach((f, i) => {
            bot.modules.push("Events/" + f)
            prop = require(`./Events/${f}`);
            console.log("Event '%s' (%s) loaded.".yellow, prop.name, f)
        });
        console.log("All events loaded!".green);
    });
    // COMMANDS (FUTURE FEATURE)
    fs.readdir("./Commands/", (err, files) => {
        if (err) console.error(err);
        let cmdFiles = files.filter(f => f.split(".").pop() === "js" && !f.startsWith("!"));
        if (cmdFiles.length <= 0) return console.log("No commands found!".red);
        console.log("Loading %s commands!".yellow, cmdFiles.length);
        cmdFiles.forEach((f, i) => {
            var props = require(`./Commands/${f}`);
            bot.modules.push("Commands/" + f)
            console.log("Command %s (%s) loaded! (Aliases: %s)".yellow, props.name, f, props.aliases.join(", "))
            bot.commands.set(props.name, props);
            if (!props.hasOwnProperty("aliases")) {
                bot.commands_list[props.category].push(props.name);
            } else {
                if (props.aliases.length > 0) {
                    bot.commands_list[props.category].push(props.name + " (" + props.aliases.join(", ") + ")");
                    props.aliases.forEach(alias => {
                        bot.commands.set(alias, props);
                    });
                } else {
                    bot.commands_list[props.category].push(props.name);
                }
            }
        });
        console.log("All commands loaded!".green);
    });
};