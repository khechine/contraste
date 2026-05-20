import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia } from '../lib/api';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const pickImage = async (options: ImagePicker.ImagePickerOptions = {}) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        ...options,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie photos');
      return null;
    }
  };

  const uploadToDjango = async (uri: string, folder: string = 'uploads') => {
    setUploading(true);
    try {
      const result = await uploadMedia(uri, folder);
      return result.url;
    } catch (error) {
      console.error('Upload to Django error:', error);
      Alert.alert('Erreur d\'envoi', 'Impossible d\'envoyer l\'image au serveur');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    pickImage,
    uploadToDjango,
    uploading,
  };
}
