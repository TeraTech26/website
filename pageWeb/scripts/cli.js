#!/usr/bin/env node

const micuitDb = require('micuit-db');

const arg = process.argv[2];
const userName = process.argv[3];
const password = process.argv[4];

if (arg == "--help" || arg == "-h") {
    console.log("Usage: npm run cli -- --add <userName> <password>");
    console.log("Usage: npm run cli -- --list");
    console.log("Usage: npm run cli -- --delete <userName>");
}



(async () => {
    await micuitDb.sync();
    if (arg == "--list") {
        //list all users
        console.log("Listing users...");
        const users = await micuitDb.models.user.findAll();
        users.forEach(user => {
            console.log("userName: " + user.name + " password: " + user.password);
        });
        process.exit(0);
    }
    if (arg == "--delete") {
        //delete a user
        console.log("Deleting user...");
        console.log("userName: " + userName);
        await micuitDb.models.user.destroy({
            where: {
                name: userName
            }
        });
        console.log("User deleted");
        process.exit(0);
    }
    if (arg != "--add") {
        console.log("Invalid argument");
        console.log("Usage: npm run cli -- --add <userName> <password>");
        console.log("Usage: npm run cli -- --list");
        console.log("Usage: npm run cli -- --delete <userName>");
        process.exit(0);
    }
    //create a new user
    console.log("Creating user...");
    console.log("userName: " + userName);
    console.log("password: " + password);
    await micuitDb.models.user.create({
        name: userName,
        password: password,
        link:[]
    });
    console.log("User created");
    process.exit(0);
})();