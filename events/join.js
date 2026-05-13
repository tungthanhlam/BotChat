module.exports = {
    config: {
        name: "Welcome",
        eventType: "log:subscribe",
        description: "Sends a welcome message when a user joins the group."
    },
    run: function({ api, message }) {
        const addedParticipants = message.logMessageData.addedParticipants;
        const botID = api.getCurrentUserID();
        for (let participant of addedParticipants) {
            const userID = participant.userFbId;
            const userName = participant.fullName;
            if (userID === botID) {
                api.sendMessage(`Hello everyone! I'm ${userName}, your friendly bot. I'm here to assist you with various tasks. Feel free to ask me anything!`, message.threadID);
            } else {
                const welcomeText =`🎉 Chào mừng ${userName} đã gia nhập vào group chat của chúng ta! Chúc bạn có những giây phút vui vẻ.`;
                api.sendMessage(welcomeText, message.threadID);
            }
        }
    }
};