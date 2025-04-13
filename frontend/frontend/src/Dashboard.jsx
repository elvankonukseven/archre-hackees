import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  // Exemple de données de projets, avec un "id" unique
  const [projects] = useState([
    {
      id: 1,
      title: 'Projet Alpha',
      description: 'Plateforme de gestion de contenu',
      progress: 75,
      updated: 'il y a 2 jours',
    },
    {
      id: 2,
      title: 'Projet Beta',
      description: "Application d'analyse de données",
      progress: 45,
      updated: 'il y a 5 jours',
    },
    {
      id: 3,
      title: 'Projet Gamma',
      description: 'Système de gestion de la relation client',
      progress: 90,
      updated: "Aujourd'hui",
    },
  ]);

  return (
    <div style={styles.container}>
      {/* Barre latérale */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>B2B SaaS</h2>
        <Link to="/" style={styles.menuItem}>Accueil</Link>
        <Link to="/new-project" style={styles.menuItem}>+ Nouveau Projet</Link>
        
        <div style={styles.user}>
          <div style={styles.avatar}></div>
          <div>
            <div style={styles.username}>Jean Dupont</div>
            <div style={styles.email}>jean@example.com</div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.content}>
        <h1 style={styles.title}>Mes Projets</h1>
        <p style={styles.subtitle}>Gérez vos projets existants ou créez-en un nouveau</p>

        <div style={styles.projectList}>
          {/* Cartes pour les projets existants */}
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <h2 style={styles.projectTitle}>{project.title}</h2>
              <p style={styles.projectDescription}>{project.description}</p>
              
              {/* Barre de progression */}
              <div style={styles.progressContainer}>
                <div 
                  style={{ 
                    ...styles.progressBar, 
                    width: `${project.progress}%`,
                  }}
                />
              </div>
              
              {/* Date de mise à jour */}
              <p style={styles.updated}>Mis à jour {project.updated}</p>
              
              {/* Lien pour accéder au Chat (pour chaque projet) */}
              <Link to="/chat" style={styles.chatLink}>
                Accéder au chat
              </Link>

              {/* Lien Uploader propre à chaque projet via son ID */}
              <Link to={`/download/${project.id}`} style={styles.uploadLink}>
                Uploader
              </Link>
            </div>
          ))}

          {/* Carte "Nouveau Projet" (pas de chat ici) */}
          <div style={styles.newProjectCard}>
            <Link to="/new-project" style={styles.newProjectLink}>
              <div style={styles.newProjectIcon}>＋</div>
              <h3 style={styles.newProjectTitle}>Nouveau Projet</h3>
              <p style={styles.newProjectText}>Cliquez pour créer un nouveau projet</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Palette et styles inline */
const brandColor = '#6C63FF'; // Violet corporate
const backgroundColor = '#f9f9ff'; // Légèrement teinté
const textColor = '#333';
const borderColor = '#ddd';
const darkerBrand = '#5348c7';

const styles = {
  /* Container principal */
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: backgroundColor,
    fontFamily: 'Poppins, sans-serif',
  },
  /* Barre latérale */
  sidebar: {
    width: '220px',
    backgroundColor: brandColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '20px',
    color: '#fff',
  },
  logo: {
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
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: 'auto',
  },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#eee',
    borderRadius: '50%',
  },
  username: {
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: '12px',
    color: '#e0e0e0',
  },

  /* Contenu principal */
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
  projectList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },

  /* Cartes de projet */
  projectCard: {
    width: '220px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    border: `1px solid ${borderColor}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  projectTitle: {
    margin: 0,
    fontSize: '18px',
    color: textColor,
  },
  projectDescription: {
    color: '#555',
  },
  progressContainer: {
    height: '8px',
    backgroundColor: '#eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: darkerBrand,
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  updated: {
    fontSize: '12px',
    color: '#999',
  },
  
  /* Lien vers Chat */
  chatLink: {
    marginTop: 'auto',
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: brandColor,
    color: '#fff',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center',
  },
  
  /* Lien pour Uploader */
  uploadLink: {
    display: 'inline-block',
    marginTop: '4px',
    padding: '6px 12px',
    backgroundColor: darkerBrand,
    color: '#fff',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center',
  },

  /* Nouvelle carte de projet */
  newProjectCard: {
    width: '220px',
    backgroundColor: '#fff',
    border: `2px dashed ${borderColor}`,
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  newProjectLink: {
    textDecoration: 'none',
    color: textColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  newProjectIcon: {
    fontSize: '30px',
    marginBottom: '10px',
    color: brandColor,
  },
  newProjectTitle: {
    margin: 0,
    marginBottom: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  newProjectText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
};
