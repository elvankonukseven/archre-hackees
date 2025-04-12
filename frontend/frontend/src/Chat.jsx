import { useState } from "react";
import { Link } from 'react-router-dom'


export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour, comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    const userMessage = input;
    setInput("");
  
    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
  
      const data = await response.json();
  
      // Affiche la réponse du serveur
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply },
      ]);
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  return (
    <div style={styles.container}>
    
    {/* Bouton retour en haut à gauche */}
    <div style={styles.backButton}>
      <Link to="/">
        <button style={styles.buttonBack}>Accueil</button>
      </Link>
    </div>
      <div style={styles.chatBox}>
        <div style={styles.messages}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.from === "bot" ? styles.bot : styles.user),
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div style={styles.inputContainer}>
          <input
            style={styles.input}
            placeholder="Écrivez un message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button style={styles.button} onClick={sendMessage}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  chatBox: {
    width: "100%",
    maxWidth: "400px",
    height: "600px",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  messages: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
  },
  message: {
    padding: "10px 14px",
    borderRadius: "16px",
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  bot: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
    color: "#000",
  },
  user: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
    color: "#fff",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
    marginRight: "8px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "20px",
    cursor: "pointer",
  },
};
