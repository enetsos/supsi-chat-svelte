<script lang="ts">
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

    import { onMount } from "svelte";
    import ChatService from "../services/ChatService";
    import WebSocketService from "../services/WebSocketService";
    import { SvelteToast, toast } from "@zerodevx/svelte-toast";
    import type { Message } from "../types/Message";
    import type { Channel } from "../types/Channel";
    import MessageItem from "./MessageItem.svelte";
    import Siderbar from "./Siderbar.svelte";

    export let searchBarVisible: boolean = true;
    export let showChannels: boolean = true;
    export let author: string;
    export let key: string;
    export let url: string;
    export let websocketUrl: string;

    let searchTerm = "";
    let selectedChannel: Channel | undefined;

    let channels: Channel[] = [];
    let messages: Message[] = [];
    let replyTo: Message | undefined;
    let editMessage: Message | undefined;
    let message = "";
    let file: File | undefined;

    const reset = () => {
        searchTerm = "";
        selectedChannel = undefined;
        channels = [];
        messages = [];
        replyTo = undefined;
        editMessage = undefined;
    };

    const handleOnEdit = ({ detail: message }: CustomEvent<Message>) => {
        editMessage = message;
    };

    const handleOnReply = ({ detail: message }: CustomEvent<Message>) => {
        replyTo = message;
    };

    const handleChannelSelected = (event: CustomEvent<Channel>) => {
        selectedChannel = event.detail;

        const index = channels.findIndex(
            (channel) => channel.id === selectedChannel?.id,
        );
    };

    const createMessage = async (event: MouseEvent) => {
        if (selectedChannel) {
            if (editMessage && editMessage.id) {
                await ChatService.updateMessage(editMessage.id, message);
                editMessage = undefined;
            } else {
                await ChatService.createMessage(
                    selectedChannel.id,
                    {
                        author,
                        body: message,
                        parentMessageId: replyTo?.id,
                    },
                    file,
                );
                replyTo = undefined;
            }
        }
    };

    const onMessage = (msg: Message) => {
        if (msg.author !== author && msg.channelId !== selectedChannel?.id) {
            const index = channels.findIndex(
                (channel) => channel.id === msg.channelId,
            );

            if (index != -1) {
                const channel = channels[index];

                toast.push(
                    `New message from ${msg.author} in ${channel.name}!`,
                );
            }
        }

        if (msg.channelId !== selectedChannel?.id) return;

        messages = [...messages, msg];
    };

    const onMessageUpdate = (updatedMsg: Message) => {
        if (
            updatedMsg.author !== author &&
            updatedMsg.channelId !== selectedChannel?.id
        )
            toast.push(`Updated from ${updatedMsg.author}!`);

        if (updatedMsg.channelId !== selectedChannel?.id) return;

        messages = messages.map((msg) =>
            msg.id === updatedMsg.id ? updatedMsg : msg,
        );
    };

    $: (async () => {
        messages = selectedChannel
            ? await ChatService.getChannelMessages(selectedChannel.id)
            : [];
    })();

    $: {
        reset();

        ChatService.init(url, key);
        ChatService.getChannels().then((ch) => {
            channels = ch;
            selectedChannel = ch[0];
        });

        WebSocketService.deactivate();

        WebSocketService.init(websocketUrl, key, {
            onMessage,
            onMessageUpdate,
        });

        WebSocketService.activate();
    }
    function getParentMessage(message: Message) {
        if (!message.parentMessageId) return;
        return messages.find((msg) => msg.id === message.parentMessageId);
    }

    function scrollDown() {
        const chatContainer = document.querySelector(".chat");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
</script>

<div class="container-fluid h-100">
    <div class="row h-100">
        <!-- Sidebar -->
        {#if showChannels}
            <Siderbar
                {channels}
                {selectedChannel}
                on:channelSelected={handleChannelSelected}
            />
        {/if}
        <div class="col-9">
            <div class=" d-flex flex-column h-100">
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
                    class="chat flex-grow-1 overflow-auto p-3"
                    style="max-height: calc(100vh - 130px);"
                >
                    <ListGroup flush>
                        {#each messages.filter((msg) => msg.body
                                    .toLocaleLowerCase()
                                    .includes(searchTerm.toLowerCase()) || msg.author
                                    .toLocaleLowerCase()
                                    .includes(searchTerm.toLowerCase())) as message}
                            <MessageItem
                                {message}
                                {author}
                                on:edit={handleOnEdit}
                                on:reply={handleOnReply}
                                on:messageClick
                                on:cancel={() => console.log("cancel")}
                                parentMessage={getParentMessage(message)}
                            />
                        {/each}
                    </ListGroup>
                </div>

                <!-- Input Message -->
                <form class="p-3">
                    <div class="input-group">
                        <input
                            bind:value={message}
                            placeholder="Type a message..."
                            class="form-control"
                        />
                        <input type="file" bind:value={file} />
                        <Button color="primary" on:click={createMessage}
                            >Send</Button
                        >
                    </div>
                </form>
                <div class="scroll-down-button">
                    <Button color="primary" on:click={scrollDown}>
                        <Icon name="arrow-down-circle" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .scroll-down-button {
        position: absolute;
        bottom: 70px;
        right: 60px;
    }
</style>
