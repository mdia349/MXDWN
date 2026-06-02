import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import { fetchProjectMixes } from '../api/projectApi';

export default function ProjectView() {
    const { projectId } = useParams(); // Extracts the ID from the URL path
    const [mixes, setMixes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // React Refs to hold the DOM element and the raw JavaScript object
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);

    // 1. Fetch the data when the component mounts
    useEffect(() => {
        const loadMixes = async () => {
            try {
                const data = await fetchProjectMixes(projectId);
                setMixes(data);
            } catch (error) {
                console.error("Failed to load mixes", error);
            } finally {
                setLoading(false);
            }
        };
        loadMixes();
    }, [projectId]);

    // 2. Initialize Wavesurfer when the audio URL is ready
    useEffect(() => {
        // Only run if we actually have a mix with a URL, and the div has rendered
        if (mixes.length > 0 && mixes[0].streamUrl && waveformRef.current) {

            // Destroy any existing instance to prevent duplicate waveforms
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }

            // Mount the canvas to the div
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4f4f4f',
                progressColor: '#00e5ff',
                cursorColor: '#ffffff',
                barWidth: 2,
                barRadius: 3,
                height: 100,
                normalize: true,
            });

            // Feed it the S3 Stream URL
            wavesurferRef.current.load(mixes[0].streamUrl);

            // Sync the Wavesurfer state with our React state
            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));
        }

        // Cleanup: Destroy the audio engine when the user navigates away
        return () => {
            if (wavesurferRef.current) wavesurferRef.current.destroy();
        };
    }, [mixes]);

    const togglePlay = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    if (loading) return <div>Loading project data...</div>;

    return (
        <div>
            <Link to="/" style={{ color: '#00e5ff', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
            <h1 style={{ marginTop: '20px' }}>Mix Player</h1>

            {mixes.length === 0 ? (
                <p>No mixes uploaded to this project yet.</p>
            ) : (
                <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>{mixes[0].versionName}</h3>

                    {/* The Empty Div where Wavesurfer injects the canvas */}
                    <div ref={waveformRef} style={{ width: '100%', marginBottom: '20px' }}></div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button
                            onClick={togglePlay}
                            style={{
                                padding: '12px 30px',
                                background: '#00e5ff',
                                color: 'black',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}