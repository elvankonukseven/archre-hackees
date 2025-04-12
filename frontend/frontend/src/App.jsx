import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { useState } from 'react';
import axios from 'axios';
import ChatBot from './Chat';
import Dashboard from './Dashboard';

function App() {
  const [files, setFiles] = useState([]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);

    for (const file of droppedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        console.log('Tentative d\'upload pour:', file.name);
        console.log('FormData contenu:', formData.get('file'));
        const response = await axios.post('http://localhost:4000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`${file.name} uploadé !`);
      } catch (error) {
        console.error(`Erreur lors de l'upload de ${file.name}:`, error);
      }
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-background">
          <nav className="p-4 border-b">
            <Link to="/chat" className="text-primary hover:text-primary/80">Aller au Chat</Link>
          </nav>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 border-2 border-dashed rounded-lg m-4"
          >
            <p className="text-lg">Drag & Drop tes fichiers ici</p>
            <div className="mt-4">
              {files.map((file, i) => (
                <div key={i} className="text-sm text-muted-foreground">{file.name}</div>
              ))}
            </div>
          </div>
        </div>
      } />
      <Route path="/chat" element={<ChatBot />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
