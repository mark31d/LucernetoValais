import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ImageBackground,
  SafeAreaView,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnlockedCards } from './UnlockedCardsContext';

const backgroundImg = require('../assets/background.jpg');
const backArrowImg = require('../assets/back.png');
const coinImg = require('../assets/coin.png');


const fullQuestionBank = [
  {
    question: 'What is the capital city of Switzerland?',
    options: ['Zurich', 'Bern', 'Geneva'],
    answer: 'Bern'
  },
  {
    question: 'Where is the Matterhorn located?',
    options: ['Lucerne', 'Zermatt', 'Geneva'],
    answer: 'Zermatt'
  },
  {
    question: 'What year was Chillon Castle first built?',
    options: ['1150', '1230', '1005'],
    answer: '1230'
  },
  {
    question: 'Which Swiss city is famous for its international banking?',
    options: ['Basel', 'Zurich', 'Bern'],
    answer: 'Zurich'
  },
  {
    question: 'What color is Switzerland’s flag?',
    options: ['Red and white', 'Blue and white', 'Green and red'],
    answer: 'Red and white'
  },
  {
    question: 'The Grand Casino Luzern is located near which lake?',
    options: ['Lake Geneva', 'Lake Lucerne', 'Lake Zurich'],
    answer: 'Lake Lucerne'
  },
  {
    question: 'In which city can you find the famous "Old Town Clock"?',
    options: ['Zurich', 'Bern', 'Geneva'],
    answer: 'Bern'
  },
  {
    question: 'The Aletsch Glacier is located in which region?',
    options: ['Jungfrau Region', 'Valais', 'Zurich'],
    answer: 'Valais'
  },
  {
    question: 'What is Switzerland’s official currency?',
    options: ['Euro', 'Swiss Franc', 'Dollar'],
    answer: 'Swiss Franc'
  },
  {
    question: 'Which famous Swiss product is often associated with mountains?',
    options: ['Cheese', 'Wine', 'Olive Oil'],
    answer: 'Cheese'
  },
  {
    question: 'Which river flows through Zurich?',
    options: ['Rhone', 'Limmat', 'Aare'],
    answer: 'Limmat'
  },
  {
    question: 'The Lavaux Vineyards overlook which lake?',
    options: ['Lake Geneva', 'Lake Zurich', 'Lake Thun'],
    answer: 'Lake Geneva'
  },
  {
    question: 'Which mountain range covers much of Switzerland?',
    options: ['Himalayas', 'Rockies', 'Alps'],
    answer: 'Alps'
  },
  {
    question: 'What is the primary language spoken in Zurich?',
    options: ['French', 'Italian', 'German'],
    answer: 'German'
  },
  {
    question: 'Where would you go to see Switzerland\'s "Top of Europe"?',
    options: ['Zurich', 'Jungfraujoch', 'Basel'],
    answer: 'Jungfraujoch'
  },
  {
    question: 'Which city hosts an annual international film festival?',
    options: ['Lucerne', 'Zurich', 'St. Moritz'],
    answer: 'Zurich'
  },
  {
    question: 'The Swiss Guards protect which international city?',
    options: ['Bern', 'Geneva', 'Vatican City'],
    answer: 'Vatican City'
  },
  {
    question: 'How many cantons make up Switzerland?',
    options: ['25', '26', '27'],
    answer: '26'
  },
  {
    question: 'St. Moritz is famous for which sport?',
    options: ['Soccer', 'Skiing', 'Sailing'],
    answer: 'Skiing'
  },
  {
    question: 'Where would you find the Chapel Bridge?',
    options: ['Geneva', 'Lucerne', 'Basel'],
    answer: 'Lucerne'
  }
];


const QuizScreen = ({ route, navigation }) => {
  // Деструктурируем параметры, если их нет — будет undefined
  const { name, address, lat, lng, image, description, secretSpots } = route.params || {};

  const QUIZ_LENGTH = 10;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [congratsModal, setCongratsModal] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [disableAnswers, setDisableAnswers] = useState(false);

  // Количество заработанных "монет" за текущий квиз
  const [coins, setCoins] = useState(0);

  const { unlockCardByTitle } = useUnlockedCards();

  useEffect(() => {
    // Перемешиваем и берём QUIZ_LENGTH вопросов
    const shuffled = [...fullQuestionBank].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, QUIZ_LENGTH);
    setQuestions(selected);
  }, []);

  const currentQuestion = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSelectOption = (option) => {
    if (!currentQuestion || disableAnswers) return;

    setSelectedOption(option);
    setDisableAnswers(true);

    const isCorrect = (option === currentQuestion.answer);

    if (isCorrect) {
      setCoins((prev) => prev + 1);

      // Проверяем, последний ли вопрос
      if (currentIndex === questions.length - 1) {
        setTimeout(() => setCongratsModal(true), 800);
      } else {
        // Переходим к следующему вопросу
        setTimeout(() => {
          setSelectedOption(null);
          setDisableAnswers(false);
          setCurrentIndex(currentIndex + 1);
        }, 800);
      }
    } else {
      // Неправильно => сбрасываем квиз и монеты
      Alert.alert('Wrong Answer', 'You must start again from the beginning!');
      setTimeout(() => {
        setCoins(0);
        setSelectedOption(null);
        setDisableAnswers(false);
        setCurrentIndex(0);
      }, 800);
    }
  };

  const getOptionStyle = (option) => {
    if (!selectedOption) return styles.optionButton;
    if (option === selectedOption) {
      return option === currentQuestion.answer
        ? [styles.optionButton, { backgroundColor: 'green' }]
        : [styles.optionButton, { backgroundColor: 'red' }];
    }
    return styles.optionButton;
  };

  const handleCloseCongrats = async () => {
    // 1) Обновляем данные в AsyncStorage (монеты, посещённые места)
    try {
      const savedTriviaPoints = await AsyncStorage.getItem('triviaPoints');
      const currentPoints = savedTriviaPoints ? parseInt(savedTriviaPoints, 10) : 0;
      const updatedPoints = currentPoints + coins;

      const savedVisitedPlaces = await AsyncStorage.getItem('visitedPlaces');
      const currentVisited = savedVisitedPlaces ? parseInt(savedVisitedPlaces, 10) : 0;
      const updatedVisited = currentVisited + 1; // например, +1 за прохождение квиза

      await AsyncStorage.setItem('triviaPoints', String(updatedPoints));
      await AsyncStorage.setItem('visitedPlaces', String(updatedVisited));
    } catch (error) {
      console.error('Error updating quiz stats:', error);
    }

    setCongratsModal(false);

    // 2) Если у нас есть "name", значит квиз был связан с конкретной достопримечательностью
    if (name) {
      unlockCardByTitle(name);// Переход на AttractionScreen
      navigation.navigate('AttractionScreen', {
        name,
        address,
        lat,
        lng,
        image,
        description,
        secretSpots,
        questCompleted: true,
        secretUnlocked: 3,
        unlockedCardName: name,
      });
    } else {
      // 3) Иначе (нет параметров — "рандомный" квиз) просто переходим на MainMenu
      navigation.navigate('MainMenu');
    }
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.bgImage}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {/* Шапка: кнопка назад + монеты */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Image source={backArrowImg} style={styles.backButtonImage} />
          </TouchableOpacity>
          <View style={styles.coinContainer}>
            <Image source={coinImg} style={styles.coinImage} />
            <Text style={styles.coinText}>{coins}</Text>
          </View>
        </View>

        {/* Quiz content */}
        <View style={styles.container}>
          <Text style={styles.title}>{name ? name : 'Random Quiz'}</Text>
          <Text style={styles.questionCounter}>
            Question {currentIndex + 1} of {questions.length}
          </Text>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.options
            .sort(() => 0.5 - Math.random())
            .map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={getOptionStyle(option)}
                onPress={() => handleSelectOption(option)}
                disabled={disableAnswers}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Окно "Congratulations" */}
        {congratsModal && (
          <Modal visible={congratsModal} transparent animationType="fade">
            <ImageBackground source={backgroundImg} style={styles.modalBackground}>
              <View style={styles.modalOverlay2} />
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Congratulations! 🎉</Text>
                <Text style={styles.modalMessage}>
                  You've completed the quiz and unlocked all secret locations!
                  Explore these hidden gems and continue your adventure in Switzerland!
                  Oh, and don’t forget your Collectible Card – you deserved it 🌟
                </Text>
                <TouchableOpacity style={styles.okButton} onPress={handleCloseCongrats}>
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </Modal>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
 
  },
  safeArea: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    alignItems: 'center'
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25
  },
  backButtonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  coinImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 6
  },
  coinText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFD700',
    textAlign: 'center'
  },
  questionCounter: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff'
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff'
  },
  optionButton: {
    width: '80%',
    backgroundColor: '#8B0000',
    padding: 12,
    marginVertical: 5,
    borderRadius: 8
  },
  optionText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 18
  },
  modalBackground: {
    flex: 1,
    resizeMode: 'cover'
  },
  modalOverlay2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10
  },
  okButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10
  },
  okButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16
  }
});
export default QuizScreen;
