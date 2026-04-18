const Notification = require('../models/Notification');

async function createUserNotification(user, payload) {
  if (!user) {
    return null;
  }

  return Notification.create({
    userId: user._id,
    email: user.email,
    ...payload,
  });
}

module.exports = {
  createUserNotification,
};
