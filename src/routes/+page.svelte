<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import {
        Container,
        Row,
        Col,
        InputGroup,
        Input,
        Button,
        ListGroup,
        ListGroupItem,
    } from "@sveltestrap/sveltestrap";

    const dispatch = createEventDispatcher();

    let messages: { text: string; fromMe: boolean; channel: string }[] = []; // Initialize as an empty array
    let newMessage = "";
    let searchTerm = "";
    let currentChannel = "General"; // Initial channel

    const sendMessage = (): void => {
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
            scrollToBottom(); // Scroll to bottom after sending a message
        }
    };

    const receiveMessage = (): void => {
        messages = [
            ...messages,
            {
                text: "Hello, how can I help you?",
                fromMe: false,
                channel: currentChannel,
            },
        ];
        scrollToBottom(); // Scroll to bottom when receiving a message
    };

    onMount(receiveMessage);

    const switchChannel = (channel: string): void => {
        currentChannel = channel;
        dispatch("channelChange", currentChannel);
    };

    // Function to scroll to the bottom
    const scrollToBottom = (): void => {
        const chatContainer = document.querySelector(".chat-container");
        if (chatContainer instanceof HTMLElement) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    />
</svelte:head>

<Container class="vh-100">
    <Row class="h-100">
        <Col xs="4" style="overflow-y: auto;">
            <h2>Sidebar</h2>
            <ListGroup flush>
                <ListGroupItem on:click={() => switchChannel("General")}>
                    General
                </ListGroupItem>
                <ListGroupItem on:click={() => switchChannel("Random")}>
                    Random
                </ListGroupItem>
            </ListGroup>
        </Col>

        <Col xs="8" class="d-flex flex-column">
            <InputGroup>
                <Input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Search messages..."
                />
            </InputGroup>

            <div
                class="flex-grow-1 overflow-auto chat-container"
                style="max-height: calc(100vh - 120px);"
            >
                {#each messages.filter((message) => message.channel === currentChannel && message.text
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) as message}
                    <div>{message.text}</div>
                {/each}
            </div>

            <InputGroup class="d-flex align-items-end">
                <Input
                    type="text"
                    bind:value={newMessage}
                    on:keydown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                />
                <Button on:click={sendMessage}>Send</Button>
            </InputGroup>

            <!-- Button to scroll to bottom -->
            <Button on:click={scrollToBottom}>Scroll to Bottom</Button>
        </Col>
    </Row>
</Container>

<style>
</style>
