<script>
    import pb from "$lib/pocketbase";

    let adminEmail = "";
    let adminPassword = "";

    async function loginAdmin() {
        await pb.collection("users").authWithPassword(adminEmail, adminPassword).then((res) => {
            window.location.href = "/panel";
        }).catch((err) => {
            console.log(err);
        });
    }
</script>

<div class="ml-auto mr-auto left-0 right-0 bg-[#151515] w-80 md:w-96 lg:w-96 h-[17.5rem] md:h-72 lg:h-72 rounded relative mt-80 md:mt-96 lg:mt-72 text-center text-white/70 transition-all duration-300">
    <img src="https://imgtr.ee/images/2023/09/12/e9b730afaba66210681dba95e245281d.png" alt="Logo" class="w-20 ml-auto mr-auto left-0 right-0 absolute mt-3">

    <div>
        <input bind:value={adminEmail} class="p-2 px-4 md:px-5 lg:px-5 bg-[#191919] rounded mt-24 w-72 md:w-80 lg:w-80 placeholder:text-[#353535] text-sm md:text-base lg:text-base transition-all duration-300" type="email" placeholder="Enter a admin email">
        <input bind:value={adminPassword} class="p-2 px-4 md:px-5 lg:px-5 bg-[#191919] rounded mt-5 w-72 md:w-80 lg:w-80 placeholder:text-[#353535] text-sm md:text-base lg:text-base transition-all duration-300" type="password" placeholder="Enter a admin password">
    </div>
    <button on:click={loginAdmin} class="relative p-2 px-14 bg-[#191919] rounded mt-5 text-sm md:text-base lg:text-base transition-all duration-300">Login</button>
</div>