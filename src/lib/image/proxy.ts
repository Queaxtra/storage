export function proxyImage(appwriteUrl: string): string {
    try {
        const url = new URL(appwriteUrl);
        const pathParts = url.pathname.split('/');
        const fileId = pathParts[pathParts.indexOf('files') + 1];
        const width = url.searchParams.get('width') || '500';
        const height = url.searchParams.get('height') || '1000';
        
        return `/api/images/v1/${fileId}?width=${width}&height=${height}`;
    } catch (error) {
        console.error('Error proxying image URL:', error);
        return appwriteUrl;
    }
}