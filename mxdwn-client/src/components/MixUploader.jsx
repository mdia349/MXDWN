import { useState } from 'react';
import {createMix, fetchUploadUrl, uploadFileToS3} from '../api/projectApi';

export default function MixUploader({ projectId, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [versionName, setVersionName] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, uploading, success, error
    const [progress, setProgress] = useState(0);

    // Helper: Extract audio duration locally in the browser before sending to the server
    const getAudioDuration = (audioFile) => {
        return new Promise((resolve) => {
            const audio = new Audio(URL.createObjectURL(audioFile));
            audio.onloadedmetadata = () => {
                resolve(Math.floor(audio.duration * 1000)); // Convert seconds to milliseconds
            };
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill version name if empty
            if (!versionName) {
                setVersionName(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !versionName) return;

        try {
            setStatus('processing');

            // 1. Get file details
            const durationMs = await getAudioDuration(file);
            const fileFormat = file.type || 'audio/wav';

            setStatus('fetching-url');
            const { uploadUrl, s3ObjectKey } = await fetchUploadUrl(projectId, file.name, fileFormat);

            setStatus('uploading');
            await uploadFileToS3(uploadUrl, file, (percent) => {
                setProgress(percent);
            });

            setStatus('saving');
            const finalizedMix = await createMix(projectId, {
                versionName,
                fileFormat,
                durationMs,
                s3ObjectKey
            });



            // 4. Success!
            setStatus('success');
            setFile(null);
            setVersionName('');
            setProgress(0);

            // Tell the parent component to refresh the mix list
            if (onUploadComplete) onUploadComplete(finalizedMix);

            // Reset status after a few seconds
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            alert(error.response?.data?.message || "Upload failed. Check console.");
        }
    };

    const isWorking = ['processing', 'fetching-url', 'uploading', 'saving'].includes(status);

    return (
        <div style={{ background: '#222', padding: '20px', borderRadius: '8px', border: '1px solid #444', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Upload New Mix</h3>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Version Name (e.g. Mix 3 - Bass Up)"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    disabled={isWorking}
                    style={{ padding: '10px', background: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '4px' }}
                    required
                />

                <input
                    type="file"
                    accept="audio/wav, audio/mpeg"
                    onChange={handleFileChange}
                    disabled={isWorking}
                    style={{ color: '#ccc' }}
                    required
                />

                {status === 'uploading' && (
                    <div style={{ background: '#111', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, background: '#00e5ff', height: '100%', transition: 'width 0.2s' }}></div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isWorking || !file}
                    style={{
                        padding: '12px',
                        background: status === 'success' ? '#4CAF50' : '#00e5ff',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: isWorking ? 'not-allowed' : 'pointer'
                    }}
                >
                    {status === 'processing' && 'Calculating audio duration...'}
                    {status === 'fetching-url' && 'Securing S3 permission...'}
                    {status === 'uploading' && `Uploading track... ${progress}%`}
                    {status === 'saving' && 'Registering mix with database...'}
                    {status === 'success' && 'Mix online!'}
                    {status === 'idle' && 'Upload Mix'}
                    {status === 'error' && 'Retry Upload'}
                </button>
            </form>
        </div>
    );
}