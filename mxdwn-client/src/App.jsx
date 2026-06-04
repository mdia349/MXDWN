import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectView from './pages/ProjectView'; // Add the import

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
                        <Route path="/projects/:projectId" element={<ProjectView />} /> {/* Update Route */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;