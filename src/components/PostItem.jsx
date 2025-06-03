import React from "react";
import { updateUserPoints } from "./userService";

const PostItem = ({ post, currentUser }) => {
  const handleLike = async () => {
    // Lógica para actualizar el like en el post...
    // Por ejemplo, actualizar un documento o estado local

    // Actualiza los puntos del usuario
    await updateUserPoints(currentUser.uid, "like");
  };

  const handleComment = async (comment) => {
    // Lógica para agregar el comentario...
    
    // Actualiza los puntos del usuario
    await updateUserPoints(currentUser.uid, "comment");
  };

  const handlePublish = async () => {
    // Lógica para publicar el post...
    
    // Actualiza los puntos del usuario
    await updateUserPoints(currentUser.uid, "post");
  };

  return (
    <div>
      <h3>{post.title}</h3>
      {/* ...código existente... */}
      <button onClick={handleLike}>Like</button>
      <button onClick={() => handleComment("Ejemplo de comentario")}>
        Comentar
      </button>
      <button onClick={handlePublish}>Publicar</button>
    </div>
  );
};

export default PostItem;