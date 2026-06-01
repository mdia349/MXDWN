import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './pages/ProjectDashboard'; // Import the new component

function App() {
    return (
        <Router>
            <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh' }}>
                <header>
                    <h2>MXDWN</h2>
                    <hr style={{ borderColor: '#333' }} />
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<ProjectDashboard />} />
                        <Route path="/projects/:projectId" element={<div>Audio Player coming soon...</div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;