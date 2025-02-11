import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  Modal,
  Animated
} from 'react-native';
import { useUnlockedCards } from './UnlockedCardsContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GOLD = '#FFD700';
const DARK_RED = '#8B0000';
const backgroundImg = require('../assets/background.jpg');
const backArrowImg = require('../assets/back.png');

const initialCards = [
    {
      id: '1',
      unlocked: true, 
      front: {
        image: require('../assets/ph101.jpg'), 
        title: 'The Matterhorn',
        subtitle: 'Swiss Alps, Zermatt'
      },
      back: {
        description:
          'The Matterhorn, standing at 4,478 meters, is one of Switzerland’s most iconic mountains and draws mountaineers and photographers from around the world for its distinctive shape.',
        fact: 'The mountain was first summited in 1865, though it came with a tragic descent, marking its place in history.',
        didYouKnow:
          'The Matterhorn’s faces align with the four cardinal directions, giving it an exceptional geometric appearance.'
      }
    },
    
    {
      id: '2',
      unlocked: true,
      front: {
        image: require('../assets/ph102.jpg'),
        title: 'Lake Lucerne',
        subtitle: 'Lucerne Region'
      },
      back: {
        description:
          'Lake Lucerne, also known as Vierwaldstättersee, is Switzerland’s fourth-largest lake and renowned for its scenic views, boat trips, and historical sites along its shores.',
        fact: 'The lake gets its name from the four forested regions, or cantons, surrounding it.',
        didYouKnow:
          'Paddle steamers have been running on Lake Lucerne since the late 19th century, offering panoramic lake cruises.'
      }
    },
    {
      id: '3',
      unlocked: false,
      front: {
        image: require('../assets/ph103.jpg'),
        title: 'Château de Chillon',
        subtitle: 'Lake Geneva, Montreux'
      },
      back: {
        description:
          'This medieval fortress, dating back to the 12th century, has inspired writers like Lord Byron and painters with its lakeside location and breathtaking architecture.',
        fact: 'Château de Chillon was a toll station for trade routes between Italy and northern Europe.',
        didYouKnow:
          'The castle has 25 separate buildings, including an eerie dungeon once used as a prison.'
      }
    },
    {
      id: '4',
      unlocked: false,
      front: {
        image: require('../assets/ph104.jpg'),
        title: 'Jungfraujoch',
        subtitle: 'Bernese Oberland, Top of Europe'
      },
      back: {
        description:
          'Known as the “Top of Europe,” Jungfraujoch offers stunning alpine views and is accessible by the highest railway in Europe.',
        fact: 'he Jungfrau Railway was completed in 1912 after a 16-year construction period.',
        didYouKnow:
          'The Sphinx Observatory here sits at 3,571 meters, providing a unique scientific research outpost.'
      }
    },
    {
      id: '5',
      unlocked: false,
      front: {
        image: require('../assets/ph105.jpg'),
        title: 'Swiss National Park',
        subtitle: 'Engadine Valley'
      },
      back: {
        description:
          'Established in 1914, this is Switzerland’s only national park, protecting over 170 square kilometers of natural beauty and alpine biodiversity.',
        fact: 'It’s the oldest national park in the Alps and has strict protection policies for its wildlife.',
        didYouKnow:
          'Visitors must stay on marked trails to protect the environment and preserve wildlife habitats.'
      }
    },
    {
      id: '6',
      unlocked: false,
      front: {
        image: require('../assets/ph106.jpg'),
        title: 'Bern Old Town',
        subtitle: 'Bern, UNESCO World Heritage Site'
      },
      back: {
        description:
          'Bern’s Old Town, with its medieval architecture, is a UNESCO World Heritage site and home to the famous Zytglogge clock tower.',
        fact: 'The city’s characteristic sandstone buildings date back to the 15th and 16th centuries.',
        didYouKnow:
          'Albert Einstein once lived here, and his apartment is now a museum.'
      }
    },
    {
      id: '7',
      unlocked: false,
      front: {
        image: require('../assets/ph107.jpg'),
        title: 'Grand Casino Luzern',
        subtitle: 'Lucerne'
      },
      back: {
        description:'Grand Casino Luzern is known for its elegant architecture, fine dining, and scenic lakeside location, offering entertainment and gaming in the heart of Lucerne.',
        fact: 'Opened in 1882, it remains one of Switzerland’s most popular casinos.',
        didYouKnow:
          'Besides gaming, it regularly hosts concerts and cultural events, blending modern entertainment with historic charm.'
      }
    },
    {
      id: '8',
      unlocked: false,
      front: {
        image: require('../assets/ph108.jpg'),
        title: 'Aletsch Glacier',
        subtitle: 'Jungfrau-Aletsch Protected Area'
      },
      back: {
        description:
          'The Aletsch Glacier, stretching over 23 km, is the largest glacier in the Alps and a UNESCO World Heritage Site.',
        fact: 'Scientists have monitored this glacier’s gradual retreat due to climate change.',
        didYouKnow: 'It contains nearly 11 billion tons of ice, enough to fill 4 million Olympic swimming pools.'
      }
    },
    {
      id: '9',
      unlocked: false,
      front: {
        image: require('../assets/ph109.jpg'),
        title: 'St. Moritz',
        subtitle: 'Engadine Valley'
      },
      back: {
        description:
          'Known for its glamorous ski resorts, St. Moritz is a luxury destination famous for winter sports, luxury, and elegance.',
        fact: 'St. Moritz hosted the Winter Olympics twice, in 1928 and 1948.',
        didYouKnow: ' It’s home to the famous Cresta Run, a natural ice skeleton racing track.'
      }
    },
    {
      id: '10',
      unlocked: false,
      front: {
        image: require('../assets/ph110.jpg'),
        title: 'Rhine Falls',
        subtitle: 'Schaffhausen'
      },
      back: {
        description:
          'The Rhine Falls is Europe’s largest waterfall, attracting thousands of visitors for its roaring cascades and boat rides.',
        fact: 'The falls are over 15,000 years old, formed during the last Ice Age.',
        didYouKnow:
          ' In summer, more than 600,000 liters of water per second tumble over the falls.'
      }
    }
  ];

export default function CollectibleCards() {
  const navigation = useNavigation();
  const { unlockedTitles } = useUnlockedCards();

  // Local state for the grid (small cards)
  const [cards, setCards] = useState(() =>
    initialCards.map((c) => ({ ...c, flipped: false }))
  );

  // Full-screen modal state
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Flip animation (for the modal card)
  const flipAnim = useRef(new Animated.Value(0)).current; // from 0 to 1
  const [flippedInModal, setFlippedInModal] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });

  // Handler: tap on a card in the grid
  const handleCardPress = (item) => {
    const isUnlocked = unlockedTitles.includes(item.front.title);
    if (!isUnlocked) {
      return; // Card is locked, do nothing or show alert
    }
    setSelectedCard(item);
    setFlippedInModal(false);
    flipAnim.setValue(0); // Reset to front side
    setShowModal(true);
  };

  // Handler: flip a small card in the grid on long-press
  const handleGridFlip = (cardId) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const isUnlocked = unlockedTitles.includes(card.front.title);
          if (!isUnlocked) return card;
          return { ...card, flipped: !card.flipped };
        }
        return card;
      })
    );
  };

  // Handler: flip the large card in the modal
  const flipModalCard = () => {
    const toValue = flippedInModal ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true
    }).start(() => {
      setFlippedInModal(!flippedInModal);
    });
  };

  // Render each small card in the grid
  const renderCard = ({ item }) => {
    const isUnlocked = unlockedTitles.includes(item.front.title);
    const borderColor = isUnlocked ? GOLD : '#aaa';
    const imageStyle = isUnlocked ? {} : { tintColor: 'gray' };

    // Front side
    if (!item.flipped) {
      return (
        <TouchableOpacity
          style={[styles.cardContainer, { borderColor }]}
          onPress={() => handleCardPress(item)}
          onLongPress={() => handleGridFlip(item.id)}
          activeOpacity={0.9}
        >
          <Image
            source={item.front.image}
            style={[styles.cardImage, imageStyle]}
          />
          <Text style={[styles.cardTitle, !isUnlocked && { color: 'gray' }]}>
            {item.front.title}
          </Text>
          <Text style={[styles.cardSubtitle, !isUnlocked && { color: 'gray' }]}>
            {item.front.subtitle}
          </Text>
        </TouchableOpacity>
      );
    } else {
      // Back side
      return (
        <TouchableOpacity
          style={[styles.cardContainer, { borderColor }]}
          onPress={() => handleCardPress(item)}
          onLongPress={() => handleGridFlip(item.id)}
          activeOpacity={0.9}
        >
          <Text style={styles.cardBackTitle}>Description:</Text>
          <Text style={styles.cardBackText}>{item.back.description}</Text>
        </TouchableOpacity>
      );
    }
  };// Styles for animated front & back in the modal
  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }]
  };
  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }]
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.background}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Arrow */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={backArrowImg} style={styles.backButtonImage} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Collectible Cards</Text>
          {/* пустой View для выравнивания заголовка по центру */}
          <View style={{ width: 40, marginLeft: 10 }} />
        </View>

        <FlatList
          data={cards}
          numColumns={2}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />

        {/* Full-screen modal for the selected card */}
        {showModal && selectedCard && (
          <Modal visible={showModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>

              {/* << Изменено для статичной кнопки Close >> */}
              {/* Кнопка "Close" вынесена за пределы scrollable контента
                  и позиционирована абсолютно (статично). */}
              <TouchableOpacity
                style={styles.closeButtonStatic} // << позиционирование
                onPress={() => {
                  setShowModal(false);
                  setSelectedCard(null);
                  setFlippedInModal(false);
                  flipAnim.setValue(0);
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>

              <View style={styles.modalContent}>
                {/* Большая карточка */}
                <View style={styles.largeCardContainer}>
                  {/* FRONT */}
                  <Animated.View
                    style={[
                      styles.largeCard,
                      frontAnimatedStyle,
                      { opacity: flippedInModal ? 0 : 1 }
                    ]}
                  >
                    <Image
                      source={selectedCard.front.image}
                      style={styles.largeCardImage}
                    />
                    <Text style={styles.largeCardTitle}>
                      {selectedCard.front.title}
                    </Text>
                    <Text style={styles.largeCardSubtitle}>
                      {selectedCard.front.subtitle}
                    </Text>
                  </Animated.View>

                  {/* BACK */}
                  <Animated.View
                    style={[
                      styles.largeCard,
                      styles.cardBackAbsolute,
                      backAnimatedStyle,
                      { opacity: flippedInModal ? 1 : 0 }
                    ]}
                  >
                    <Text style={styles.cardBackTitle}>Description:</Text>
                    <Text style={styles.cardBackText}>
                      {selectedCard.back.description}
                    </Text>

                    <Text style={styles.cardBackTitle}>Interesting Fact:</Text>
                    <Text style={styles.cardBackText}>
                      {selectedCard.back.fact}
                    </Text>

                    <Text style={styles.cardBackTitle}>Did You Know?:</Text>
                    <Text style={styles.cardBackText}>
                      {selectedCard.back.didYouKnow}
                    </Text>
                  </Animated.View>
                </View>{/* Кнопка Flip */}
                <TouchableOpacity style={styles.flipButton} onPress={flipModalCard}>
                  <Text style={styles.flipButtonText}>
                    {flippedInModal ? 'See Front' : 'Flip Card'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
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
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15
  },
  backButton: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: '#FFF'
  },
  backButtonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: GOLD,
    textAlign: 'center'
  },
  listContent: {
    alignItems: 'center',
    paddingBottom: 40
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.45,
    margin: 12,
    padding: 12,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(43,43,43,0.5)',
    alignItems: 'center'
  },
  cardImage: {
    width: '100%',
    height: (SCREEN_WIDTH * 0.45) * 0.6,
    marginBottom: 8,
    borderRadius: 8
  },
  cardTitle: {
    fontSize: 18,
    color: GOLD,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center'
  },
  cardSubtitle: {
    fontSize: 16,
    color: GOLD,
    textAlign: 'center'
  },
  cardBackTitle: {
    fontSize: 16,
    color: GOLD,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'center'
  },
  cardBackText: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 4,
    textAlign: 'justify'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center'
  },
  // << Изменено для статичной кнопки Close >>
  closeButtonStatic: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,           // чтобы быть над остальным контентом
    backgroundColor: DARK_RED,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: GOLD
  },
  closeButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 16
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'rgba(43,43,43,0.95)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: GOLD
  },
  largeCardContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  largeCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    alignItems: 'center'
  },
  cardBackAbsolute: {
    top: 0
  },
  largeCardImage: {
    width: SCREEN_WIDTH * 0.65,
    height: (SCREEN_WIDTH * 0.65) * 0.6,
    marginBottom: 10,
    borderRadius: 8
  },
  largeCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 6,
    textAlign: 'center'
  },
  largeCardSubtitle: {
    fontSize: 18,
    color: GOLD,
    marginBottom: 10,
    textAlign: 'center'
  },
  flipButton: {
    backgroundColor: DARK_RED,
    borderRadius: 8,
    borderColor: GOLD,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginTop: 15
  },
  flipButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 16
  }
});
