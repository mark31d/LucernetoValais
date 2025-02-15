import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const backgroundImage = require('../assets/background.jpg');
const coinImage = require('../assets/coin.png');
// <-- наш дефолтный аватар
const defaultAvatar = require('../assets/emoji.png');

const GOLD = '#FFD700';
const DARK_RED = '#8B0000';

const Profile = ({ navigation }) => {
  const [avatar, setAvatar] = useState(null);
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [triviaPoints, setTriviaPoints] = useState(0);
  const [visitedPlaces, setVisitedPlaces] = useState(0);
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('avatar');
      const savedNickname = await AsyncStorage.getItem('nickname');
      const savedDescription = await AsyncStorage.getItem('description');
      const savedTriviaPoints = await AsyncStorage.getItem('triviaPoints');
      const savedVisitedPlaces = await AsyncStorage.getItem('visitedPlaces');

      if (savedNickname) {
        setNickname(savedNickname);
        setDescription(savedDescription || '');

        // Если сохранённый avatar == null, не стоит показывать "null",
        // просто оставляем стейт avatar === null, чтобы ниже отобразить defaultAvatar
        if (savedAvatar) {
          setAvatar(savedAvatar);
        } else {
          setAvatar(null);
        }

        setTriviaPoints(Number(savedTriviaPoints) || 0);
        setVisitedPlaces(Number(savedVisitedPlaces) || 0);
        setIsProfileCreated(true);
      }
    } catch (error) {
      console.error('Error loading profile', error);
    }
  };

  const saveProfileData = async () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname.');
      return;
    }
    try {
      // Если пользователь так и не выбрал фото — сохраняем путь к defaultAvatar
      const avatarToSave = avatar ? avatar : 'default'; 
      // Или можно хранить null и просто в loadProfileData проверять,
      // но для примера сохраняем строку 'default'.

      await AsyncStorage.setItem('avatar', avatarToSave);
      await AsyncStorage.setItem('nickname', nickname);
      await AsyncStorage.setItem('description', description);

      setIsProfileCreated(true);
      navigation.navigate('MainMenu');
    } catch (error) {
      console.error('Error saving profile', error);
    }
  };

  const pickAvatar = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setAvatar(response.assets[0].uri);
      }
    });
  };

  const resetProfileData = () => {
    Alert.alert(
      'Confirm Reset',
      'Are you sure you want to reset your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('avatar');
              await AsyncStorage.removeItem('nickname');
              await AsyncStorage.removeItem('description');
              await AsyncStorage.removeItem('triviaPoints');
              await AsyncStorage.removeItem('visitedPlaces');              setAvatar(null);
              setNickname('');
              setDescription('');
              setTriviaPoints(0);
              setVisitedPlaces(0);
              setIsProfileCreated(false);
            } catch (error) {
              console.error('Error resetting profile', error);
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  // Определяем, какое изображение показывать в аватаре:
  // Если в стейте avatar строка "default" или null, показываем defaultAvatar
  const avatarSource =
    avatar && avatar !== 'default'
      ? { uri: avatar }
      : defaultAvatar;

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay} />

      <View style={styles.contentWrapper}>
        {/* Аватар */}
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
        </TouchableOpacity>

        {/* Поле для ввода Nickname */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your nickname"
            placeholderTextColor="#999"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* Поле для ввода Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Tell us something about you..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Статистика — показываем только если профиль уже создан */}
        {isProfileCreated && (
          <View style={styles.statsRow}>
            <View style={styles.statsBox}>
              <Text style={styles.statsBoxLabel}>Visited Places</Text>
              <Text style={styles.statsBoxValue}>{visitedPlaces}</Text>
            </View>

            <View style={styles.statsBox}>
              <Image source={coinImage} style={styles.coinIcon} />
              <Text style={styles.statsBoxValue}>{triviaPoints}</Text>
            </View>
          </View>
        )}

        {/* Кнопка сохранения / создания профиля */}
        <TouchableOpacity style={styles.button} onPress={saveProfileData}>
          <Text style={styles.buttonText}>
            {isProfileCreated ? 'Save Changes' : 'Create Profile'}
          </Text>
        </TouchableOpacity>

        {/* Кнопка сброса (Reset) доступна только если профиль уже создан */}
        {isProfileCreated && (
          <TouchableOpacity
            style={[styles.button, { marginTop: 10 }]}
            onPress={resetProfileData}
          >
            <Text style={styles.buttonText}>Reset Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
};const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,

  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: GOLD,
  },
  /* Inputs */
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: GOLD,
    fontWeight: '900',
    fontSize: 16,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: GOLD,
    borderWidth: 1,
    borderColor: GOLD,
  },
  descriptionInput: {
    textAlignVertical: 'top',
  },
  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  statsBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  statsBoxLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: GOLD,
    marginBottom: 5,
  },
  statsBoxValue: {
    fontSize: 16,
    fontWeight: '800',
    color: GOLD,
  },
  coinIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  /* Button */
  button: {
    backgroundColor: DARK_RED,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: GOLD,
  },
  buttonText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Profile;