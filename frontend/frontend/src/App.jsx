import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// On réutilise un style "inline" similaire
export default function App() {
  // Récupère le projectId dans l'URL, ex: /download/3
  const { projectId } = useParams();

  const [files, setFiles] = useState([]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);

    for (const file of droppedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        console.log(`Tentative d'upload pour: ${file.name}`);
        // On envoie le fichier vers /download/:projectId sur le back-end
        await axios.post(`http://localhost:4000/download/${projectId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`${file.name} uploadé pour le projet n°${projectId} !`);
      } catch (error) {
        console.error(`Erreur lors de l'upload de ${file.name}:`, error);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Barre latérale */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>B2B SaaS</h2>
        <Link to="/dashboard" style={styles.menuItem}>Dashboard</Link>
        <Link to="/chat" style={styles.menuItem}>Chat</Link>
        {/* 
          Ici, le lien est “actif” sur /download/projectId, 
          mais vous pouvez le modifier pour pointer vers un autre ID si nécessaire
        */}
        <Link to={`/download/${projectId}`} style={styles.menuItemActive}>
          Uploader
        </Link>
      </div>

      {/* Contenu principal */}
      <div style={styles.content}>
        <h1 style={styles.title}>Project's files</h1>
        <p style={styles.subtitle}>Add documents to your project's knowledge base</p>

        <div
          style={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p style={styles.dropZoneText}>Drop your files here</p>

          <div style={styles.fileList}>
            {files.map((file, i) => (
              <div key={i} style={styles.fileItem}>{file.name}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Styles pour le composant App */
const brandColor = '#6C63FF';
const backgroundColor = '#f9f9ff';
const borderColor = '#ddd';
const textColor = '#333';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: backgroundColor,
    fontFamily: 'Poppins, sans-serif',
  },
  sidebar: {
    width: '220px',
    backgroundColor: brandColor,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  logo: {
    color: '#fff',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  menuItem: {
    marginBottom: '10px',
    textDecoration: 'none',
    color: '#fff',
    fontWeight: '500',
  },
  menuItemActive: {
    marginBottom: '10px',
    textDecoration: 'none',
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    padding: '30px',
  },
  title: {
    marginBottom: '10px',
    color: textColor,
    fontSize: '24px',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: '30px',
    color: '#666',
  },
  dropZone: {
    border: `2px dashed ${borderColor}`,
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  dropZoneText: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
  },
  fileList: {
    marginTop: '20px',
  },
  fileItem: {
    fontSize: '14px',
    color: '#444',
    marginBottom: '5px',
  },
};
