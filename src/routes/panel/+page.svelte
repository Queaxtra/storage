<script lang="ts">
    import pb from "$lib/pocketbase";
    import toast, { Toaster } from 'svelte-french-toast';
    import Footer from "../../components/Footer.svelte";

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
<div class="mx-7 my-20 md:m-20">
    <h2 class="text-2xl md:text-4xl transition-all duration-300">Hi, {username}</h2>
    <p class="my-2 text-sm md:text-base text-white/70 font-thin"><i class="ri-eye-2-line relative top-0.5 transition-all duration-300"></i> Good to see you.</p>
    <div>
        <button on:click={userLogout} class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300">Logout</button>
        <button on:click={route} class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300">Files</button>
    </div>
    <form on:submit={handleSubmit}>
        <div class="transition-all duration-300 bg-[#191919]/20 hover:bg-[#191919]/50 border-2 border-dashed border-[#212121] relative w-full md:w-[32rem] lg:w-[32rem] rounded mt-5">
            <input type="file" accept="image/*" on:change={handleFileChange} multiple class="cursor-pointer relative block opacity-0 w-full h-full p-4 md:p-6 z-50">
            <div class="relative text-white/70 text-center -top-7 md:-top-9 font-thin text-sm md:text-base">
                {#if selectedFile}
                <h2>{selectedFile.name}</h2>
                {:else}
                <h2>Drag and drop your file here</h2>
                {/if}
            </div>
        </div>
        {#if !selectedFile}
        <button disabled class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300 my-5 opacity-50">Upload</button>
        {:else}
        <button type="submit" class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300 my-5">Upload</button>
        {/if}
    </form>
</div>

<Footer />
{:else}
<div class="text-center text-white/70 mt-96">
    <h2 class="text-3xl text-red-500/70">401: Unauthorized</h2>
    <p class="mt-2">No user login! Please login by <a href="/" class="underline">clicking here.</a></p>
</div>
{/if}