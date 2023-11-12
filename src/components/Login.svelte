<script>
    import pb from "$lib/pocketbase";
    import toast, { Toaster } from 'svelte-french-toast';

    let adminEmail = "";
    let adminPassword = "";

    async function loginAdmin() {
        await pb.collection("users").authWithPassword(adminEmail, adminPassword).then((res) => {
            window.location.href = "/panel";
        }).catch((err) => {
            toast.error("Email and password does not match.", {
                position: 'top-right',
                style: "background-color: #191919; color: #ffffff;"
            });
        });
    }
</script>

<Toaster />
<div class="mx-7 my-20 md:m-20">
    <h2 class="text-2xl md:text-4xl transition-all duration-300">Login</h2>
    <p class="my-2 text-sm md:text-base text-white/70 font-thin"><i class="ri-question-line relative top-0.5 transition-all duration-300"></i> Please enter email and password.</p>
    <div class="my-3">
        <input bind:value={adminEmail} type="email" class="p-2 md:p-1.5 my-2 md:my-0 lg:my-0 bg-[#191919] rounded relative mx-1 -left-1 px-5 md:px-5 lg:px-5 placeholder:text-[#3e3e3e] transition-all duration-300 text-white/70 font-thin" placeholder="Email">
        <input bind:value={adminPassword} type="password" class="p-2 md:p-1.5 my-2 md:my-0 lg:my-0 bg-[#191919] rounded relative mx-1 -left-1 px-5 md:px-5 lg:px-5 placeholder:text-[#3e3e3e] transition-all duration-300 text-white/70 font-thin" placeholder="Password">
    </div>
    {#if !adminEmail || !adminPassword}
    <button disabled class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin opacity-50 transition-all duration-300">Login</button>
    {:else}
    <button on:click={loginAdmin} class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300">Login</button>
    {/if}
</div>