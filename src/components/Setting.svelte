<script lang="ts">
    import { writable } from "svelte/store";
    import {
        Button,
        Icon,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Input,
    } from "@sveltestrap/sveltestrap";

    export let author: string;
    export let searchBarVisible = true;
    export let sidebar = true;
    export let BASE_URL: string;

    export const isModalOpen = writable(false);
</script>

<div class="setting-button">
    <Button color="light" on:click={() => isModalOpen.set(true)}>
        <Icon name="gear" />
    </Button>
</div>
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
    .setting-button {
        position: fixed;
        bottom: 10px;
        left: 10px;
    }
</style>
