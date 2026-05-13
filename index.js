const fs = require('fs');
const path = require('path');
const login = require("fca-unofficial");

// Load config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const prefix = config.prefix;

// Create Map
const commands = new Map();
const cooldowns = new Map(); // Command cooldowns
// Events Map
const events = new Map();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
// If commands folder doesn't exist, create it
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Load each command
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.set(command.config.name, command);
    console.log(`[INFO] Loaded command: ${command.config.name} successfully.`);
}

// Load events
const eventsPath = path.join(__dirname, 'events');
// If events folder doesn't exist, create it
if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath);
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
// Load each event
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    // Save the event in the events Map with the event name as the key
    events.set(event.config.eventType, event);
    console.log(`[INFO] Loaded event: ${event.config.eventType} successfully.`);
}

// Login to Facebook
const loginData = {appState: JSON.parse(fs.readFileSync('./Cookies.json', 'utf-8'))};

login(loginData, (err, api) => {
    if (err) return console.error("[ERROR] Failed to login:", err);
    console.log("[INFO] Bot already!");

    // Listen for messages
    api.listenMqtt((err, message) => {
        if (err) return console.error(err);

        // Only process if it's a message and contains a prefix "/"
        if (message.type === "message" && message.body.startsWith(prefix)) {
            const args = message.body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (command.has(commandName)) {
                const cmd = command.get(commandName);

                // Check for cooldown
                if (!cooldowns.has(commandName)) {
                    cooldowns.set(commandName, new Map());
                }

                const now = Date.now();
                const timestamps = cooldowns.get(commandName);

                // Get the cooldown time from the command configuration; if none is available, the default is 3 seconds.
                const cooldownAmount = (cmd.config.cooldown || 3) * 1000;
                const senderID = message.senderID; // Get the sender's ID

                if (timestamps.has(senderID)) {
                    const expirationTime = timestamps.get(senderID) + cooldownAmount;

                    // If the command is still on cooldown, send a message to the user
                    if (now < expirationTime) {
                        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                        return;
                    }
                }

                timestamps.set(senderID, now);

                try {
                    cmd.run({ api, message, args });
                } catch (error) {
                    console.error(`[ERROR] Failed to execute command ${commandName}:`, error);
                    api.sendMessage("An error occurred while executing the command.", message.threadID);
                }
            } else {
                api.sendMessage("Unknown command. Please command /help to see the list of available commands.", message.threadID);
            }
        }

        // Handle events
        if (message.type === "event") {
            const eventType = message.logMessageType;
            if (events.has(eventType)) {
                const eventModule = events.get(eventType);
                try {
                    eventModule.run({ api, message });
                } catch (error) {
                    console.error(`[ERROR] Failed to execute event ${eventType}:`, error);
                }
            }
        }
    });
});