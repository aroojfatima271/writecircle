const Notification = require('../models/Notification');

// Centralizes notification creation so controllers stay thin and every
// notification looks/behaves consistently (used by critique, comment,
// circle-join, and admin-resolution flows).
const createNotification = async ({ recipient, actor, type, message, link }) => {
  if (String(recipient) === String(actor)) return null; // don't notify yourself
  return Notification.create({ recipient, actor, type, message, link });
};

module.exports = { createNotification };
