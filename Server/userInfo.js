const users = [];

// joinar användare till chatten
const userJoin = (id, username, room) => {
  const user = {id, username, room};

  users.push(user);

  return user;
};

// Hämtar specifik användare
const getSpecificUser = (id) => {
  return users.find(user => user.id === id);
};

// När en användare lämnar chatten!
const userLeaveChat = (id) => {
  const idx = users.findIndex(user => user.id === id);

  if (idx !== -1) return users.splice(idx, 1)[0];
};

// Hämtar rummet som användaren är inne i
const getUserRoom = (room) => {
  return users.filter(user => user.room === room);
};

module.exports = {
  userJoin,
  getSpecificUser,
  userLeaveChat,
  getUserRoom
};