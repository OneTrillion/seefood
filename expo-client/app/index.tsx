import { Text, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useRef } from 'react';
import {CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';

export default function Index() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isHotdog, setIsHotdog] = useState<boolean | null>(null);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>Loading</Text>
      </View>
      );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      let photo = await cameraRef.current.takePictureAsync({});
      uploadPhoto(photo.uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post('http://10.31.255.240:8000/clip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data === 'hotdog') {
        setIsHotdog(true);
      } else {
        setIsHotdog(false)
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
    {isHotdog === true &&  
        <View style={styles.topDogDiv}>
            <Text style={styles.hotdogText}>Hotdog</Text>
            <View style={styles.topGreenCircle}>
                <Text style={styles.checkMark}>✔</Text>
            </View>
        </View>
    }
    {isHotdog === false &&  
        <View style={styles.topNotDiv}>
            <Text style={styles.hotdogText}>Not hotdog</Text>
            <View style={styles.topRedCircle}>
                <Text style={styles.cross}>X</Text>
            </View>
        </View>
    }
      <CameraView style={styles.camera} facing={'back'} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    zIndex: 0, // Ensure the camera is at the bottom
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    justifyContent: 'center',
  },
  button: {
    height: 80,
    width: 80,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(129, 129, 129, 0.7)',
    borderRadius: 160,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  topDogDiv: {
    height: 120,
    backgroundColor: '#3d8639',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topGreenCircle: {
    width: 150,
    height: 159,
    borderRadius: 75,
    backgroundColor: '#3d8639',
    position: 'absolute',
    bottom: -100,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 90,
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 30,
  },
  hotdogText: {
    fontSize: 50,
    lineHeight: 50, // Ensure the line height matches the font size
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 0, // Adjust this value to position the text properly above the check mark
    marginTop: -32, // Adjust this value to position the text properly above the check mark
    textShadowColor: 'black',
    textShadowRadius: 15,
  },
  topNotDiv: {
    height: 120,
    backgroundColor: '#80171d',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topRedCircle: {
    width: 150,
    height: 159,
    borderRadius: 75,
    backgroundColor: '#80171d',
    position: 'absolute',
    bottom: -100,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    fontSize: 90,
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 30,
  },
});
