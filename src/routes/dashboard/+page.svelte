<script lang="ts">
    import Navbar from "../../components/Navbar.svelte";
    import { storageDB } from "$lib/db/storage";
    import { accountDB } from "$lib/db/account";
    import { v4 as uuidv4 } from 'uuid';
    import { onMount } from "svelte";
    import Footer from "../../components/Footer.svelte";
    import { proxyImage } from "$lib/image/proxy";
    import { goto } from "$app/navigation";
    
    let showModal = false;
    let fileUploading = false;
    let errorMessage = '';
    let successMessage = '';
    let file: File | null = null;
    let accountStatus: boolean = false;
    let files: any[] = [];
    let isLoading = true;
    let filterKeyword = '';
    let sortOption = 'newest';
    let viewMode: 'grid' | 'list' = 'list';
    const TOTAL_STORAGE_GB = 150;
    let usedStorageBytes = 0;
    let usedStorageGB = 0;
    let storagePercentage = 0;
    let currentPage = 1;
    const itemsPerPage = 8;
    let totalPages = 1;
    let fileWidth = 0;
    let fileHeight = 0;
    let aspectRatio = 1;
    
    const toggleModal = () => {
        showModal = !showModal;
        errorMessage = '';
        successMessage = '';
    };

    onMount(async () => {
        try {
            accountStatus = (await accountDB.get()).status;

            if (!accountStatus) {
                goto('/');
            } else {
                fetchFiles();
            }
        } catch (error) {
            goto('/');
        }
    });

    function calculateStorageUsage() {
        usedStorageBytes = files.reduce((total, file) => total + file.sizeOriginal, 0);
        usedStorageGB = usedStorageBytes / (1024 * 1024 * 1024);
        storagePercentage = (usedStorageGB / TOTAL_STORAGE_GB) * 100;
    }
    
    function getStorageColor() {
        if (storagePercentage < 50) return 'bg-emerald-500';
        if (storagePercentage < 80) return 'bg-amber-500';
        return 'bg-red-500';
    }
    
    async function fetchFiles() {
        isLoading = true;
        try {
            const response = await storageDB.listFiles(import.meta.env.VITE_APP_BUCKET_ID);
            files = response.files || [];
            calculateStorageUsage();
            
            currentPage = 1;
            updateTotalPages();
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            isLoading = false;
        }
    }

    function updateTotalPages() {
        const filteredFiles = filterFiles();
        totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
        
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
    }

    function filterFiles() {
        let filtered = filterKeyword 
            ? files.filter(file => file.name.toLowerCase().includes(filterKeyword.toLowerCase()))
            : [...files];
        
        if (sortOption === 'newest') {
            filtered.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
        } else if (sortOption === 'oldest') {
            filtered.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
        } else if (sortOption === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return filtered;
    }

    async function downloadFile(fileID: string) {
        try {
            const file = await storageDB.getFileDownload(import.meta.env.VITE_APP_BUCKET_ID, fileID);
            const blob = new Blob([file], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please try again.');
        }
    }
    
    function getFilteredFiles() {
        const filtered = filterFiles();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        return filtered.slice(startIndex, endIndex);
    }
    
    function getFilePreviewUrl(fileId: string) {
        return proxyImage(`https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APP_BUCKET_ID}/files/${fileId}/preview?width=${fileWidth}&height=${fileHeight}&project=${import.meta.env.VITE_APP_PROJECT_ID}`);
    }

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    $: {
        if (filterKeyword !== undefined || sortOption !== undefined) {
            updateTotalPages();
        }
    }
    
    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    async function deleteFile(fileId: string) {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                await storageDB.deleteFile(import.meta.env.VITE_APP_BUCKET_ID, fileId);
                fetchFiles();
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('Failed to delete file. Please try again.');
            }
        }
    }
    
    const handleUpload = async () => {
        if (!file) {
            errorMessage = 'Please select a file first';
            return;
        }
        
        fileUploading = true;
        errorMessage = '';
        
        try {
            await storageDB.createFile(import.meta.env.VITE_APP_BUCKET_ID, uuidv4(), file);
            successMessage = 'File uploaded successfully!';
            file = null;

            const uploaderElement = document.getElementById('uploader') as HTMLInputElement | null;
            if (uploaderElement) {
                uploaderElement.value = '';
            }
            
            setTimeout(() => {
                fetchFiles();
                toggleModal();
            }, 1500);
            
        } catch (error) {
            console.error('Upload error:', error);
            errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
        } finally {
            fileUploading = false;
        }
    };
    
    const handleFileChange = (event: Event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            file = files[0];
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        fileWidth = img.width;
                        fileHeight = img.height;
                        aspectRatio = fileWidth / fileHeight;
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            }
        }
    };
</script>

<Navbar />

<div class="container mx-auto p-4 md:p-6">
    <div class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between mb-6 gap-4">
        <div class="w-full sm:flex-1 sm:min-w-[300px]">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent uppercase">Files</h1>
            <div class="flex items-center space-x-2 mt-2">
                <span class="text-white/50 text-sm">Page</span>
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1} class="px-2 py-1.5 bg-white/5 rounded-lg disabled:opacity-50 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span class="text-white/50">{currentPage}</span>
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} class="px-2 py-1.5 bg-white/5 rounded-lg disabled:opacity-50 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <span class="text-white/50 text-sm ml-1">of {totalPages}</span>
            </div>
        </div>
        
        <div class="w-full sm:w-auto grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
            <div class="relative col-span-1 w-full sm:w-auto">
                <input type="text" bind:value={filterKeyword} placeholder="Search files..." class="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-white placeholder:text-white/20" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            
            <div class="flex justify-between gap-3 col-span-1">
                <select bind:value={sortOption} class="flex-1 sm:flex-none px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-white">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name (A-Z)</option>
                </select>
                
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <div class="flex border border-white/10 rounded-lg overflow-hidden">
                    <button class={`px-3 py-2 ${viewMode === 'grid' ? 'bg-white/15' : 'bg-white/5'} transition-colors`} on:click={() => viewMode = 'grid'}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button class={`px-3 py-2 ${viewMode === 'list' ? 'bg-white/15' : 'bg-white/5'} transition-colors`} on:click={() => viewMode = 'list'}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <button on:click={toggleModal} class="w-full sm:w-auto py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300 flex items-center justify-center sm:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload File
            </button>
        </div>
    </div>
    
    {#if isLoading}
        <div class="flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if getFilteredFiles().length === 0}
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
            {#if filterKeyword}
                <p class="text-white/60">No files match your search criteria.</p>
            {:else}
                <p class="text-white/60">You haven't uploaded any files yet.</p>
            {/if}
            
            <button on:click={toggleModal} class="mt-4 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300 inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload Your First File
            </button>
        </div>
    {:else}
        {#if viewMode === 'grid'}
            <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                {#each getFilteredFiles() as file (file.$id)}
                    <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group relative h-full flex flex-col">
                        <div class="aspect-square relative overflow-hidden flex-shrink-0">
                            <img src={getFilePreviewUrl(file.$id)} alt={file.name} class="w-full h-full object-cover" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-2 sm:p-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div class="truncate text-white/90 max-w-[70%] text-xs sm:text-sm" title={file.name}>
                                    {file.name}
                                </div>
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <div class="flex space-x-1">
                                    <a href={getFilePreviewUrl(file.$id)} download class="p-1 sm:p-1.5 bg-white/5 hover:bg-blue-500/20 rounded text-white/60 hover:text-blue-200 transition-colors" title="Download file">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>
                                    <button on:click={() => downloadFile(file.$id)} class="p-1 sm:p-1.5 bg-white/5 hover:bg-red-500/20 rounded text-white/60 hover:text-red-200 transition-colors" title="Delete file">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-2 sm:p-3 flex-grow">
                            <div class="text-xs sm:text-sm text-white/50 truncate" title={file.name}>
                                {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                            </div>
                            <div class="flex justify-between items-center mt-1">
                                <div class="text-xs text-white/40">
                                    {(file.sizeOriginal / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <div class="text-xs text-white/40">
                                    {formatDate(file.$createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div class="grid grid-cols-12 p-2 sm:p-3 border-b border-white/10 text-white/50 text-xs sm:text-sm font-medium">
                    <div class="col-span-6 md:col-span-6 pl-2">Name</div>
                    <div class="col-span-2 text-right hidden sm:block">Size</div>
                    <div class="col-span-3 text-right hidden md:block">Date</div>
                    <div class="col-span-6 sm:col-span-4 md:col-span-1 text-right pr-2">Action</div>
                </div>
                    
                {#each getFilteredFiles() as file (file.$id)}
                    <div class="grid grid-cols-12 p-2 sm:p-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center text-xs sm:text-sm">
                        <div class="col-span-6 md:col-span-6 flex items-center pl-1 sm:pl-2">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex-shrink-0 bg-white/5 rounded overflow-hidden">
                                <img src={getFilePreviewUrl(file.$id)} alt={file.name} class="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <span class="truncate" title={file.name}>{file.name}</span>
                        </div>
                        <div class="col-span-2 text-right text-white/50 hidden sm:block">
                            {(file.sizeOriginal / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div class="col-span-3 text-right text-white/50 hidden md:block">
                            {formatDate(file.$createdAt)}
                        </div>
                        <div class="col-span-6 sm:col-span-4 md:col-span-1 text-right pr-1 sm:pr-2">
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <div class="flex justify-end space-x-1 sm:space-x-2">
                                <a href={getFilePreviewUrl(file.$id)} target="_blank" class="p-1 sm:p-1.5 bg-white/5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors" title="View image">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                                <button on:click={() => deleteFile(file.$id)} class="p-1 sm:p-1.5 bg-white/5 hover:bg-red-500/20 rounded text-white/60 hover:text-red-200 transition-colors" title="Delete file">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

    <div class="mt-4 sm:mt-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 sm:p-4">
        <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div class="w-full sm:w-auto">
                <h2 class="font-medium text-white/80 text-sm sm:text-base">Storage Usage</h2>
                <div class="flex items-end gap-1 mt-1">
                    <span class="text-xl sm:text-2xl font-bold text-white">{usedStorageGB.toFixed(2)} GB</span>
                    <span class="text-white/60 mb-0.5 text-xs sm:text-sm">/ {TOTAL_STORAGE_GB} GB</span>
                </div>
            </div>
            
            <div class="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                <div class="flex-grow sm:flex-grow-0 sm:w-32 h-2 sm:h-2.5 bg-white/5 rounded-full">
                    <div class={`h-full rounded-full ${getStorageColor()}`} style={`width: ${Math.min(storagePercentage, 100)}%`}></div>
                </div>
                <span class="text-white/60 text-xs sm:text-sm whitespace-nowrap">{storagePercentage.toFixed(2)}%</span>
            </div>
        </div>
    </div>
</div>

{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" on:click={toggleModal}>
        <div class="w-full max-w-md">
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden relative flex flex-col" on:click={(e) => e.stopPropagation()}>
                <div class="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4 flex justify-between items-center">
                    <h2 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Upload File</h2>
                    <button on:click={toggleModal} class="text-white/50 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
                
                <div class="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
                    {#if errorMessage}
                        <div class="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {errorMessage}
                        </div>
                    {/if}
                    
                    {#if successMessage}
                        <div class="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-200 text-sm">
                            {successMessage}
                        </div>
                    {/if}
                    
                    <div class="space-y-4">
                        <div class="relative">
                            <label for="uploader" class="block text-sm font-medium text-white/50 mb-1">Select File</label>
                            <input type="file" id="uploader" on:change={handleFileChange} class="sr-only absolute" />
                            
                            <label for="uploader" class="cursor-pointer w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg bg-white/5 py-4 hover:bg-white/[0.07] transition-colors">
                                <div class="text-center px-4">
                                    {#if file}
                                        <div class="mb-2 flex items-center justify-center text-blue-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p class="text-white/90 font-medium text-sm break-all">{file.name}</p>
                                        <p class="text-white/50 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <p class="mt-3 text-white/70 text-xs">(Click to change file)</p>
                                    {:else}
                                        <div class="mb-2 flex items-center justify-center text-white/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p class="text-white/70 font-medium">Drag and drop your file here</p>
                                        <p class="text-white/50 text-xs mt-1">or click to browse files</p>
                                        <p class="mt-3 text-white/40 text-xs">Maximum file size: 10MB</p>
                                    {/if}
                                </div>
                            </label>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button on:click={handleUpload} class="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={fileUploading || !file}>
                                {#if fileUploading}
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                {:else}
                                    Upload
                                {/if}
                            </button>
                            
                            <button on:click={toggleModal} class="py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<Footer />