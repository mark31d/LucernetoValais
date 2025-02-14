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
  Modal,
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

  // Текущее выбранное имя папки (для добавления изображений, заметок и т.п.)
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Чтобы обновлять FlatList, храним и меняем key
  const [listKey, setListKey] = useState('grid');

  // Для редактирования заметок:
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

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

  // =====================
  // 1. Добавляем новую папку
  // =====================
  const handleAddFolder = () => {
    if (folderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    const newFolder = { 
      name: folderName, 
      images: [] 
    };
    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    setFolderName('');
    setModalVisible(false);
  };

  // =====================
  // 2. Добавляем изображение в папку
  // =====================
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
        } else if (response.assets && response.assets.length > 0) {
          // В отличие от предыдущего варианта, теперь храним note
          const newImage = { 
            uri: response.assets[0].uri,
            note: '' // изначально заметка пустая
          };

          const updatedFolders = folders.map((folder) => {
            if (folder.name === selectedFolder.name) {
              return { 
                ...folder, 
                images: [...folder.images, newImage] 
              };
            }
            return folder;
          });

          // Обновляем общий массив папок
          saveFolders(updatedFolders);

          // Обновляем локально выбранную папку
          setSelectedFolder((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
          }));

          // Обновляем key для FlatList, чтобы он заново отрисовался
          setListKey(`grid-${Date.now()}`);
        }
      }
    );
  };

  // =====================
  // 3. Открытие выбранной папки
  // =====================
  const handleOpenFolder = (folder) => {
    setSelectedFolder(folder);
  };

  // =====================
  // 4. Работа с заметками для изображения
  // =====================
  const handleEditNote = (imageIndex) => {
    // Открываем модалку для редактирования заметки
    setCurrentImageIndex(imageIndex);// Берём текущую заметку из выбранного изображения
    const existingNote = selectedFolder.images[imageIndex].note || '';
    setCurrentNote(existingNote);
    setNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    if (currentImageIndex === null) return;

    // Обновляем массив изображений у выбранной папки
    const updatedImages = [...selectedFolder.images];
    updatedImages[currentImageIndex] = {
      ...updatedImages[currentImageIndex],
      note: currentNote,
    };

    // Обновляем выбранную папку (в state)
    const updatedFolder = {
      ...selectedFolder,
      images: updatedImages,
    };
    setSelectedFolder(updatedFolder);

    // Обновляем общий массив папок
    const updatedFolders = folders.map((folder) => {
      if (folder.name === selectedFolder.name) {
        return updatedFolder;
      }
      return folder;
    });
    saveFolders(updatedFolders);

    // Закрываем модальное окно
    setNoteModalVisible(false);
  };

  // Если папка открыта — показываем экраны с изображениями:
  if (selectedFolder) {
    return (
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.container}>

          {/* Если нет картинок — показываем соответствующее сообщение */}
          {selectedFolder.images.length === 0 ? (
            <Text style={styles.noImagesText}>No images added yet</Text>
          ) : (
            <FlatList
              data={selectedFolder.images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.uri }} style={styles.roundedImage} />
                  {item.note ? (
                    <Text style={styles.noteText}>
                      {item.note}
                    </Text>
                  ) : (
                    <Text style={styles.noteTextPlaceholder}>No note yet</Text>
                  )}
                  <TouchableOpacity 
                    style={styles.noteButton} 
                    onPress={() => handleEditNote(index)}
                  >
                    <Text style={styles.noteButtonText}>
                      {item.note ? 'Edit Note' : 'Add Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
          </View>{/* Модалка для редактирования/добавления заметки к изображению */}
          <Modal
            visible={noteModalVisible}
            animationType="fade"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>Add or edit note:</Text>
                <TextInput
                  style={styles.input}
                  value={currentNote}
                  onChangeText={setCurrentNote}
                  multiline
                  placeholder="Enter your note..."
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleSaveNote}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setNoteModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </ImageBackground>
    );
  }

  // Иначе показываем список папок:
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
              placeholder="New folder name"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddFolder}>
              <Text style={styles.modalButtonText}>Add Folder</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};const styles = StyleSheet.create({
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
  // ===========
  // Модальное окно для создания папки
  // ===========
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
    minHeight: screenHeight * 0.06,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#FFF',
    color: DARK_RED,
    paddingHorizontal: screenWidth * 0.03,
    marginBottom: screenHeight * 0.02,
  },
  modalButton: {
    backgroundColor: GOLD,
    padding: screenHeight * 0.02,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_RED,
    marginVertical: 5,
  },
  modalButtonText: {
    fontSize: screenWidth * 0.05,
    color: DARK_RED,
    fontWeight: 'bold',
  },
  // ===========
  // Экран со списком изображений
  // ===========
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
  },
  roundedImage: {
    width: screenWidth * 0.45,
    height: screenWidth * 0.45,
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
  noteText: {
    marginTop: 8,
    fontSize: 16,
    color: GOLD,
    backgroundColor: 'rgba(139,0,0,0.3)',
    padding: 5,
    borderRadius: 6,
    textAlign: 'center',
    borderColor: GOLD,
    borderWidth: 1,
  },
  noteTextPlaceholder: {
    marginTop: 8,
    fontSize: 14,
    color: '#FFD70099', // золотой с прозрачностью
    fontStyle: 'italic',
  },
  noteButton: {
    backgroundColor: GOLD,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 5,
    borderWidth: 1,
    borderColor: DARK_RED,
  },
  noteButtonText: {
    color: DARK_RED,
    fontWeight: 'bold',
  },
  // ===========
  // Модальное окно для заметок
  // ===========
  modalOverlay: {
    flex: 1,backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: DARK_RED,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: GOLD,
  },
});

export default Folder;