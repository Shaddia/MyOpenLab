import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

const db = getFirestore();

export const updateUserPoints = async (userId, type) => {
  let pointsValue = 0;
  let breakdownField = "";
  switch (type) {
    case "like":
      pointsValue = 5;
      breakdownField = "likes";
      break;
    case "comment":
      pointsValue = 10;
      breakdownField = "comments";
      break;
    case "post":
      pointsValue = 15;
      breakdownField = "posts";
      break;
    default:
      return;
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    points: increment(pointsValue),
    [`breakdown.${breakdownField}`]: increment(1),
  });
};