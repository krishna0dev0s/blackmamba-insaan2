const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = "sk-fy9AiAifS-hArVaw3RuUnKPfsuNKAhOPK3lSZhFQDyT3BlbkFJCsGivEvCohox8wNZKnDOdPZ_JJF6BxjOhnZRcgKKgA";  // Note: Ideally, keep your API key server-side to prevent exposure.

// Function to create chat elements dynamically in the DOM
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    const iconHTML = className === "outgoing" ? "" : `<span class="material-symbols-outlined">smart_toy</span>`;
    let chatContent = `<p>${iconHTML}${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

// Function to handle API requests with error handling

const generateResponse = () => {
    const API_URL = "https://api.openai.com/v1/chat/completions";

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: userMessage}]
        })
    };

    fetchWithRetry(API_URL, requestOptions, 3, 1000)
        .then(data => {
            console.log(data);
            // Append response to chatbox or handle data otherwise
        })
        .catch((error) => {
            console.error("Error fetching response:", error);
            // Notify user of error, e.g., by updating the chatbox with an error message
        });
};

// Function implementing exponential backoff
const fetchWithRetry = async (url, options, retries = 3) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get('Retry-After') || 5;  // Use the Retry-After header or default to 5 seconds
                const delay = parseInt(retryAfter, 10) * 1000;  // Convert to milliseconds
                console.log(`Rate limit hit. Retrying in ${delay} ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(url, options, retries - 1);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
};



// Function to handle user's chat input
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;  // If the message is empty, do nothing

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));  // Append user's message to chatbox
    chatInput.value = "";  // Clear the input field

    // Simulate the AI thinking before providing a response
    setTimeout(() => {
        chatbox.appendChild(createChatLi("Thinking...", "incoming"));
        generateResponse();  // Generate AI's response after a delay
    }, 600);
};

sendChatBtn.addEventListener("click", handleChat);  // Attach event listener to send button

// Handle "Enter" key to send chat
chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();  // Prevent the default action of the enter key
        handleChat();
    }
});
