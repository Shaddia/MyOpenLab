import React, { useState, useEffect } from "react";
import { collection, onSnapshot, getFirestore } from "firebase/firestore";
import { useAuth } from "../context/useAuth"; // Agrega esta línea
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

// Estilos en línea
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  width: "90%",
  maxWidth: "600px",
};

const headerStyle = {
  position: "relative",
  background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  padding: "16px",
  color: "#fff",
  textAlign: "center",
};

const closeButtonStyle = {
  position: "absolute",
  top: "8px",
  right: "12px",
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "24px",
  cursor: "pointer",
};

const questionIconStyle = {
  position: "absolute",
  top: "8px",
  left: "12px",
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "24px",
  cursor: "pointer",
};

const tabsContainerStyle = {
  display: "flex",
  justifyContent: "space-around",
  marginTop: "12px",
  borderBottom: "2px solid #fff",
};

const tabActiveStyle = {
  padding: "8px 16px",
  background: "#fff",
  color: "#7C3AED",
  borderRadius: "20px",
  fontWeight: "600",
  cursor: "pointer",
};

const tabInactiveStyle = {
  padding: "8px 16px",
  background: "none",
  color: "#fff",
  opacity: 0.8,
  cursor: "pointer",
};

const contentStyle = { padding: "16px" };

const gridStyle = { display: "flex", flexWrap: "wrap", gap: "16px" };

const cardUnlockedStyle = {
  flex: "1 1 45%",
  padding: "16px",
  border: "2px solid #A78BFA",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const cardLockedStyle = {
  flex: "1 1 45%",
  padding: "16px",
  backgroundColor: "#eee",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
};

const iconStyle = { fontSize: "32px" };

const cardTitleStyle = { marginTop: "8px", fontWeight: "bold", color: "#7C3AED" };
const cardDescStyle = { fontSize: "14px", color: "#666" };

const cardTitleLockedStyle = { marginTop: "8px", fontWeight: "bold", color: "#888" };
const cardDescLockedStyle = { fontSize: "14px", color: "#888" };

const progressBarContainerStyle = {
  width: "100%",
  backgroundColor: "#ccc",
  borderRadius: "4px",
  marginTop: "8px",
};

const progressBarStyle = {
  height: "8px",
  borderRadius: "4px",
  backgroundColor: "#7C3AED",
};

const textCenterStyle = { textAlign: "center" };

const pointsTotalStyle = { fontSize: "48px", fontWeight: "bold", color: "#7C3AED" };
const levelTextStyle = { marginTop: "8px", fontSize: "20px" };

const progressContainerStyle = {
  width: "100%",
  height: "12px",
  backgroundColor: "#ccc",
  borderRadius: "6px",
  marginTop: "12px",
};

const progressFillStyle = {
  height: "12px",
  borderRadius: "6px",
  backgroundColor: "#A78BFA",
};

const breakdownStyle = {
  marginTop: "16px",
  textAlign: "left",
  maxWidth: "400px",
  margin: "16px auto 0",
};

const totalStyle = {
  marginTop: "12px",
  fontWeight: "bold",
  color: "#7C3AED",
  textAlign: "center",
};

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { padding: "8px", borderBottom: "1px solid #ddd", textAlign: "center" };
const tdStyle = { padding: "8px", borderBottom: "1px solid #ddd", textAlign: "center" };
const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#7C3AED",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "8px",
  fontWeight: "bold",
};

const db = getFirestore();

const ReputationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth(); // Obtiene el usuario actual
  const [activeTab, setActiveTab] = useState("logros");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [comments, setComments] = useState([]);

  // Suscripción a las colecciones
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });
    const unsubscribeProjects = onSnapshot(collection(db, "proyectos"), (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    });
    const unsubscribeEventos = onSnapshot(collection(db, "eventos"), (snapshot) => {
      const eventosData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEventos(eventosData);
    });
    const unsubscribeComments = onSnapshot(collection(db, "comentarios"), (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProjects();
      unsubscribeEventos();
      unsubscribeComments();
    };
  }, []);

  if (!isOpen) return null;

  // Cálculo de puntos para cada usuario
  const computedRanking = users
    .map((u) => {
      const userProjects = projects.filter((p) => p.autorId === u.id);
      const userEventos = eventos.filter((e) => e.autorId === u.id);
      const userComments = comments.filter((c) => c.autorId === u.id);
      const likesFromProjects = userProjects.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0);
      const likesFromEventos = userEventos.reduce((acc, e) => acc + (e.likes ? e.likes.length : 0), 0);
      const totalLikes = likesFromProjects + likesFromEventos;
      const postsCount = userProjects.length + userEventos.length;
      const commentsCount = userComments.length;
      const points = totalLikes * 5 + postsCount * 15 + commentsCount * 10;
      return {
        ...u,
        breakdown: { likes: totalLikes, posts: postsCount, comments: commentsCount },
        points,
      };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <button
            style={questionIconStyle}
            onClick={() =>
              window.alert(
                "Sistema de Puntos Real:\n\n• Cada 'like' en proyectos o eventos: 5 pts\n• Cada comentario: 10 pts\n• Cada publicación (proyecto o evento): 15 pts\n• Otros bonos según actividad"
              )
            }
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
          </button>
          <h2 style={{ margin: 0 }}>Sistema de Reputación</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            ×
          </button>
          <div style={tabsContainerStyle}>
            <button
              onClick={() => setActiveTab("logros")}
              style={activeTab === "logros" ? tabActiveStyle : tabInactiveStyle}
            >
              🏆 Logros
            </button>
            <button
              onClick={() => setActiveTab("puntos")}
              style={activeTab === "puntos" ? tabActiveStyle : tabInactiveStyle}
            >
              💯 Puntos
            </button>
            <button
              onClick={() => setActiveTab("ranking")}
              style={activeTab === "ranking" ? tabActiveStyle : tabInactiveStyle}
            >
              🧍‍♂️ Ranking
            </button>
          </div>
        </div>
        <div style={contentStyle}>
          {activeTab === "puntos" && (
            <div style={textCenterStyle}>
              <p style={pointsTotalStyle}>
                {computedRanking.find((u) => u.id === user?.uid)?.points?.toLocaleString() || 0} pts
              </p>
            </div>
          )}
          {activeTab === "logros" && (
            <div style={gridStyle}>
            
              <div style={cardUnlockedStyle}>
                <div style={iconStyle}>🏆</div>
                <p style={cardTitleStyle}>Primer Proyecto</p>
                <p style={cardDescStyle}>Publicaste tu primer proyecto</p>
              </div>
               
              <div style={cardLockedStyle}>
                <div style={iconStyle}>⭐</div>
                <p style={cardTitleLockedStyle}>2 Seguidores</p>
                <p style={cardDescLockedStyle}>2/10 Seguidos</p>
                <div style={progressBarContainerStyle}>
                  <div style={{ ...progressBarStyle, width: "40%" }}></div>
                </div>
              </div>
            </div>
          )} 
          {activeTab === "ranking" && (
  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Posición</th>
          <th style={thStyle}>Usuario</th>
          <th style={thStyle}>Nivel</th>
          <th style={thStyle}>Likes</th>
          <th style={thStyle}>Publicaciones</th>
          <th style={thStyle}>Comentarios</th>
          <th style={thStyle}>Total Puntos</th>
        </tr>
      </thead>
      <tbody>
        {computedRanking.map((user, index) => (
          <tr key={user.id}>
            <td
              style={{
                ...tdStyle,
                backgroundColor:
                  index === 0
                    ? "gold"
                    : index === 1
                    ? "silver"
                    : index === 2
                    ? "peru"
                    : "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
            >
              {index + 1}
            </td>
            <td style={tdStyle}>
              <div style={avatarStyle}>
                {user.initials || (user.name ? user.name.substring(0, 2) : "NA")}
              </div>{" "}
              {user.name}
            </td>
            <td style={tdStyle}>Nivel {user.level || "N/A"}</td>
            <td style={tdStyle}>{user.breakdown?.likes || 0} pts</td>
            <td style={tdStyle}>{user.breakdown?.posts || 0} pts</td>
            <td style={tdStyle}>{user.breakdown?.comments || 0} pts</td>
            <td style={{ ...tdStyle, fontWeight: "bold" }}>{user.points} pts</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default ReputationModal;