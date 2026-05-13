const fs = require("fs");
const path = require("path");
module.exports = {
    config: {
        name: "help",
        description: "Provides a list of available commands and their descriptions.",
        cooldown: 5
    },
    run: function({ api, message, args }) {

        // 1. Read all command files from the "commands" directory
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        const prefix = config.prefix;

        // 2. Auto scan files and extract command names and descriptions
        const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
        const commandsList = [];
        for (const file of commandFiles) {
            const cmd = require(`./${file}`);
            if (cmd.config) {
                commandsList.push(cmd.config);
            }
        }

        // Option 1: context /help
        if (args.length === 0) {
            let helpMessage = `🤖 BẢNG ĐIỀU KHIỂN BOT 🤖\n`;
            helpMessage += `📝 Tiền tố lệnh (Prefix): [ ${prefix} ]\n`;
            helpMessage += `━━━━━━━━━━━━━━━━━━\n\n`

            commandsList.forEach((cmd, index) => {
                helpMessage += `${index + 1}. ${prefix}${cmd.name} - ${cmd.description}\n`;
            });
            helpMessage += `\n💡 Mẹo: Gõ ${prefix}help [tên_lệnh] để xem chi tiết.`;
            helpMessage += `\n📦 Tổng số lệnh hiện có: ${commandsList.length}`;
            return api.sendMessage(helpMessage, message.threadID);
        }

        // Option 2: context /help [command]
        const targetCommand = args[0].toLowerCase();
        const cmdInfo = commandsList.find(cmd => cmd.name === targetCommand);
        if (!cmdInfo) {
            return api.sendMessage(`❌ Không tìm thấy lệnh nào mang tên "${targetCommand}".`, message.threadID);
        }
        
        let detailMessage = `📌 THÔNG TIN LỆNH: ${cmdInfo.name.toUpperCase()}\n`;
        detailMessage += `━━━━━━━━━━━━━━━━━━\n`;
        detailMessage += `📖 Mô tả: ${cmdInfo.description}\n`;
        detailMessage += `⏳ Thời gian chờ (Cooldown): ${cmdInfo.cooldown || 3} giây\n`;
        detailMessage += `⌨️ Cách dùng: ${prefix}${cmdInfo.name}`;
        return api.sendMessage(detailMessage, message.threadID);
    }
};
