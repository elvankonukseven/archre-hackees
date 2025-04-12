import { useState } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  console.log("running code")

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);

    setFiles(droppedFiles);

    for (const file of droppedFiles) {
      const formData = new FormData(); //envoyer un fichier 
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
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: '2px dashed gray',
        padding: '50px',
        textAlign: 'center',
        marginTop: '100px',
      }}
    >
      Drag & Drop tes fichiers ici
      <div style={{ marginTop: '20px' }}>
        {files.map((file, i) => (
          <div key={i}>{file.name}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
