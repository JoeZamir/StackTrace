function normalizeUser(rawUser, existingUsers) {
    const { username, fullName, email, password, avatar } = rawUser;

    return {
        id: `u${existingUsers.length + 1}`,
        username,
        fullName,
        displayName: fullName.split(" ")[0],
        email,
        password,
        avatar: avatar || fullName.split(" ").map(name => name[0].toUpperCase()).join(""),
        createdAt: new Date().toISOString(),
    };
}
