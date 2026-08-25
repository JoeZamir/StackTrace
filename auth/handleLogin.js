import { getData } from "../utils/getData.js";
import { appendData } from "../utils/saveData.js";
import { sanitizeJSON } from "../utils/sanitizeJSON.js";
import { parseJSON } from "../utils/parseJSON.js";
import { sendResponse } from '../utils/sendResponse.js';


export async function handleLogin(req, res) {
    try {
        const rawBody = await parseJSON(req);
        const sanitizedBody = sanitizeJSON(rawBody);
        const { identity, password } = sanitizedBody;

        const users = await getData('users.json');
        const user = users.find(user =>
            (user.username.toLowerCase() === identity?.toLowerCase() || user.email.toLowerCase() === identity?.toLowerCase())
            && user.password === password
        );

        if (!user) {
            sendResponse(res, 401, 'application/json', JSON.stringify({ error: "Invalid credentials" }));
            return;
        }
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;

        sendResponse(res, 200, 'application/json', JSON.stringify(userWithoutPassword));
    }
    catch (error) {
        console.error(error);
        sendResponse(res, 500, 'application/json', JSON.stringify({ error: "Internal Server Error" }));
    }
    return
}
