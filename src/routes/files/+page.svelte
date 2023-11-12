<script lang="ts">
    import pb from "$lib/pocketbase";
    import { onMount } from "svelte";
    import Footer from "../../components/Footer.svelte";
    
    let array: any = [];

    function route() {
        window.location.href = "/panel";
    }

    function refreshPage() {
        window.location.reload();
    }


    onMount(() => {
        pb.collection("files").getFullList().then((res) => {
            let images = res.map((item) => {
                return item.image;
            });

            let ids = res.map((item) => {
                return item.id;
            });

            let all = ids.map((item, index) => {
                return {
                    name: images[index],
                    id: item,
                    url: import.meta.env.VITE_APP_POCKETBASE_URL + "/api/files/6nl8e6dgpndsaqc/" + item + "/" + images[index]
                }
            });

            array = all;
        }).catch((err) => {
            console.log(err);
        })
    })
</script>

<div class="mx-7 my-20 md:m-20">
    <h2 class="text-2xl md:text-4xl transition-all duration-300">Files</h2>
    <p class="my-2 text-sm md:text-base text-white/70 font-thin"><i class="ri-file-2-fill relative top-0.5 transition-all duration-300"></i> All files are shown below.</p>
    <div>
        <button on:click={route} class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300">Home</button>
        <button on:click={refreshPage} class="p-2 md:p-1.5 px-8 md:px-10 bg-[#191919] rounded text-sm md:text-base font-thin transition-all duration-300">Refresh</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-5">
        {#each array as item}
        <div class="bg-[#191919] rounded p-3 md:p-5 text-white/70">
            <div class="flex justify-between items-center">
                <img src={item.url} alt={item.name} class="w-12 h-12 md:w-16 md:h-16 rounded">
                <h2 class="text-xs md:text-sm text-white/70 font-thin overflow-hidden whitespace-nowrap overflow-ellipsis mx-3 md:mx-3 lg:mx-0 transition-all duration-300">{item.name}</h2>
                <a href={item.url} target="_blank" class="p-2 md:p-1.5 px-8 md:px-10 bg-[#222222] rounded text-sm md:text-base font-thin transition-all duration-300">View</a>
            </div>
        </div>
        {:else}
        <div class="bg-[#191919] rounded p-3 md:p-5 text-white/70">
            <div class="flex justify-between items-center">
                <h2 class="text-xs md:text-sm text-white/70 font-thin overflow-hidden whitespace-nowrap overflow-ellipsis mx-3 md:mx-3 lg:mx-0 transition-all duration-300">No Files Found</h2>
            </div>
        </div>
        {/each}
    </div>
</div>

<Footer />