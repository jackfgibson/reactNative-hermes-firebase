import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Firebase configuration will be done through google-services.json (Android) 
// and GoogleService-Info.plist (iOS) files

export const db = firestore();
export const authentication = auth();

export default {
  db,
  auth: authentication,
};