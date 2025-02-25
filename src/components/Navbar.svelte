<script>
    import { accountDB } from "$lib/db/account";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let accountStatus = false;

    onMount(async () => {
        accountStatus = (await accountDB.get()).status;
    });

    function handleLogout() {
        accountDB.deleteSessions();
        goto('/');
    }
</script>

<nav class="relative top-0 left-0 right-0 z-40 flex items-center justify-between p-4 transition-all duration-300">
    <div class="flex items-center">
        <div class="w-10"></div>
        
        <a href="/" class="flex">
            <img src="https://www.upload.ee/image/17709275/queaxtra-logo.png" alt="Logo" class="h-10">
        </a>
    </div>
    
    {#if accountStatus}
        <button on:click={handleLogout} class="py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
        </button>
    {/if}
</nav>

<div class="h-16"></div>