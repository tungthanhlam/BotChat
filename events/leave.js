module.exports = {
    config: {
        name: "Leave",
        eventType: "log:unsubscribe",
        description: "Sends a goodbye message when a user leaves the group."
    },
    run: async function({ api, message }) {
        const leftParticipantID = message.logMessageData.leftParticipantFbId;
        const authorID = message.author;
        const botID = api.getCurrentUserID();

        if (leftParticipantID === botID) {
            console.log("[INFO] Bot has left the group.");
            return;
        }

        try {
            const userInfo = await api.getUserInfo(leftParticipantID);
            const userName = userInfo[leftParticipantID]?.name || "Một thành viên";
            let text = "";
            if (leftParticipantID === authorID) {
                text = `👋 Chào tạm biệt ${userName}`;
            } else {
                text = `🥾 Cảnh báo: ${userName} vừa bị bay màu khỏi nhóm bởi Quản trị viên!`;
            }
            api.sendMessage(text, message.threadID);
        } catch (error) {
            console.error(`[ERROR] Failed to fetch user info for ID ${leftParticipantID}:`, error);
            api.sendMessage(`👋 Chào tạm biệt một thành viên đã rời khỏi nhóm.`, message.threadID);
        }
    }
};