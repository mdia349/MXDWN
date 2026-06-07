import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'; // 1. The Regions Plugin
import { fetchProjectMixes } from '../api/projectApi';
import { fetchMixComments, createComment } from '../api/commentApi';
import MixUploader from "../components/MixUploader.jsx"; // 2. Our new API calls

export default function ProjectView() {
    const { projectId } = useParams();
    const [mixes, setMixes] = useState([]);

    // --- NEW: Comment State ---
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Hardcoded mock user for now (Our "Soft Auth" strategy)
    const currentUserId = "artist_123";

    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const wsRegionsRef = useRef(null); // Ref to hold the plugin

    // --- NEW: Helper to draw a single marker ---
    const drawMarker = (comment) => {
        if (!wsRegionsRef.current) return;

        // Java gave us milliseconds, but Wavesurfer needs seconds
        const timeInSeconds = comment.timestampMs / 1000;

        wsRegionsRef.current.addRegion({
            start: timeInSeconds,
            content: '💬', // A simple emoji pin
            color: 'rgba(0, 229, 255, 0.4)', // Mxdwn cyan with 40% transparency
            drag: false, // Prevent users from dragging the pin around for now
            resize: false
        });
    };

    // 1. Load Project Data & Comments
    useEffect(() => {
        const loadData = async () => {
            try {
                const mixesData = await fetchProjectMixes(projectId);
                setMixes(mixesData);

                // If we have a mix, fetch its comments immediately
                if (mixesData.length > 0) {
                    const commentsData = await fetchMixComments(mixesData[0].id);
                    setComments(commentsData);
                }
            } catch (error) {
                console.error("Failed to load project data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [projectId]);

    // 2. Initialize Wavesurfer & Plugins
    useEffect(() => {
        if (mixes.length > 0 && mixes[0].streamUrl && waveformRef.current) {

            if (wavesurferRef.current) wavesurferRef.current.destroy();

            // Initialize the Regions Plugin BEFORE creating Wavesurfer
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
                plugins: [wsRegionsRef.current] // Register the plugin!
            });

            wavesurferRef.current.load(mixes[0].streamUrl);

            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));

            // Wait for the audio to be decoded, then draw the existing comments
            wavesurferRef.current.on('decode', () => {
                comments.forEach(comment => drawMarker(comment));
            });
        }

        return () => {
            if (wavesurferRef.current) wavesurferRef.current.destroy();
        };
    }, [mixes]);



    const togglePlay = () => {
        if (wavesurferRef.current) wavesurferRef.current.playPause();
    };

    // --- NEW: Handle Comment Submission ---
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!wavesurferRef.current || !newCommentText.trim()) return;

        // 1. Ask Wavesurfer for the exact playhead position in seconds, convert to MS
        const currentTimeMs = Math.floor(wavesurferRef.current.getCurrentTime() * 1000);

        try {
            const currentMixId = mixes[0].id;
            const newComment = await createComment(currentMixId, {
                userId: currentUserId,
                timestampMs: currentTimeMs,
                text: newCommentText
            });

            // 2. Add to React state so the list updates
            setComments([...comments, newComment]);

            // 3. Draw the new pin on the waveform instantly
            drawMarker(newComment);

            // 4. Clear the text input
            setNewCommentText('');

        } catch (error) {
            alert(error.response?.data?.message || "Failed to post comment");
        }
    };

    const handleUploadComplete = (newMix) => {
        setMixes([newMix, ...mixes]);
    }

    if (loading) return <div>Loading project data...</div>;

    return (
        <div>
            <Link to="/" style={{ color: '#00e5ff', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
            <h1 style={{ marginTop: '20px' }}>Mix Player</h1>

            {/* 3. Drop the uploader right here */}
            <MixUploader projectId={projectId} onUploadComplete={handleUploadComplete} />

            {mixes.length === 0 ? (
                <p>No mixes uploaded to this project yet.</p>
            ) : (
                <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>{mixes[0].versionName}</h3>

                    {/* The Waveform Canvas */}
                    <div ref={waveformRef} style={{ width: '100%', marginBottom: '20px' }}></div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
                        <button
                            onClick={togglePlay}
                            style={{ padding: '12px 30px', background: '#00e5ff', color: 'black', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                    </div>

                    {/* --- NEW: THE COMMENT FORM AND LIST --- */}
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

                            {/* Sort comments chronologically by timestamp before mapping */}
                            {[...comments].sort((a, b) => a.timestampMs - b.timestampMs).map((comment, index) => (
                                <div key={index} style={{ background: '#222', padding: '12px', borderRadius: '6px', fontSize: '14px', borderLeft: '3px solid #00e5ff' }}>
                                    <span style={{ color: '#00e5ff', marginRight: '15px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                        {/* Convert ms back to a readable M:SS format for the UI */}
                                        {Math.floor(comment.timestampMs / 60000)}:
                                        {String(Math.floor((comment.timestampMs % 60000) / 1000)).padStart(2, '0')}
                                    </span>
                                    <span style={{ color: '#ccc' }}>{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}