<!-- App.svelte -->
<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let messages = [];
    let newMessage = "";
    let searchTerm = "";
    let currentChannel = "General"; // Initial channel

    const sendMessage = () => {
        if (newMessage.trim() !== "") {
            messages = [
                ...messages,
                {
                    text: newMessage.trim(),
                    fromMe: true,
                    channel: currentChannel,
                },
            ];
            newMessage = "";
        }
    };

    const receiveMessage = () => {
        messages = [
            ...messages,
            {
                text: "Hello, how can I help you?",
                fromMe: false,
                channel: currentChannel,
            },
        ];
    };

    onMount(receiveMessage);

    const switchChannel = (channel) => {
        currentChannel = channel;
        dispatch("channelChange", currentChannel);
    };
</script>

<div class="chat-container">
    <div class="sidebar">
        <h2>Sidebar</h2>
        <ul>
            <li
                on:click={() => switchChannel("General")}
                class:active={currentChannel === "General"}
            >
                General
            </li>
            <li
                on:click={() => switchChannel("Random")}
                class:active={currentChannel === "Random"}
            >
                Random
            </li>
            <!-- Add more channels here -->
        </ul>
    </div>

    <div class="chat">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search messages..."
        />

        <div class="message-list">
            {#each messages.filter((message) => message.channel === currentChannel && message.text
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) as message}
                <div
                    class="message {message.fromMe ? 'from-me' : 'from-others'}"
                >
                    {message.text}
                </div>
            {/each}
        </div>

        <div class="input-bar">
            <input
                type="text"
                bind:value={newMessage}
                on:keydown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
            />
            <button on:click={sendMessage}>Send</button>
        </div>
    </div>
</div>

<style>
    .chat-container {
        display: flex;
        height: 100vh;
    }

    .sidebar {
        width: 20%;
        background-color: #f0f0f0;
        padding: 20px;
        overflow-y: auto;
    }

    .chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        overflow-y: auto;
    }

    .message-list {
        flex: 1;
        overflow-y: auto;
    }

    .message {
        margin-bottom: 10px;
        padding: 5px 10px;
        border-radius: 10px;
        max-width: 70%;
    }

    .message.from-me {
        align-self: flex-end;
        background-color: #e2e2e2;
    }

    .message.from-others {
        align-self: flex-start;
        background-color: #d1e8ff;
    }

    .input-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
    }

    input[type="text"] {
        margin-bottom: 10px;
    }

    .sidebar ul {
        list-style-type: none;
        padding: 0;
    }

    .sidebar ul li {
        cursor: pointer;
        padding: 5px;
    }

    .sidebar ul li.active {
        font-weight: bold;
    }
</style>
