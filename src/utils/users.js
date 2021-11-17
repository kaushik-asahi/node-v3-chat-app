const users = [];

//Add users
const addUser = ({ id, userName, room }) => {
  //Clean the data
  userName = userName.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!userName || !room) return { error: "username & room are required" };
  //Check if the userName is taken for that particular room
  const exisitingUser = users.find((user) => {
    return user.room === room && user.userName === userName;
  });
  console.log(exisitingUser, users);
  if (exisitingUser) return { error: "UserName is already in use" };
  // Store user
  const user = { id, userName, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  console.log("IDS", users, id);
  const existingUserIndex = users.findIndex((user) => user.id === id);
  if (existingUserIndex < 0) return { error: "User not found!" };
  else {
    return users.splice(existingUserIndex, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
