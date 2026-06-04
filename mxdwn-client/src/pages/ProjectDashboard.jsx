import { useState, useEffect } from 'react';
import { fetchProjects, createProject } from '../api/projectApi';
import { Link } from "react-router-dom";

export default function ProjectDashboard() {
    // --- SOFT AUTH STATE ---
    // Hardcode a few "mock" users to test data isolation
    const mockUsers = [
        { id: 'artist_123', name: 'The Midnight' },
        { id: 'artist_456', name: 'Gunship' },
        { id: 'artist_789', name: 'FM-84' }
    ];
    // Default to the first user
    const [currentArtistId, setCurrentArtistId] = useState(mockUsers[0].id);

    // --- DATA STATE ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');


    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoading(true);
                const data = await fetchProjects(currentArtistId);
                setProjects(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch projects. Check backend connection.");
            } finally {
                setLoading(false);
            }
        };

        loadProjects();

    }, [currentArtistId]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            // Silently attach the currently selected artistId to the request
            const newProject = await createProject({
                title: title,
                artistId: currentArtistId
            });

            setProjects([...projects, newProject]);
            setTitle(''); // Clear form
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create project");
        }
    };

    return (
        <div>
            {/* --- TOP BAR: SOFT AUTH SIMULATOR --- */}
            <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#00e5ff' }}>User Simulator:</span>
                <select
                    value={currentArtistId}
                    onChange={(e) => setCurrentArtistId(e.target.value)}
                    style={{ padding: '8px', background: '#121212', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
                >
                    {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.id})
                        </option>
                    ))}
                </select>
            </div>

            <h1>Project Dashboard</h1>

            {error && <div style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</div>}

            {/* --- CREATE FORM --- */}
            <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Start New Project for {mockUsers.find(u => u.id === currentArtistId)?.name}</h3>
                <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Project Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ padding: '8px', flex: 1, background: '#333', border: 'none', color: 'white' }}
                    />
                    <button type="submit" style={{ padding: '8px 20px', background: '#00e5ff', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                        Create
                    </button>
                </form>
            </div>

            {/* --- PROJECT GRID --- */}
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : projects.length === 0 ? (
                    <p>No projects found for this artist.</p>
                ) : (
                    projects.map(project => (
                        // 2. Wrap the card in a Link component
                        <Link
                            to={`/projects/${project.id}`}
                            key={project.id}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px', background: '#1a1a1a', cursor: 'pointer', transition: '0.2s' }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>{project.title}</h3>
                                <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Artist: {project.artistId}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}