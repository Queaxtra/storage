<script lang="ts">
    import pb from "$lib/pocketbase";
    import { onMount } from "svelte";
    
    let array: any = [];

    function route() {
        window.location.href = "/panel";
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
                    url: import.meta.env.VITE_APP_POCKETBASE_URL + "/api/files/me2tskr7i4kosu6/" + item + "/" + images[index]
                }
            });

            array = all;
        }).catch((err) => {
            console.log(err);
        })
    })
</script>

<div class="relative ml-4 md:ml-20 lg:ml-20 mt-20 text-white/70">
    <h2 class="text-3xl">All Files</h2>
    <p class="text-base text-white/50">🗂 All files are shown below.</p>
    <div>
        <button on:click={route} class="relative p-2 px-12 bg-[#191919] rounded mt-5 text-sm transition-all duration-300"><i class="ri-arrow-left-line relative top-0.5"></i> Back</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 mt-5 relative">
        {#each array as item}
        <div class="relative bg-[#191919] rounded p-6 w-64 h-80 transition-all duration-300">
            <img src={item.url} alt="File" class="w-52 rounded absolute transition-all duration-300">
            <div class="mt-[14rem]">
                <h2 class="text-sm transition-all duration-300">{item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name}</h2>
                <a href={item.url} class="relative p-2 px-7 bg-[#222222] rounded text-sm transition-all duration-300 top-3">View <i class="ri-arrow-right-up-line relative top-0.5"></i></a>
            </div>
        </div>
        {/each}
    </div>
</div>