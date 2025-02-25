import { error } from '@sveltejs/kit';
import fs from 'fs';
import { fileURLToPath } from 'url';

export async function GET({ params, url, fetch }) {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const stats = fs.statSync(__filename);
        const fileSize = stats.size;
        
        const { fileId } = params;
        const width = url.searchParams.get('width') || '500';
        const height = url.searchParams.get('height') || '1000';
        const bucketId = import.meta.env.VITE_APP_BUCKET_ID;
        const projectId = import.meta.env.VITE_APP_PROJECT_ID;
        const appwriteUrl = `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/preview?width=${width}&height=${height}&project=${projectId}`;
        
        if (fileId === 'filesize') {
            return new Response(
                JSON.stringify({
                    serverFileSize: fileSize,
                    filePath: __filename
                }),
                {
                    status: 200,
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );
        }
        
        const response = await fetch(appwriteUrl);
        
        if (!response.ok) {
            console.error(`Appwrite response error: ${response.status}`);
            throw error(response.status, 'Failed to fetch image from storage');
        }
        
        const contentType = response.headers.get('content-type');
        
        return new Response(response.body, {
            status: 200,
            headers: {
                'content-type': contentType || 'image/jpeg',
                'cache-control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        console.error('Image proxy error:', err);
        throw error(500, 'Failed to retrieve image');
    }
}