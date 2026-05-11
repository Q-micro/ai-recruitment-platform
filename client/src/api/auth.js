/* The line `import { apiFetch } from "./http";` is importing the `apiFetch` function from a module
located at the relative path "./http". This means that the `apiFetch` function is defined in a
separate file named "http" in the same directory as the current file. By importing it, the
`apiFetch` function can be used within the current file to make HTTP requests. */
import { apiFetch } from "./http";

/**
 * The `login` function sends a POST request to the "/auth/login" endpoint with the provided email and
 * password in JSON format.
 * @param email - The `login` function you provided is used to send a POST request to the "/auth/login"
 * endpoint with the email and password provided as JSON in the request body.
 * @param password - The `login` function you provided takes two parameters: `email` and `password`.
 * The `password` parameter is a string that represents the user's password. It is used along with the
 * `email` parameter to authenticate the user during the login process.
 * @returns The `login` function is returning the result of calling `apiFetch` with the endpoint
 * "/auth/login" and a POST request containing the email and password in JSON format.
 */
export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * The `signup` function sends a POST request to the "/auth/signup" endpoint with the provided payload
 * data.
 * @param payload - The `signup` function is used to send a POST request to the "/auth/signup" endpoint
 * with the provided payload data. The payload typically contains user information required for signing
 * up, such as username, email, and password. The payload is expected to be in JSON format.
 * @returns The `signup` function is returning the result of calling `apiFetch` with the endpoint
 * "/auth/signup" and a POST request containing the `payload` data in JSON format.
 */
export function signup(payload) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
