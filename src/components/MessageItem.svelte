<script lang="ts">
    import type { Message } from "../types/Message";
    import type { Attachment } from "../types/Attachment";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let message: Message;
    export let parentMessage: Message | undefined;
    export let author: string;
    let attachment: Attachment;

    let ogTags: Record<string, string> = {};

    const editMessage = () => {
        dispatch("edit", message);
    };

    const replyToMessage = () => {
        dispatch("reply", message);
    };

    const handleClick = (event: MouseEvent) => {
        if ((event.target as HTMLElement).nodeName !== "BUTTON")
            dispatch("messageClick", message);
    };

    const handleCancel = () => {
        dispatch("cancel");
    };
</script>

<div
    role="presentation"
    class="flex {message.author === author
        ? 'justify-end'
        : 'justify-start'} items-start"
    on:click={handleClick}
>
    <div class="ml-4 bg-gray-800 p-4 rounded-lg">
        <div class="d-flex justify-content-between">
            <p class="text-sm font-medium text-gray-400">{message.author}</p>
            {#if message.lastEditTime !== message.date}
                <p
                    class="text-xs text-gray-300"
                    title="Edited at {new Date(
                        message.lastEditTime,
                    ).toLocaleString()}"
                >
                    Edited
                </p>
            {/if}
        </div>
        {#if parentMessage}
            <div class="ml-4 bg-gray-700 p-2 rounded-lg">
                <p class="text-xs text-gray-300">Replying to:</p>
                <p class="text-sm text-gray-400">{parentMessage.body}</p>
            </div>
        {/if}
        <p class="text-gray-200">{message.body}</p>
        <div class="d-flex justify-content-between align-items-center mt-1">
            <p class="text-xs text-gray-300">
                {new Date(message.date).toLocaleString()}
            </p>
            <div class="d-flex align-items-center">
                <button
                    class="btn btn-link text-xs text-gray-300"
                    on:click={replyToMessage}
                >
                    Reply
                </button>
                {#if message.author === author}
                    <button
                        class="btn btn-link text-xs text-gray-300"
                        on:click={editMessage}
                    >
                        Edit
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>

{#if ogTags.title || ogTags.image}
    <div class="mt-3">
        {#if ogTags.title}
            <p class="text-xs text-gray-300">{ogTags.title}</p>
        {/if}
        {#if ogTags.image}
            <img
                fetchPriority="high"
                alt="Preview of message url"
                src={ogTags.image}
                class="mt-2 img-fluid max-w-xs"
            />
        {/if}
    </div>
{/if}

<div class="bg-gray-800 p-2 rounded-lg mt-2">
    <p class="text-xs font-medium text-gray-400">{message.author}</p>
    <p class="text-gray-200">{message.body}</p>
    <button class="btn btn-link text-xs text-gray-300" on:click={handleCancel}>
        Cancel
    </button>
</div>

{#if attachment}
    <div class="d-flex align-items-center mt-2">
        <i class="text-gray-300 text-4xl mr-3"></i>
        <div>
            <p class="text-sm text-gray-400">{attachment.title}</p>
            <a
                href={attachment.url}
                target="_blank"
                referrerpolicy="no-referrer"
                download="true"
            >
                <button class="btn btn-link text-xs text-gray-200"
                    >Download</button
                >
            </a>
            <p class="text-xs text-gray-300">
                {attachment.size} - {attachment.contentType}
            </p>
        </div>
    </div>
{/if}
