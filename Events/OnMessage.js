const { bot } = require("../index")

bot.on('messagestr', async (msg) => {
    if(!msg.includes("❤") && !msg.includes("Çiftçilik")) console.log(msg)
})

bot.on('kicked', console.log)
bot.on('error', console.log)
module.exports = {
    name: "onChatMessage"
}