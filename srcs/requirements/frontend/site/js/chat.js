let socket_users = null;

async function updateFriendList(data) {
  const friendListContainer = document.getElementById("chat-users");
  if (!friendListContainer) {
    console.error("❌ Friend list container not found!");
    return;
  }

  friendListContainer.innerHTML = "";

  data.forEach((friend) => {
    const friendElement = document.createElement("li");
    friendElement.classList.add("chat-user");
    friendElement.setAttribute("data-id", friend.id);
    friendElement.setAttribute("data-username", friend.username);
    friendElement.setAttribute("data-action", "open-chat");
    friendElement.innerHTML = friend.username;
    if (friend.online) friendElement.classList.add("user-online");
    friendListContainer.appendChild(friendElement);
  });
}

export async function connectSocketUsers() {
  if (socket_users != null) return;
  socket_users = new WebSocket("/ws/users/");

  socket_users.onopen = function () {
    console.log("✅ WebSocket Users connected!");
  };

  socket_users.onerror = function (error) {
    console.error("❌ WebSocket Users error:", error);
  };

  socket_users.onclose = function () {
    console.log("🔴 WebSocket Users closed.");
    socket_users = null;
    const friendListContainer = document.getElementById("chat-users");
    friendListContainer.innerHTML = "";
  };

  socket_users.onmessage = function (event) {
    console.log("Received: ", event);
    const data = JSON.parse(event.data);

    if (data.type === "update") return updateFriendList(data.data);
    if (data.type === "offline") return lastMsgNotReceived(data.receiver);
    if (data.type === "message") return addMessageUi(data.sender, data.message, false)
  };
}

export async function disconnectSocketUsers() {
  if (socket_users === null) return;
  socket_users.close();
  socket_users = null;
}

function chatBubbleContent(id, username)
{
  const content = `
    <button type="button" class="btn btn-chat btn-secondary dropdown-toggle"
    data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,10"
    id="dropdown-toggle-$id">
    $username
    </button>
    <ul class="dropdown-menu">
      <div class="d-flex flex-column">
        <div class="msg-area d-flex flex-column flex-fill flex-column-reverse"
        id="msg-area-$id">
        </div>
        <li><hr class="dropdown-divider"></li>
        <input id="chat-input-$id" data-id=$id type="text"
        class="form-control" placeholder=""/>
      </div>
    </ul>`;
    return (content.replaceAll("$id", id).replaceAll("$username", username));
}

function sendChatMessage(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const user_id = event.target.dataset.id;
    const msg = event.target.value;
    socket_users.send(
      JSON.stringify({
        receiver: user_id,
        message: msg,
      })
    );
    event.target.value = "";
    addMessageUi(user_id, msg, true);
  }
}

function createMessageUi(msg, sent=true)
{
  const msgUi = document.createElement("li");
  msgUi.innerText = msg;
  msgUi.classList.add("msg");
  if (sent)
    msgUi.classList.add("msg-sent");
  else
    msgUi.classList.add("msg-received");
  return msgUi;
}

function addMessageUi(id, msg, sent=true)
{
  const bubble = createChatBubbleById(id, false);
  const msgArea = getMessageArea(id);
  msgArea.prepend(createMessageUi(msg, sent));
  msgArea.scrollTop = msgArea.scrollHeight;
  if (sent === false && !bubble.firstElementChild.classList.contains("show"))
    bubble.firstElementChild.classList.add("flickering");
}

function lastMsgNotReceived(id, msg)
{
  const msgArea = getMessageArea(id);
  msgArea.firstChild.classList.add("msg-alert");
  const offlineMsg = document.createElement("li");
  offlineMsg.classList.add("offline");
  offlineMsg.innerText = "User is offline."
  msgArea.prepend(offlineMsg);
}

export function createChatBubble(element, event, open=true) {
  const user_id = element.dataset.id;
  const username = element.dataset.username;
  var bubble = getChatBubble(user_id);

  if (bubble) {
    if (open)
      setTimeout(() => {openDropDown(user_id);}, 50);    
    return bubble
  };

  bubble = document.createElement("div");
  bubble.classList.add("btn-group", "dropup", "dropup-chat");
  bubble.id = "bubble-" + user_id;
  bubble.innerHTML = chatBubbleContent(user_id, username);
  bubble.addEventListener("click", setFlickering);
  getFooter().appendChild(bubble);
  getChatInput(user_id).addEventListener("keydown", sendChatMessage);
  if (open)
    setTimeout(() => {openDropDown(user_id);}, 50);
  return bubble;
}

function setFlickering(event)
{
  event.target.classList.remove("flickering");
}

export function createChatBubbleById(id, open)
{
  const element = document.querySelector(`[data-id="` + id + `"`);
  return createChatBubble(element, null, open);
}

function getChatBubble(id)
{
  return document.getElementById("bubble-" + id);
}

function getChatInput(id)
{
  return document.getElementById("chat-input-" + id);
}

function getMessageArea(id)
{
  return document.getElementById("msg-area-" + id);
}

function getFooter()
{
  return document.getElementsByTagName("footer")[0];
}

function openDropDown(id)
{
  var dropdown = document.getElementById("dropdown-toggle-" + id);
  var dropdownInstance = new bootstrap.Dropdown(dropdown);
  dropdownInstance.show();
}

export const chatActions = [
  {
    selector: '[data-action="open-chat"]',
    handler: createChatBubble,
  },
  {
    selector: '[data-action="connect-chat"]',
    handler: connectSocketUsers,
  }
];

export default connectSocketUsers;
