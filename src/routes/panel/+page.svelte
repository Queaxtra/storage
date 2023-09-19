<script lang="ts">
    import Icon from '@iconify/svelte';
    import pb from "$lib/pocketbase";
    import toast, { Toaster } from 'svelte-french-toast';

    let userValid = pb.authStore.isValid;
    let username = pb.authStore.model?.username;
    let selectedFile: any;

    async function handleFileChange(event) {
        selectedFile = event.target.files[0];
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();

        if (!selectedFile) {
            toast.error('No file selected!', {
                style: 'background-color: #191919; color: white;',
                position: "top-right"
            })
        return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
        const response = await fetch(import.meta.env.VITE_APP_POCKETBASE_URL + "/api/collections/files/records", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            toast.success('File uploaded!', {
                style: 'background-color: #191919; color: white;',
                position: "top-right"
            })
        } else {
            toast.error('Error uploading file!', {
                style: 'background-color: #191919; color: white;',
                position: "top-right"
            })
        }
        } catch (error) {
            toast.error('Error uploading file!', {
                style: 'background-color: #191919; color: white;',
                position: "top-right"
            })
        }
    }

    async function userLogout() {
        pb.authStore.clear();
        window.location.href = "/";
    }

    function route() {
        window.location.href = "/files";
    }
</script>

{#if userValid === true}
<Toaster />
<div class="relative ml-4 md:ml-20 lg:ml-20 mt-20 text-white/70">
    <h2 class="text-3xl">Hello, {username}</h2>
    <p class="text-base text-white/50">👋 It's good to see you!</p>
    <div>
        <button on:click={userLogout} class="relative p-2 px-12 bg-[#191919] rounded mt-5 text-sm transition-all duration-300"><i class="ri-logout-box-r-line relative top-0.5"></i> Logout</button>
        <button on:click={route} class="relative p-2 px-7 bg-[#191919] rounded mt-5 text-sm transition-all duration-300"><i class="ri-folder-fill relative top-0.5"></i></button>
    </div>
    <form on:submit={handleSubmit}>
        <div class="transition-all duration-300 bg-[#191919]/20 hover:bg-[#191919]/50 border-2 border-dashed border-[#212121] relative w-72 md:w-[32rem] lg:w-[32rem] rounded mt-5">
        <input type="file" accept="image/*" on:change={handleFileChange} multiple class="cursor-pointer relative block opacity-0 w-full h-full p-20 z-50">
        <div class="text-center p-10 absolute top-0 right-0 left-0 m-auto">
            {#if selectedFile}
            <p class="text-white/50 mt-8 text-2xl">{selectedFile.name}</p>
            <button type="submit" class="relative p-2 px-7 bg-[#191919] rounded mt-20 md:mt-28 lg:mt-28 text-sm transition-all duration-300"><i class="ri-upload-2-line relative top-0.5"></i> Upload</button>
            {:else}
            <h2 class="text-2xl mt-8 text-white/30">Drag or select the file!</h2>
            <button disabled class="opacity-50 relative p-2 px-7 bg-[#191919] rounded mt-20 md:mt-28 lg:mt-28 text-sm transition-all duration-300"><i class="ri-upload-2-line relative top-0.5"></i> Upload</button>
            {/if}
        </div>
    </div>
    </form>
</div>

{:else}
<div class="text-center text-white/70 mt-96">
    <h2 class="text-3xl text-red-500/70">401: Unauthorized</h2>
    <p class="mt-2">No user login! Please login by <a href="/" class="underline">clicking here.</a></p>
</div>
{/if}