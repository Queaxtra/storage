<script>
    import pb from "$lib/pocketbase";
    import Footer from "../components/Footer.svelte";
    import Login from "../components/Login.svelte";

    let userValid = pb.authStore.isValid;
</script>

{#if userValid === true}
{window.location.href = "/panel"}
{:else}
<Login />
<Footer />
{/if}