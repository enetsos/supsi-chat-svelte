<script lang="ts">
  import Chat from "../components/Chat.svelte";
  import Setting from "../components/Setting.svelte";

  let searchBarVisible = true;
  let showSider = true;
  let url = "https://supsi-ticket.cloudns.org/supsi-chat/bff";
  let websocketUrl =
    "wss://supsi-ticket.cloudns.org/supsi-chat/supsi-chat-websocket";
  let author = "Walter";
  let key = "losa";

  let BASE_URL = "https://supsi-ticket.cloudns.org/supsi-chat/bff";
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

<div class="container-fluid">
  <!-- Chat -->
  <Chat
    bind:searchBarVisible
    bind:showSider
    bind:author
    {key}
    {url}
    {websocketUrl}
  />

  <Setting bind:author bind:searchBarVisible bind:showSider {BASE_URL} />
</div>
