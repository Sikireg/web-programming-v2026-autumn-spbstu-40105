'use strict';

export class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.friends = [];
  }

  addFriend(id) {
    if (!this.friends.includes(id)) {
      this.friends.push(id);
    }
  }

  removeFriend(id) {
    this.friends = this.friends.filter((someID) => id !== someID);
  }

  get friendCount() {
    return this.friends.length;
  }
}

export function groupUsersByFriendCount(users) {
  const map = new Map();
  for (const user of users) {
    const count = user.friendCount;
    if (!map.has(count)) {
      map.set(count, []);
    }

    map.get(count).push(user);
  }

  return map;
}

export function getUniqueFriends(users) {
  return [...new Set(users.flatMap((u) => u.friends))];
}

export function findUsersWithFriend(users, id) {
  return users.filter((user) => user.friends.includes(id));
}

export function findUsersAboveFriendCount(users, count) {
  return users.filter((user) => user.friendCount > count);
}

export function findUsersWithoutFriends(users) {
  return users.filter((user) => user.friendCount === 0);
}
