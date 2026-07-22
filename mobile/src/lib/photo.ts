import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

/** Launches the camera. Returns the local URI, or null if cancelled/denied. */
export async function pickFromCamera(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      'Camera access needed',
      'Enable camera access in Settings to take a photo of your plant.',
    );
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

/** Launches the photo library. Returns the local URI, or null if cancelled/denied. */
export async function pickFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      'Photos access needed',
      'Enable photo access in Settings to choose a picture of your plant.',
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
