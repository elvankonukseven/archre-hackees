import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import axios from 'axios';

export default function ChatBot() {
  const location = useLocation();  // <-- Ici c'est bon !
  const { folderName } = location.state || {};
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, what are you looking for?' },
  ]);
  const [input, setInput] = useState('');
  const [editorContent, setEditorContent] = useState('');

  // Référence vers l'input de fichier (caché)
  const fileInputRef = useRef(null);

  // Simule la récupération d'un document/rapport
  const doAReport = async () => {
    console.log("error0")
    try {
      const response = await fetch(`http://localhost:4000/report/${folderName}`);
      console.log("error1");
      const data = await response.json();
      if (data.report) {
        setEditorContent(data.report);
      } else {
        console.error('Erreur: pas de rapport généré');
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport :', error);
    }
  };

  useEffect(() => {
    doAReport();
  }, []);

  // Gérer l'envoi d'un message
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajout du message utilisateur
    setMessages((prev) => [...prev, { from: 'user', text: input }]);
    const userMessage = input;
    setInput('');

        // Log de la requête
    const requestBody = { message: userMessage };
    console.log('Envoi au serveur:', requestBody);
    

    try {
      const response = await fetch(`http://localhost:4000/chat/${folderName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

            // Log de la réponse
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);


      const data = await response.json();

      console.log('Réponse du serveur:', data);

      console.log('Structure de la réponse:', {
        hasReply: 'reply' in data,
        keys: Object.keys(data)
      });

      if (data.reply) {
        setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: 'bot', text: "Désolé, je n'ai pas compris votre demande." },
        ]);
      }
    } catch (error) {
      console.error('Erreur API :', error);
      console.error('Erreur complète:', error);
      console.error('Type d\'erreur:', error.name);
      console.error('Message d\'erreur:', error.message);
      
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Oups, une erreur est survenue côté serveur.' },
      ]);
    }
  };

  // Ouvre la boîte de dialogue pour sélectionner un (ou plusieurs) fichier(s)
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gère l'upload des fichiers sélectionnés vers votre backend
  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Modifiez l'URL selon votre endpoint
        await axios.post('http://localhost:4000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`Fichier "${file.name}" uploadé avec succès.`);
      } catch (error) {
        console.error(`Erreur lors de l'upload de "${file.name}" :`, error);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Barre latérale */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Hackee</h2>
        <Link to="/" style={styles.menuItem}>Home</Link>
        <Link to="/editor" style={styles.menuItem}></Link>
      </div>

      {/* Contenu principal */}
      <div style={styles.content}>
        {/* Éditeur */}
        <div style={styles.editorContainer}>
          <h3 style={styles.editorTitle}>Editor</h3>
          <textarea
            style={styles.textarea}
            placeholder="Interact with your document here"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
          />
        </div>

        {/* Chat */}
        <div style={styles.chatContainer}>
          <h3 style={styles.chatTitle}>Hackee Copilot</h3>
          <div style={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  ...(msg.from === 'bot'
                    ? styles.botMessage
                    : styles.userMessage),
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={styles.inputContainer}>
            {/* Input texte pour poser la question */}
            <input
              style={styles.input}
              placeholder="Posez une question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            {/* Bouton "Envoyer le message" */}
            <button style={styles.sendButton} onClick={sendMessage}>
              ➤
            </button>

            {/* Bouton "Uploader un fichier" */}
            <button style={styles.uploadButton} onClick={triggerFileSelect}>
              Uploader
            </button>

            {/* Input type=file (caché) */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Palette violette "corp" + style inline dans la même vibe que Dashboard
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  logo: {
    marginBottom: '20px',
    color: '#7F56D9', // Violet
    fontWeight: 'bold',
    fontSize: '18px',
  },
  menuItem: {
    marginBottom: '10px',
    textDecoration: 'none',
    color: '#333',
    padding: '6px 0',
  },
  content: {
    flex: 1,
    display: 'flex',
    padding: '30px',
    gap: '30px',
  },
  // Éditeur
  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    maxWidth: '40%',
  },
  editorTitle: {
    marginBottom: '10px',
    fontSize: '16px',
    color: '#333',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  // Chat
  chatContainer: {
    flex: 2,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  chatTitle: {
    marginBottom: '10px',
    fontSize: '16px',
    color: '#333',
  },
  messages: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    marginBottom: '15px',
    paddingRight: '10px',
  },
  message: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '12px',
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  botMessage: {
    backgroundColor: '#f0e9ff', // Violet très clair
    color: '#333',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#7F56D9', // Violet principal
    color: '#fff',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #ddd',
    paddingTop: '10px',
    gap: '8px', // Petite marge entre éléments
  },
  input: {
    flex: 1,
    borderRadius: '20px',
    border: '1px solid #ccc',
    padding: '10px',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#7F56D9',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  uploadButton: {
    backgroundColor: '#7F56D9',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
