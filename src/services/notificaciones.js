import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const createNotification = async (data) => {
  try {
    const notificationData = {
      ...data,            // datos específicos de la notificación (tipo, from, to, fromName, etc.)
      read: false,        // por defecto no leída
      createdAt: serverTimestamp() // marca de tiempo del servidor
    };

    const docRef = await addDoc(collection(db, 'notificaciones'), notificationData);
    console.log('Notification created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};