import { getData } from "../utils/getData.js";
import { appendData } from "../utils/saveData.js";
import { sanitizeJSON } from "../utils/sanitizeJSON.js";
import { parseJSON } from "../utils/parseJSON.js";
import { sendResponse } from '../utils/sendResponse.js';
import { normalizeUser } from '../utils/normalizeUser.js';

export async function handleSignup(req, res) {


    try {
        const rawBody = await parseJSON(req);
        const sanitizedBody = sanitizeJSON(rawBody);
        const { username, email } = sanitizedBody;

        const users = await getData('users.json');
        const existingUser = users.find(user => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            sendResponse(res, 409, 'application/json', JSON.stringify({ error: "Username or email already exists" }));
            return;
        }

        const newUser = normalizeUser(sanitizedBody, users);

        await appendData('users.json', newUser);

        const userWithoutPassword = { ...newUser };delete userWithoutPassword.password;

        sendResponse(res, 201, 'application/json', JSON.stringify(userWithoutPassword));

    } catch (error) {
        console.log(error);
        sendResponse(res, 500, 'application/json', JSON.stringify({ error: "Internal Server Error" }));
    }
    return
}

