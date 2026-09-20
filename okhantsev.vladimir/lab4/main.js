import {User} from './model.js';

const entityForm = document.querySelector('#entity-form');
const entityList = document.querySelector('#entity-list');
const idInput = entityForm.querySelector('[name="id"]');
const cardTemplate = document.querySelector('#card-template');

idInput.addEventListener('input', () => {
  idInput.setCustomValidity('');
});

function unmarshal(json) {
  return JSON.parse(json).map((raw) => {
    const user = new User(raw.id, raw.name);
    user.friends = raw.friends ?? [];
    return user;
  });
}

let users = unmarshal(localStorage.getItem('users') ?? '[]');

function nextID() {
  let m = 0;
  for (const user of users) {
    m = Math.max(user.id, m);
  }
  return m + 1;
}

function save() {
  localStorage.setItem('users', JSON.stringify(users));
}

function addUser(id, name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      users.push(new User(id, name));
      save();
      resolve();
    }, 300);
  });
}

function removeUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.filter((u) => u.id !== id);
      save();
      resolve();
    }, 300);
  });
}

function addFriend(user, friendId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      user.addFriend(friendId);
      save();
      resolve();
    }, 300);
  });
}

function removeFriend(user, friendId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      user.removeFriend(friendId);
      save();
      resolve();
    }, 300);
  });
}

function render() {
  entityList.innerHTML = '';
  for (const user of users) {
    const card = cardTemplate.content
      .cloneNode(true)
      .querySelector('.entity-card');

    const username = card.querySelector('.entity-card-name');
    const userID = card.querySelector('.entity-card-id');
    const friendsTitle = card.querySelector('.entity-card-friends-title');

    username.textContent = user.name;
    userID.textContent = `ID: ${user.id}`;
    friendsTitle.textContent = `Друзья (${user.friendCount}):`;

    const friends = card.querySelector('.entity-card-friends');
    for (const friendID of user.friends) {
      const li = document.createElement('li');
      li.className = 'entity-card-friend';

      const span = document.createElement('span');
      const friend = users.find((u) => u.id === friendID);
      span.textContent = friend
        ? `${friend.name} (ID: ${friendID})`
        : `ID: ${friendID}`;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'friend-remove';
      removeBtn.textContent = 'Удалить';
      removeBtn.addEventListener('click', async () => {
        await removeFriend(user, friendID);
        render();
      });

      li.append(span, removeBtn);
      friends.appendChild(li);
    }

    const select = card.querySelector('.friend-form-select');
    const others = users.filter(
      (u) => u.id !== user.id && !user.friends.includes(u.id),
    );
    for (const candidateFriend of others) {
      const opt = document.createElement('option');
      opt.value = candidateFriend.id;
      opt.textContent = `${candidateFriend.name} (ID: ${candidateFriend.id})`;
      select.appendChild(opt);
    }

    const addFriendBtn = card.querySelector('.friend-form-add');
    addFriendBtn.addEventListener('click', async () => {
      if (others.length === 0) {
        return;
      }
      await addFriend(user, Number(select.value));
      render();
    });

    const deleteBtn = card.querySelector('.delete-entity');
    deleteBtn.addEventListener('click', async () => {
      await removeUser(user.id);
      render();
    });

    entityList.appendChild(card);
  }
}

entityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(entityForm);
  const id = Number(data.get('id'));
  const name = String(data.get('name'));

  if (users.some((u) => Number(u.id) === id)) {
    idInput.setCustomValidity('Пользователь с таким ID уже существует.');
    entityForm.reportValidity();
    return;
  }

  idInput.setCustomValidity('');
  await addUser(id, name);
  entityForm.reset();
  idInput.value = nextID();

  render();
});

render();

idInput.value = nextID();
