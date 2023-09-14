<script>
    import pb from "$lib/pocketbase";
    import Login from "../components/Login.svelte";

    let userValid = pb.authStore.isValid;
</script>

{#if userValid === true}
{window.location.href = "/panel"}
{:else}
<Login />
{/if}