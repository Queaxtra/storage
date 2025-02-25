<script lang="ts">
    import { accountDB } from "$lib/db/account";
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";

    let email: string = '';
    let password: string = '';
    let isLogin: boolean = true;
    let loading: boolean = false;
    let errorMessage: string = '';
    let successMessage: string = '';
    let accountStatus: boolean = false;

    onMount(async () => {
        accountStatus = (await accountDB.get()).status;

        if (accountStatus) {
            window.location.href = '/dashboard';
        }
    });

    async function handleLogin() {
        try {
            loading = true;
            errorMessage = '';
            
            if (!email || !password) {
                errorMessage = 'Please fill in all fields';
                return;
            }
            
            await accountDB.createEmailPasswordSession(email, password).then(session => {
                if (session) {
                    successMessage = 'Login successful!';
                    setTimeout(() => {
                        goto('/dashboard');
                    }, 1000);
                }
            });
        } catch (error: unknown) {
            console.error('Login error:', error);
            errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden relative flex flex-col">
            <div class="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4">
                <h2 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Login to your account</h2>
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
                
                <form on:submit|preventDefault={handleLogin} class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-white/50 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            bind:value={email}
                            placeholder="your@email.com"
                            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-white placeholder:text-white/20"
                            required
                        />
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-white/50 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            bind:value={password}
                            placeholder="••••••••"
                            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-white placeholder:text-white/20"
                            required
                        />
                    </div>
                    
                    <div>
                        <button type="submit" class="w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 font-medium transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !email || !password}>
                            {#if loading}
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isLogin ? 'Logging in...' : 'Creating account...'}
                            {:else}
                                {isLogin ? 'Login' : 'Create Account'}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>