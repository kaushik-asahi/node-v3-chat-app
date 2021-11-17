const socket = io();
// socket.on("countUpdated", (count) => {
//   console.log("Count Has beed updated!", count);
// });
// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("clicked");
//     socket.emit("increment");
//   });

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationSelectorButton = document.querySelector("#sendLocation");

const $messages = document.querySelector("#messages");
const $sidebar = document.getElementById("sidebar");
// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;
//Options
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //Latest Message element
  const $latestMessage = $messages.lastElementChild;
  //height of latest message
  const latestMsgStyles = getComputedStyle($latestMessage);
  const latestMsgMargin = parseInt(latestMsgStyles.marginBottom);
  const latestMessageHeight = $latestMessage.offsetHeight;
  //Visible Height
  const visibleHeight = $messages.offsetHeight;
  // height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - latestMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
  console.log(latestMessageHeight, latestMsgMargin);
};

socket.on("message", (response) => {
  const html = Mustache.render(messageTemplate, {
    message: response.message,
    userName: response.userName,
    createdAt: moment(response.createdAt).format("hh:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (response) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: response.message,
    userName: response.userName,
    createdAt: new Date(response.createdAt).toDateString(),
    message: `Shared Location`,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = $messageFormInput.value;
  //disable form
  $messageFormButton.setAttribute("disabled", "disabled");
  $messageFormInput.value = "";
  $messageFormInput.focus();

  // const message = document.querySelector("input").value;

  socket.emit("sendMessage", message, (error) => {
    //enable the form
    $messageFormButton.removeAttribute("disabled");
    if (error) console.error(error);
    else console.log("Message delivered successfully!");
  });
});

$locationSelectorButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $locationSelectorButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationSelectorButton.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { userName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
