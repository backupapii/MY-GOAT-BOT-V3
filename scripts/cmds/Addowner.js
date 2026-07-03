module.exports = {
  config: {
    name: "addowner",
    version: "1.0",
    author: "𝗦𝗛𝗔𝗞𝗜𝗟-𝗛𝗢𝗦𝗦𝗘𝗡",
    countDown: 5,
    role: 0,
    shortDescription: "Add bot owner to group",
    category: "group",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const ownerID = "61579901465090"; // Owner Facebook ID

    try {
      await api.addUserToGroup(ownerID, event.threadID);
      api.sendMessage(
        "〲ashikツ࿐ ke group e add kora holo.",
        event.threadID
      );
    } catch (e) {
      api.sendMessage(
        "〲ashikツ࿐ ke add kora jay nai. Bot admin na hole add korte parbe na.",
        event.threadID
      );
    }
  }
};
