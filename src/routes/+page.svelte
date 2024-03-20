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
  let author = "Nome Cognome"; // Da configurare

  const API_KEY = "your_api_key"; // Da configurare
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
                : msg
            )
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
      `${BASE_URL}channels/${channelId}/messages?apiKey=${API_KEY}`
    );
    messages.set(await res.json());
  }

  function handleMessageClick(message: Message) {
    alert(message.author);
  }

  async function postMessage() {
    const res = await fetch(
      `${BASE_URL}channels/${$currentChannel}/messages?apiKey=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage, author }),
      }
    );
    newMessage = "";
    const newMsg = await res.json(); // Attendere la risposta del server prima di aggiornare lo stato
    messages.update((msgs) => [...msgs, newMsg]);
  }
</script>

<div class="chat">
  <aside>
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
  </aside>
  <main>
    <ul>
      {#each $messages as message (message.id)}
        <li on:click={() => handleMessageClick(message)}>
          <p>{message.body}</p>
          <small>{message.author}</small>
        </li>
      {/each}
    </ul>
    <form on:submit|preventDefault={postMessage}>
      <input bind:value={newMessage} placeholder="Scrivi un messaggio..." />
      <button type="submit">Invia</button>
    </form>
  </main>
</div>
