<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import { Client } from "@stomp/stompjs";
  import {
    ListGroup,
    ListGroupItem,
    Input,
    Button,
    Icon,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "@sveltestrap/sveltestrap";

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
  let searchTerm = "";
  let author = "Walter Losa";
  let searchBarVisible = true;
  let sidebar = true;

  const API_KEY = "losa";
  const BASE_URL = "https://supsi-ticket.cloudns.org/supsi-chat/bff/";
  const WS_URL =
    "wss://supsi-ticket.cloudns.org/supsi-chat/supsi-chat-websocket";

  let client = new Client({
    brokerURL: WS_URL,
    onConnect: () => {
      client.subscribe(`/app/${API_KEY}/new-message`, (message) => {
        if (message.body) {
          const newMsg = JSON.parse(message.body);
          messages.update((msgs) => {
            const index = msgs.findIndex((msg) => msg.id === newMsg.id);
            if (index !== -1) {
              msgs[index] = newMsg;
              return msgs.slice();
            } else {
              return [...msgs, newMsg];
            }
          });
        }
      });
    },
  });

  // Event dispatcher for opening/closing the modal
  const dispatch = createEventDispatcher();

  // Modal state
  let isModalOpen = writable(false);

  onMount(async () => {
    const res = await fetch(`${BASE_URL}channels`);
    const data = await res.json();
    channels.set(data);
    const firstChannelId = data[0]?.id;
    currentChannel.set(firstChannelId);
    if (firstChannelId) {
      fetchMessages(firstChannelId);
    }
    client.activate();
  });

  async function fetchMessages(channelId: string) {
    const res = await fetch(
      `${BASE_URL}channels/${channelId}/messages?apiKey=${API_KEY}`,
    );
    messages.set(await res.json());
  }

  async function postMessage() {
    const formData = new FormData();
    formData.append(
      "message",
      new Blob([JSON.stringify({ body: newMessage, author: author })], {
        type: "application/json",
      }),
    );
    formData.append("attachment", new Blob([], { type: "application/json" }));

    const res = await fetch(
      `${BASE_URL}channels/${$currentChannel}/messages?apiKey=${API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.ok) {
      newMessage = "";
    } else {
      console.error("Error:", res.status);
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css"
  />
</svelte:head>

<div class="container-fluid h-100">
  <div class="row h-100">
    <!-- Sidebar -->
    {#if sidebar}
      <div class="col-3 p-0 overflow-auto">
        <div class="sidebar p-3">
          <ListGroup>
            {#each $channels as channel (channel.id)}
              <ListGroupItem
                action
                active={channel.id === $currentChannel}
                on:click={() => {
                  currentChannel.set(channel.id);
                  fetchMessages(channel.id);
                }}
              >
                {channel.name}
              </ListGroupItem>
            {/each}
          </ListGroup>
        </div>
      </div>
    {/if}

    <!-- Chat -->
    <div class="col-9">
      <div class="chat d-flex flex-column h-100">
        <!-- Search Bar -->
        {#if searchBarVisible}
          <div class="search-bar p-3">
            <Input
              type="text"
              bind:value={searchTerm}
              placeholder="Search..."
              class="form-control"
            />
          </div>
        {/if}
        <!-- Messages -->
        <div
          class="flex-grow-1 overflow-auto p-3"
          style="max-height: calc(100vh - 130px);"
        >
          <ListGroup flush>
            {#each $messages.filter((msg) => msg.body
                  .toLocaleLowerCase()
                  .includes(searchTerm.toLowerCase()) || msg.author
                  .toLocaleLowerCase()
                  .includes(searchTerm.toLowerCase())) as message}
              {#if message.author === author}
                <ListGroupItem
                  class="d-inline-flex align-items-end flex-column"
                >
                  <div class="message-author">You</div>
                  <div class="message-body">{message.body}</div>
                </ListGroupItem>
              {/if}
              {#if message.author !== author}
                <ListGroupItem class="d-flex flex-column">
                  <div class="message-author">{message.author}</div>
                  <div class="message-body">{message.body}</div>
                </ListGroupItem>
              {/if}
            {/each}
          </ListGroup>
        </div>

        <!-- Input Message -->
        <form class="p-3">
          <div class="input-group">
            <input
              bind:value={newMessage}
              placeholder="Type a message..."
              class="form-control"
            />
            <Button color="primary" on:click={postMessage}>Send</Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<!-- Setting button -->
<div class="setting-button">
  <Button color="light" on:click={() => isModalOpen.set(true)}>
    <Icon name="gear" />
  </Button>
</div>

<!-- Modal for settings -->
<Modal bind:isOpen={$isModalOpen}>
  <ModalHeader toggle={() => isModalOpen.set(false)}>Settings</ModalHeader>
  <ModalBody>
    <!-- Your settings content here -->
    Nome e cognome dell’autore di nuovi messaggi: <Input
      bind:value={author}
      class="form-control mb-3"
    />
    URL sorgente dei canali/messaggi: <Input
      value={BASE_URL}
      class="form-control mb-3"
    />
    Search: <Input
      type="switch"
      class="form-check-input mb-3"
      bind:checked={searchBarVisible}
    />
    Channels: <Input
      type="switch"
      class="form-check-input"
      bind:checked={sidebar}
    />
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={() => isModalOpen.set(false)}
      >Close</Button
    >
    <!-- Additional buttons for saving settings if needed -->
  </ModalFooter>
</Modal>

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

  .message-author {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .message-body {
    margin-left: 10px;
  }

  .setting-button {
    position: fixed;
    bottom: 10px;
    left: 10px;
  }
</style>
