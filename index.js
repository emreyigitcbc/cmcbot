const mineflayer = require('mineflayer');
const settings = require("./settings.json");
var Vec3 = require('vec3').Vec3;
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

require("colors");

let conn_settings = {
    host: settings.server_ip,
    username: settings.username,
    auth: "offline",
    port: 25565,
    version: false,
    password: settings.password,
    verbose: true
}

try {
    console.log("Validating settings...".yellow)
    // Validate settings
    if (settings.server_ip == "") {
        throw new Error("SERVER IP CAN'T BE EMPTY");
    }
    if (settings.username == "") {
        throw new Error("USERNAME CAN'T BE EMPTY");
    }
    if (!settings.server_port) {
        conn_settings.port = 25565
    }
    if (!settings.auto_detect_version) {
        if (!settings.version) {
            conn_settings.version = false;
        } else {
            conn_settings.version = settings.version
        }
    } else {
        conn_settings.version = false;
    }
    if (settings.cracked) {
        conn_settings.auth = "offline"
    } else {
        conn_settings.auth = "microsoft"
    }
    // Start bot
    console.log("Starting bot...".yellow)
    const bot = mineflayer.createBot(conn_settings)
    bot.loadPlugin(pathfinder);
    bot.wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    console.log("Bot connected to %s:%s as %s".green, conn_settings.host, conn_settings.port, conn_settings.username)

    // Bot functions
    bot.triggerMacro = async (macro) => {
        let macroObject = bot.macroList[macro];
        for (let dp of macroObject.depends) {
            if (!bot.initedList.includes(dp)) {
                await bot.triggerMacro(dp)
            }
        }
        bot.initedList.push(macro);
        // execute actions in order
        let counter = 0;
        let repeatLimit = 1;
        let repeatCounter = 0;
        while(counter < macroObject.actions.length && repeatCounter != repeatLimit){
            const act = macroObject.actions[counter];
            if (act?.log) {
                console.log(act?.log)
            }
            try {
                switch (act.action) {
                    case "repeat":
                        repeatLimit = act.times ? act.times : -1;
                        break;
                    case "message":
                        await bot.chat(act.text);
                        break;
                    case "move":
                        await bot.pathfinder.goto(new GoalNear(act.xyz[0], act.xyz[1], act.xyz[2], 0))
                        break;
                    case "call":
                        await bot.triggerMacro(act.macro);
                        break;
                    case "look":
                        await bot.lookAt(new Vec3(act.xyz[0], act.xyz[1], act.xyz[2]));
                        break;
                    case "dig":
                        target = await bot.blockAt(bot.entity.position.offset(act.offset[0], act.offset[1], act.offset[2]))
                        if (target) {
                            try {
                                await bot.dig(target)
                            } catch (err) {
                                console.log(err.stack)
                            }
                        }
                        break;
                    case "nested dig":
                        var dx = act.movement_offset[0];
                        var dy = act.movement_offset[1];
                        var dz = act.movement_offset[2];
                        playerLoc = bot.entity.position;
                        targetList = []

                        var mx = 0, my = 0, mz = 0;
                        if (dx > 0) mx = 1
                        if (dx < 0) mx = -1
                        if (dy > 0) my = 1
                        if (dy < 0) my = -1
                        if (dz > 0) mz = 1
                        if (dz < 0) mz = -1
                        // add first location (it will automatically break the block by given offset)
                        targetList.push(new Vec3(act.first_dig_pos[0], act.first_dig_pos[1], act.first_dig_pos[2]))
                        // i = 1 because we dont need extra x * y * z blocks to be mined
                        for (var i = 1; i < Math.abs(Number(dx || 1) * Number(dy || 1) * Number(dz || 1)); i++) {
                            targetList.push(new Vec3(act.first_dig_pos[0] + (mx * i), act.first_dig_pos[1] + (my * i), act.first_dig_pos[2] + (mz * i)));
                        }
                        await bot.pathfinder.goto(new GoalNear(act.first_dig_pos[0], act.first_dig_pos[1], act.first_dig_pos[2], 0))
                        for (let targetPos of targetList) {
                            playerLoc = bot.entity.position;
                            for (let offset of act.dig_offsets) {
                                target = await bot.blockAt(bot.entity.position.offset(offset[0], offset[1], offset[2]))
                                if (target) {
                                    try {
                                        console.log("Digging: " + target.name + " (%s, %s, %s)", targetPos.x+offset[0],targetPos.y+offset[1],targetPos.z+offset[2])
                                        await bot.dig(target)
                                    } catch (err) {
                                        console.log(err)
                                    }
                                }
                            }
                            var nx = targetPos.x
                            var ny = targetPos.y
                            var nz = targetPos.z
                            if (dx > 0) nx++
                            if (dx < 0) nx--
                            if (dy > 0) ny++
                            if (dy < 0) ny--
                            if (dz > 0) nz++
                            if (dz < 0) nz--
                            console.log("Moving to: " + nx + " " + ny + " " + nz)
                            await bot.pathfinder.goto(new GoalNear(nx, ny, nz, 0))
                        }
                        break;
                    case "open chest":
                        target = await bot.blockAt(bot.entity.position.offset(act.offset[0], act.offset[1], act.offset[2]))
                        await bot.openChest(target);
                        break;
                    case "transfer to chest":
                        items = await bot.inventory.items()
                        for (var item of items) {
                            try {
                                await bot.transfer({
                                    itemType: act.item ? act.item : item.type,
                                    count: act.quantity ? act.quantity : item.count,
                                    sourceStart: 54,
                                    sourceEnd: 90,
                                    destStart: 0,
                                    destEnd: 53
                                })
                            } catch {
                                // empty catch, we dfc if it raises errors
                            }
                        }
                        break;
                    case "close chest":
                        await bot.closeWindow(1);
                        break;
                }
            } catch (err) {
                console.log(err)
            }
            if (act?.wait) {
                await bot.wait(act.wait * 1000);
            }
            counter++;
            if (counter == macroObject.actions.length){
                counter = 0;
                repeatCounter++;
            } 
        }
    }


    // Call handler
    require("./handler")(bot);

    module.exports = {
        bot: bot
    }

} catch (err) {
    console.log(err)
}

