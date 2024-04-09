<script lang="ts">
    import type { Message } from "../types/Message";
    import type { Attachment } from "../types/Attachment";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let message: Message;
    export let parentMessage: Message | undefined;
    export let author: string;
    let attachment: Attachment;

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
</script>

<div
    role="presentation"
    class="d-flex justify-content-{message.author === author
        ? 'end'
        : 'start'} mb-3"
    on:click={handleClick}
>
    <div class="ml-4 bg-primary p-3 rounded-lg w-75">
        <div class="d-flex justify-content-between">
            <p class="text-sm font-medium text-light">{message.author}</p>
            {#if message.lastEditTime !== message.date}
                <p class="text-xs text-light">Edited</p>
            {/if}
        </div>
        {#if parentMessage}
            <div class="ml-4 bg-secondary p-2 rounded-lg">
                <p class="text-xs text-light">Replying to:</p>
                <p class="text-sm text-dark">{parentMessage.body}</p>
            </div>
        {/if}
        <p class="text-light">{message.body}</p>
        <div class="d-flex justify-content-between align-items-center">
            <p class="text-xs text-light">
                {new Date(message.date).toLocaleString()}
            </p>
            <div class="d-flex align-items-center">
                <button
                    class="btn btn-link btn-sm text-light"
                    on:click={replyToMessage}
                >
                    Reply
                </button>
                {#if message.author === author}
                    <button
                        class="btn btn-link btn-sm text-light"
                        on:click={editMessage}
                    >
                        Edit
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>

{#if attachment}
    <div class="d-flex align-items-center mt-2">
        <i class="text-light text-4xl mr-3"></i>
        <div>
            <p class="text-sm text-dark">{attachment.title}</p>
            <a
                href={attachment.url}
                target="_blank"
                referrerpolicy="no-referrer"
                download="true"
            >
                <button class="btn btn-link btn-sm text-light">Download</button>
            </a>
            <p class="text-xs text-light">
                {attachment.size} - {attachment.contentType}
            </p>
        </div>
    </div>
{/if}
