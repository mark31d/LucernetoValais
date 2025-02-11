import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  Alert,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const folderWidth = (screenWidth - 40) / 2; 

const GOLD = '#FFD700';       // "Золотой"
const DARK_RED = '#8B0000';   // "Тёмно-красный"

const Folder = ({ navigation }) => {
  const [folders, setFolders] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [listKey, setListKey] = useState('grid');

  useEffect(() => {
    const loadFolders = async () => {
      const storedFolders = await AsyncStorage.getItem('folders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      }
    };
    loadFolders();
  }, []);

  const saveFolders = async (newFolders) => {
    setFolders(newFolders);
    await AsyncStorage.setItem('folders', JSON.stringify(newFolders));
  };

  const handleAddFolder = () => {
    if (folderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    const newFolder = { name: folderName, images: [] };
    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    setFolderName('');
    setModalVisible(false);
  };

  const handleAddImageToFolder = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.error('ImagePicker Error:', response.errorMessage);
        } else {
          const source = { uri: response.assets[0].uri };
          const updatedFolders = folders.map((folder) => {
            if (folder.name === selectedFolder.name) {
              return { ...folder, images: [...folder.images, source] };
            }
            return folder;
          });
          saveFolders(updatedFolders);
          setSelectedFolder((prev) => ({
            ...prev,
            images: [...prev.images, source],
          }));
          setListKey(`grid-${Date.now()}`);
        }
      }
    );
  };

  const handleOpenFolder = (folder) => {
    setSelectedFolder(folder);
  };

  // Если папка открыта — показываем изображения внутри
  if (selectedFolder) {
    return (
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container}>
          {selectedFolder.images.length === 0 ? (
            <Text style={styles.noImagesText}>No images added yet</Text>
          ) : (
            <FlatList
              data={selectedFolder.images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image source={item} style={styles.roundedImage} />
              )}
              key={listKey}
              numColumns={2}
              showsVerticalScrollIndicator={false}
            />
          )}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleAddImageToFolder}>
              <Text style={styles.buttonText}>Add Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setSelectedFolder(null)}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }// Иначе показываем список папок
  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <FlatList
          data={folders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.folder} onPress={() => handleOpenFolder(item)}>
              <ImageBackground
                source={require('../assets/folder.png')}
                style={styles.folderBackground}
                imageStyle={styles.roundedFolderIcon}
              />
              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          numColumns={2}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Folder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {isModalVisible && (
          <View style={styles.modal}>
            <Text style={styles.modalText}>Please, enter a folder name</Text>
            <TextInput
              style={styles.input}
              value={folderName}
              onChangeText={setFolderName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddFolder}>
              <Text style={styles.modalButtonText}>Add Folder</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: screenWidth * 0.05,
  },
  folder: {
    width: folderWidth,
    height: folderWidth,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 0, 0, 0.3)', // Тёмно-красный с прозрачностью
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: GOLD, // Золотая рамка
  },
  folderBackground: {
    width: '90%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundedFolderIcon: {
    borderRadius: 10,
  },
  folderText: {
    fontSize: screenWidth * 0.06,
    color: GOLD, // Золотой цвет
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -10,
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: DARK_RED, // Тёмно-красный
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: GOLD,
  },
  buttonText: {
    color: GOLD,   // Золотой цвет
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: DARK_RED, // Тёмно-красный
    padding: screenHeight * 0.02,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GOLD,
  },
  modalText: {
    fontSize: screenWidth * 0.05,
    color: GOLD,
    marginBottom: screenHeight * 0.02,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: screenHeight * 0.06,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 5,
    color: DARK_RED,
    backgroundColor: '#FFF',paddingHorizontal: screenWidth * 0.03,
    marginBottom: screenHeight * 0.02,
  },
  modalButton: {
    backgroundColor: GOLD,
    padding: screenHeight * 0.02,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_RED,
  },
  modalButtonText: {
    fontSize: screenWidth * 0.05,
    color: DARK_RED,
    fontWeight: 'bold',
  },
  roundedImage: {
    width: screenWidth * 0.45,
    height: screenWidth * 0.45,
    margin: 9,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GOLD, // Золотая рамка
  },
  noImagesText: {
    marginTop: screenHeight * 0.4,
    marginBottom: screenHeight * 0.08,
    alignSelf: 'center',
    fontSize: screenWidth * 0.08,
    color: GOLD, // Золотой
    backgroundColor: DARK_RED, // Тёмно-красный
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Folder;