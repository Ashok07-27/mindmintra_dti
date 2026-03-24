const Chat = require("./Chat");

async function sendMessage(req, res) {
  try {
    const { receiverId, message } = req.body;

    const chat = await Chat.create({
      senderId: req.user._id,
      receiverId,
      message,
    });

    if (req.io) {
      req.io.to(receiverId.toString()).emit("chat:message", chat);
      req.io.to(req.user._id.toString()).emit("chat:message", chat);
    }

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const { userId } = req.params;
    const messages = await Chat.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { sendMessage, getMessages };



