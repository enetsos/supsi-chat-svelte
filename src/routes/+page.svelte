<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { Client } from "@stomp/stompjs";

  interface Message {
    id: string;
    body: string;
    author: string;
  }

  interface Channel {
    id: string;
    name: string;
  }

  let messages = writable<Message[]>([]);
  let channels = writable<Channel[]>([]);
  let currentChannel = writable<string | null>(null);
  let newMessage = "";
  let searchQuery = "";
  let author = "Walter Losa"; // Da configurare

  const API_KEY = "losa"; // Da configurare
  const BASE_URL = "https://supsi-ticket.cloudns.org/supsi-chat/bff/";
  const WS_URL =
    "wss://supsi-ticket.cloudns.org/supsi-chat/supsi-chat-websocket";

  let client = new Client({
    brokerURL: WS_URL,
    onConnect: () => {
      client.subscribe(`/app/${API_KEY}/new-message`, (message) => {
        if (message.body) {
          messages.update((msgs) => [...msgs, JSON.parse(message.body)]);
        }
      });
      client.subscribe(`/app/${API_KEY}/update-message`, (message) => {
        if (message.body) {
          messages.update((msgs) =>
            msgs.map((msg) =>
              msg.id === JSON.parse(message.body).id
                ? JSON.parse(message.body)
                : msg,
            ),
          );
        }
      });
    },
  });

  onMount(async () => {
    const res = await fetch(`${BASE_URL}channels`);
    channels.set(await res.json());
    client.activate();
  });

  async function fetchMessages(channelId: string) {
    const res = await fetch(
      `${BASE_URL}channels/${channelId}/messages?apiKey=${API_KEY}`,
    );
    messages.set(await res.json());
  }

  async function postMessage() {
    // Create a FormData object to send the multipart form data
    const formData = new FormData();

    // Add the message details to the FormData object as a JSON string
    formData.append(
      "message",
      new Blob([JSON.stringify({ body: newMessage, author: author })], {
        type: "application/json",
      }),
    );

    // Add the attachment to the FormData object and new blob if not present
    formData.append("attachment", new Blob([], { type: "application/json" }));

    // Make the POST request
    const res = await fetch(
      `${BASE_URL}channels/${$currentChannel}/messages?apiKey=${API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    // Check if the request was successful
    if (res.ok) {
      // Parse the response JSON
      const newMsg = await res.json();

      // Update the messages store with the new message
      messages.update((msgs) => [...msgs, newMsg]);

      // Reset the newMessage variable
      newMessage = "";
    } else {
      // Handle error response
      console.error("Error:", res.status);
    }
  }
</script>

/<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
  />
</svelte:head>

<div class="container-fluid h-100">
  <div class="row h-100">
    <!-- Sidebar -->
    <div class="col-3 p-0 overflow-auto">
      <div class="sidebar p-3">
        <ul>
          {#each $channels as channel (channel.id)}
            <li
              on:click={() => {
                currentChannel.set(channel.id);
                fetchMessages(channel.id);
              }}
            >
              {channel.name}
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <!-- Chat -->
    <div class="col-9">
      <div class="chat d-flex flex-column h-100">
        <!-- Search Bar -->
        <div class="search-bar p-3">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search..."
            class="form-control"
          />
        </div>
        <!-- Messages -->
        <div
          class="flex-grow-1 overflow-auto p-3"
          style="max-height: calc(100vh - 130px);"
        >
          <ul>
            {#each $messages as message (message.id)}
              <li>
                <p>{message.body}</p>
                <small>{message.author}</small>
              </li>
            {/each}
          </ul>
        </div>
        <!-- Input Message -->
        <form class="p-3">
          <div class="input-group">
            <input
              bind:value={newMessage}
              placeholder="Type a message..."
              class="form-control"
            />
            <button type="button" class="btn btn-primary" on:click={postMessage}
              >Send</button
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  .container-fluid {
    height: 100vh;
  }
  .sidebar {
    border-right: 1px solid #ccc;
    height: 100%;
  }
  .chat {
    border: 1px solid #ccc;
    height: 100%;
  }
  .search-bar {
    border-bottom: 1px solid #ccc;
  }
</style>
