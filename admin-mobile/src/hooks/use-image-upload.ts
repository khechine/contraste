import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { directus } from '../lib/directus'; // Fixed import path
import { uploadFiles } from '@directus/sdk';

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

  const uploadToDirectus = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const response: any = await directus.request(uploadFiles(formData));
      return response.id;
    } catch (error) {
      console.error('Upload to Directus error:', error);
      Alert.alert('Erreur d\'envoi', 'Impossible d\'envoyer l\'image au serveur');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    pickImage,
    uploadToDirectus,
    uploading,
  };
}
