
# Cebeci Minecraft Bot

Uses [mineflayer](https://github.com/PrismarineJS/mineflayer) module to control minecraft.

You can write own macros to make AFK farms when a server banned redstone objects.

### Usage
You can change `settings.json` as you wish.
```json
{
    "cracked": true,

    "server_ip": "server.ip", 
    "server_port" : 25565,

    "username": "SomeNick",
    "password": "NOT NEEDED FOR CRACKED SERVERS", // ignored if cracked is true

    "auto_detect_version": true,
    "version": "1.20.1" // ignored if auto detect is true
}
```

You can write your own macros.

Macro files must be in `Macros` folder and in `json` format.

#### Macro File Structure:
```json
{
    "trigger": "start", 
    "depends": [],
    "actions": [
        {
            "action": "message",
            "text": "/l password",
            "log": "Sent Login Message, (waiting 10 secs)",
            "wait": 10
        },
        {
            "action": "message",
            "text": "/server survival",
            "wait": 10,
            "log": "Sent Connect message. (waiting 10 secs)"
        }
    ]
}
```
- `trigger`: How this macro triggered. There is only "start" trigger for now. You can write anything except "start" on your other macro files because only one "start" macro will be triggered.
- `depends`: Which macros does it need to be triggered. (It is a list of file names except `.json` extension)
- `actions`: It is a ordered-list. Every action in this list will be executed in order.

#### Action Structure:
- **Action List:**
- ___message___
- - _text: message (string)_ 
- ___move___ moves player to specified coordinates
- - _xyz: array of coordinates [x,y,z]_ 
- ___look___ looks at specific position
- - _xyz: array of offsets [x,y,z]_ 
- ___call___ triggers macro
- - _macro: macroName (string)_ 
- ___dig___ digs the block in near it
- - _offset: array of offsets [x,y,z]_ 
- ___repeat___ specifies how many times that this macro be repeated
- - _times: count (number)_ 
- ___close chest___ closes chest window
- ___open chest___ opens the chest in specificied offsets
- - _offset: array of offsets [x,y,z]_ 
- ___transfer to chest___ transfers items from inventory to chest
- - _item: id of item (int) (0 for eveything)_ 
- - _quantity: quantity of item (int) (0 for all)_ 
- ___nested dig___ digs specific area
- - _first_dig_pos: array of coordinates (it is the XYZ of IN FRONT OF the area (or top, bottom, behind), IT IS NOT THE FIRST BLOCK THAT WILL BE BREAK) [x,y,z]_ 
- - _movement_offset: array of offsets [x,y,z] (HOW MANY BLOCKS SHOULD BOT GO?)_
- - _dig_offsets: array of array offsets [[x,y,z],[x2,y2,z2]] (WHERE TO BREAK AFTER MOVE)_ 
- **Global Action Keys:**
- _wait: seconds (int)_ waits after action is done
- _log: message (string)_ logs message to console

You can check my own macro for my [`Suger Cane`](https://github.com/emreyigitcbc/cmcbot/blob/main/Macros/AutoSugerCane.json) farm if you want to understand more.

### Installation
You don't need install any external program. It can work with node modules.
`npm install` to install node modules in current working directory.

