<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { ListGroup, ListGroupItem } from "@sveltestrap/sveltestrap";
    import type { Channel } from "../types/Channel";

    const dispatch = createEventDispatcher();

    export let channels: Channel[];
    export let selectedChannel: Channel | undefined;

    const handleChannelSelected = (event: CustomEvent<Channel>) => {
        const { detail: channel } = event;
        selectedChannel = channel;
        dispatch("channelSelected", channel);
    };
</script>

<div class="col-3 p-0 overflow-auto">
    <div class="sidebar p-3">
        <ListGroup>
            {#each channels as channel}
                <ListGroupItem
                    action
                    active={selectedChannel &&
                        channel.id === selectedChannel.id}
                    on:click={() =>
                        handleChannelSelected(
                            new CustomEvent("channelSelected", {
                                detail: channel,
                            }),
                        )}
                >
                    {channel.name}
                </ListGroupItem>
            {/each}
        </ListGroup>
    </div>
</div>
