import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { fetchProjectMixes } from '../api/projectApi';
import { fetchMixComments, createComment } from '../api/commentApi';
import MixUploader from '../components/MixUploader';

export default function ProjectView() {
    const { projectId } = useParams();
    const [mixes, setMixes] = useState([]);

    // --- NEW: Active Mix State ---
    const [activeMix, setActiveMix] = useState(null);

    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // --- NEW: Refresh Trigger State ---
    // Incrementing this will force the useEffect to re-fetch from the database
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const currentUserId = "artist_123";

    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const wsRegionsRef = useRef(null);

    // Helper function defined at the top
    const drawMarker = (comment) => {
        if (!wsRegionsRef.current) return;
        const timeInSeconds = comment.timestampMs / 1000;
        wsRegionsRef.current.addRegion({
            start: timeInSeconds,
            content: '💬',
            color: 'rgba(0, 229, 255, 0.4)',
            drag: false,
            resize: false
        });
    };

    // 1. Load Project Data & Comments
    useEffect(() => {
        const loadData = async () => {
            try {
                const mixesData = await fetchProjectMixes(projectId);
                setMixes(mixesData);

                if (mixesData.length > 0) {
                    // Default to the first mix if no active mix is set yet
                    const targetMix = activeMix || mixesData[0];
                    setActiveMix(targetMix);

                    const commentsData = await fetchMixComments(targetMix.id);
                    setComments(commentsData);
                }
            } catch (error) {
                console.error("Failed to load project data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        // Listen to refreshTrigger so we can re-run this after an upload
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, refreshTrigger]);

    // 2. Initialize Wavesurfer - Now listens to `activeMix` instead of `mixes`
    useEffect(() => {
        if (activeMix && activeMix.streamUrl && waveformRef.current) {

            if (wavesurferRef.current) wavesurferRef.current.destroy();

            wsRegionsRef.current = RegionsPlugin.create();

            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4f4f4f',
                progressColor: '#00e5ff',
                cursorColor: '#ffffff',
                barWidth: 2,
                barRadius: 3,
                height: 100,
                normalize: true,
                plugins: [wsRegionsRef.current]
            });

            // Load the active mix's URL
            wavesurferRef.current.load(activeMix.streamUrl);

            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));

            wavesurferRef.current.on('decode', () => {
                comments.forEach(comment => drawMarker(comment));
            });
        }

        return () => {
            if (wavesurferRef.current) wavesurferRef.current.destroy();
        };
    }, [activeMix, comments]);

    const togglePlay = () => {
        if (wavesurferRef.current) wavesurferRef.current.playPause();
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!wavesurferRef.current || !newCommentText.trim() || !activeMix) return;

        const currentTimeMs = Math.floor(wavesurferRef.current.getCurrentTime() * 1000);

        try {
            const newComment = await createComment(activeMix.id, {
                userId: currentUserId,
                timestampMs: currentTimeMs,
                text: newCommentText
            });

            setComments([...comments, newComment]);
            setNewCommentText('');

        } catch (error) {
            alert(error.response?.data?.message || "Failed to post comment");
        }
    };

    // --- NEW: Snap playhead to comment timestamp ---
    const handleCommentClick = (timestampMs) => {
        if (!wavesurferRef.current) return;

        const timeInSeconds = timestampMs / 1000;

        // Set the playhead to the exact second
        wavesurferRef.current.setTime(timeInSeconds);

        // Optional but highly recommended: Auto-play the track from that point
        wavesurferRef.current.play();
    };

    // --- NEW: Handle switching between different mixes ---
    const handleMixChange = async (selectedMix) => {
        if (activeMix?.id === selectedMix.id) return; // Do nothing if clicking the same mix

        setIsPlaying(false);
        setActiveMix(selectedMix);
        setComments([]); // Clear old comments while new ones load

        try {
            const commentsData = await fetchMixComments(selectedMix.id);
            setComments(commentsData);
        } catch (error) {
            console.error("Failed to fetch comments for selected mix", error);
        }
    };

    // --- NEW: Force a full data reload from the backend after upload ---
    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        // We set activeMix to null temporarily so the useEffect grabs the newly uploaded one automatically
        setActiveMix(null);
    };

    if (loading) return <div>Loading project data...</div>;

    return (
        <div>
            <Link to="/" style={{ color: '#00e5ff', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
            <h1 style={{ marginTop: '20px' }}>Project View</h1>

            <MixUploader projectId={projectId} onUploadComplete={handleUploadComplete} />

            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>

                {/* --- NEW: Sidebar to select different mixes --- */}
                <div style={{ width: '250px', background: '#1a1a1a', padding: '20px', borderRadius: '10px', alignSelf: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Mix Versions</h3>
                    {mixes.length === 0 ? (
                        <p style={{ color: '#666' }}>No mixes yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {mixes.map(mix => (
                                <button
                                    key={mix.id}
                                    onClick={() => handleMixChange(mix)}
                                    style={{
                                        padding: '10px',
                                        background: activeMix?.id === mix.id ? '#00e5ff' : '#2a2a2a',
                                        color: activeMix?.id === mix.id ? 'black' : 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: activeMix?.id === mix.id ? 'bold' : 'normal',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {mix.versionName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- MAIN PLAYER AREA --- */}
                <div style={{ flex: 1, background: '#1a1a1a', padding: '30px', borderRadius: '10px' }}>
                    {!activeMix ? (
                        <p>Select or upload a mix to begin playback.</p>
                    ) : (
                        <>
                            <h3 style={{ margin: '0 0 20px 0' }}>{activeMix.versionName}</h3>

                            <div ref={waveformRef} style={{ width: '100%', marginBottom: '20px' }}></div>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
                                <button
                                    onClick={togglePlay}
                                    style={{ padding: '12px 30px', background: '#00e5ff', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                                <h4 style={{ color: '#aaa', marginBottom: '15px' }}>Leave a Note at Current Time</h4>

                                <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                                    <input
                                        type="text"
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="Pause the track and type your feedback..."
                                        style={{ flex: 1, padding: '10px', background: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                                    />
                                    <button type="submit" style={{ padding: '10px 20px', background: '#00e5ff', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Drop Pin
                                    </button>
                                </form>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {comments.length === 0 && <p style={{ color: '#666', fontSize: '14px' }}>No comments yet.</p>}

                                    {[...comments].sort((a, b) => a.timestampMs - b.timestampMs).map((comment, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleCommentClick(comment.timestampMs)} // <-- Add click handler
                                            style={{
                                                background: '#222',
                                                padding: '12px',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                borderLeft: '3px solid #00e5ff',
                                                cursor: 'pointer', // <-- Change cursor to pointer
                                            }}
                                            // Optional inline hover effect
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#222'}
                                        >
                                            <span style={{ color: '#00e5ff', marginRight: '15px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                {Math.floor(comment.timestampMs / 60000)}:
                                                {String(Math.floor((comment.timestampMs % 60000) / 1000)).padStart(2, '0')}
                                            </span>
                                            <span style={{ color: '#ccc' }}>{comment.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}