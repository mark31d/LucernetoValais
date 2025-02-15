import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ImageBackground,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { launchImageLibrary } from 'react-native-image-picker';

const backgroundImage = require('../assets/background.jpg');
const defaultProfileImage = require('../assets/emoji.png');

const GOLD = '#FFD700';
const DARK_RED = '#8B0000';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Card parameters for horizontal scroll
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_PADDING = SCREEN_WIDTH * 0.03;
const CARD_RADIUS = SCREEN_WIDTH * 0.03;
const CARD_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.18;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.2;

const PROFILE_SIZE = SCREEN_WIDTH * 0.4;
const BUTTON_SIZE = SCREEN_WIDTH * 0.4;


const attractions = [
  {
    name: 'The Matterhorn',
    address: 'Zermatt, 3920 Zermatt, Switzerland',
    lat: 46.0207,
    lng: 7.6586,
    image: require('../assets/ph1.jpg'),
    description:
      'The iconic Matterhorn is one of the highest peaks in the Alps, standing proudly at 4,478 meters. Known for its pyramid shape, it is a favorite among climbers and photographers.',
    secretSpots: [
      {
        name: 'Hörnli Hut',
        address: '3920 Zermatt, Switzerland',
        description:
          'The Hörnli Hut is the main base camp for climbers attempting to summit the Matterhorn. Located at 3,260 meters, it offers breathtaking views and essential services for adventurers.'
      },
      {
        name: 'Gornergrat',
        address: 'Gornergrat Bahn, 3920 Zermatt, Switzerland',
        description:
          'A stunning viewing platform accessible by train, Gornergrat provides panoramic views of the Matterhorn and surrounding peaks. It’s perfect for hiking and photography.'
      },
      {
        name: 'Schwarzsee',
        address: '3920 Zermatt, Switzerland',
        description:
          'Schwarzsee is a picturesque lake near the Matterhorn with walking trails and picnic spots. The area is known for its serene landscapes and close-up views of the mountain.'
      }
    ]
  },
  {
    name: 'Lake Lucerne',
    address: 'Lucerne, 6003 Lucerne, Switzerland',
    lat: 47.0502,
    lng: 8.3093,
    image: require('../assets/ph2.jpg'),
    description:
      'Nestled among towering mountains, Lake Lucerne is famous for its clear water, scenic boat rides, and historic bridges.',
    secretSpots: [
      {
        name: 'Rigi Mountain',
        address: 'Rigi, 6354 Weggis, Switzerland',
        description:
          'Known as the "Queen of the Mountains," Rigi offers spectacular views over Lake Lucerne and is accessible by cogwheel train or hiking, making it a perfect getaway.'
      },
      {
        name: 'Pilatus',
        address: 'Pilatus, 6010 Lucerne, Switzerland',
        description:
          'Pilatus features dramatic landscapes and hiking trails. The summit can be reached via the world’s steepest cogwheel railway, offering stunning views of the lake below.'
      },
      {
        name: 'Chapel Bridge (Kapellbrücke)',
        address: 'Weinmarkt, 6004 Lucerne, Switzerland',
        description:
          'This iconic wooden bridge dates back to the 14th century and is adorned with beautiful paintings. It is a symbol of Lucerne’s medieval architecture and history.'
      }
    ]
  },
  {
    name: 'Grand Casino Luzern',
    address: 'Haldenstrasse 6, 6006 Lucerne, Switzerland',
    lat: 47.0508,
    lng: 8.2920,
    image: require('../assets/ph3.jpg'),
    description:
      'A historic casino that combines elegance and entertainment, offering gambling, fine dining, and a touch of glamour.',
    secretSpots: [
      {
        name: 'Lakefront Promenade',
        address: '6004 Lucerne, Switzerland',
        description:
          'A scenic lakeside promenade perfect for leisurely strolls, offering beautiful views of Lake Lucerne and surrounding mountains.'
      },
      {
        name: 'Richard Wagner Museum',
        address: 'Richard Wagner Weg 27, 6005 Lucerne, Switzerland',
        description:
          'Located in Wagner’s former residence, this museum showcases the life and works of the famous composer and is nestled in beautiful gardens.'
      },
      {
        name: 'The Swiss Museum of Transport',
        address: 'Lidostrasse 5, 6006 Lucerne, Switzerland',
        description:
          'An interactive museum dedicated to all forms of transportation in Switzerland, featuring exhibits on trains, planes, and automobiles.'
      }
    ]
  },
  {
    name: 'Chillon Castle',
    address: 'Avenue de Chillon 21, 1820 Veytaux, Switzerland',
    lat: 46.4142,
    lng: 6.9279,
    image: require('../assets/ph4.jpg'),
    description:
      'This medieval fortress sits on the shores of Lake Geneva, with a history dating back to the 12th century.',
    secretSpots: [
      {name: 'The Dungeon',
        address: 'Château de Chillon, 1820 Veytaux, Switzerland',
        description:
          'The castle’s dungeon, steeped in history, offers a glimpse into medieval life. Visitors can learn about the castle’s past and its role as a prison.'
      },
      {
        name: 'The Wine Cellar',
        address: 'Château de Chillon, 1820 Veytaux, Switzerland',
        description:
          'The castle’s wine cellar showcases the region’s wine production history and features a selection of local wines, making it a hidden gem for wine enthusiasts.'
      },
      {
        name: 'The Chapel',
        address: 'Château de Chillon, 1820 Veytaux, Switzerland',
        description:
          'This beautifully preserved chapel within the castle features stunning stained glass windows and offers insight into the castle’s religious history.'
      }
    ]
  },
  {
    name: 'Bern Old Town',
    address: '3011 Bern, Switzerland',
    lat: 46.9480,
    lng: 7.4474,
    image: require('../assets/ph5.jpg'),
    description:
      'A UNESCO World Heritage site, Bern’s Old Town is known for its medieval architecture, cobbled streets, and clock tower.',
    secretSpots: [
      {
        name: 'Rosengarten',
        address: 'Alter Aargauerstalden 31, 3005 Bern, Switzerland',
        description:
          'A beautiful rose garden with over 200 varieties of roses, providing stunning views of Bern’s Old Town and the Aare River.'
      },
      {
        name: 'The Federal Palace (Bundeshaus)',
        address: 'Bundesplatz 3, 3005 Bern, Switzerland',
        description:
          'Home to the Swiss Federal Assembly, the Federal Palace offers guided tours to explore Swiss politics and architecture.'
      },
      {
        name: 'The Einstein Museum',
        address: 'Kramgasse 49, 3011 Bern, Switzerland',
        description:
          'Dedicated to Albert Einstein, this museum showcases his life, work, and the impact of his theories on modern science.'
      }
    ]
  },
  {
    name: 'Jungfraujoch',
    address: 'Jungfrau Region, 3801 Lauterbrunnen, Switzerland',
    lat: 46.6059,
    lng: 7.9851,
    image: require('../assets/ph6.jpg'),
    description:
      'Known as the “Top of Europe,” Jungfraujoch is a high-altitude saddle offering breathtaking views and an ice palace.',
    secretSpots: [
      {
        name: 'Aletsch Glacier Viewpoint',
        address: 'Jungfraujoch, 3822 Lauterbrunnen, Switzerland',
        description:
          'A breathtaking viewpoint overlooking the Aletsch Glacier, this spot is ideal for photography and experiencing the glacier’s vastness up close.'
      },
      {
        name: 'Ice Palace',
        address: 'Jungfraujoch, 3822 Lauterbrunnen, Switzerland',
        description:
          'The Ice Palace features impressive ice sculptures and tunnels carved into the glacier, providing a unique experience beneath the icy surface.'
      },
      {
        name: 'Sphinx Observatory',
        address: 'Jungfraujoch, 3822 Lauterbrunnen, Switzerland',
        description:
          'Located at 3,571 meters, this research facility offers stunning panoramic views of the Alps and is one of the highest observatories in Europe.'
      }
    ]
  },
  {
    name: 'Aletsch Glacier',
    address: 'Aletsch Arena, 3984 Fiesch, Switzerland',
    lat: 46.5291,
    lng: 8.0610,
    image: require('../assets/ph7.jpg'),
    description:
      'The longest glacier in the Alps, Aletsch Glacier is a marvel of nature, stretching over 23 kilometers.',
    secretSpots: [
      {
        name: 'Bettmeralp',
        address: '3992 Bettmeralp, Switzerland',
        description:
          'A charming mountain village offering access to hiking trails and stunning views of the Aletsch Glacier, perfect for a tranquil escape.'
      },
      {
        name: 'Fiescheralp',
        address: '3992 Fiescheralp, Switzerland',
        description:
          'This mountain plateau provides excellent hiking routes with breathtaking views of the glacier and surrounding peaks.'
      },
      {
        name: 'Riederalp',address: '3991 Riederalp, Switzerland',
        description:
          'A serene village situated near the Aletsch Glacier, offering various hiking trails and a peaceful atmosphere surrounded by nature.'
      }
    ]
  },
  {
    name: 'Zurich Old Town',
    address: '8001 Zurich, Switzerland',
    lat: 47.3769,
    lng: 8.5417,
    image: require('../assets/ph8.jpg'),
    description:
      'A blend of medieval and modern, Zurich’s Old Town is filled with historic buildings, cozy cafes, and cultural landmarks.',
    // No user-provided secret spots for Zurich Old Town, so we leave it empty or add a placeholder
    secretSpots: []
  },
  {
    name: 'Lavaux Vineyards',
    address: 'Route de la Corniche, 1096 Lavaux, Switzerland',
    lat: 46.4844,
    lng: 6.6854,
    image: require('../assets/ph9.jpg'),
    description:
      'The Lavaux Vineyards are a UNESCO World Heritage site, famous for their terraced vineyards and lakeside views.',
    // No user-provided secret spots for Lavaux Vineyards
    secretSpots: []
  },
  {
    name: 'St. Moritz',
    address: '7500 St. Moritz, Switzerland',
    lat: 46.4983,
    lng: 9.8383,
    image: require('../assets/ph10.jpg'),
    description:
      'Known for luxury resorts and winter sports, St. Moritz is a favorite among the world’s elite.',
    secretSpots: [
      {
        name: 'Lake St. Moritz',
        address: '7500 St. Moritz, Switzerland',
        description:
          'A picturesque lake popular for swimming, sailing, and scenic walks, especially in the summer months.'
      },
      {
        name: 'Muottas Muragl',
        address: '7500 St. Moritz, Switzerland',
        description:
          'Accessible by funicular, Muottas Muragl offers stunning views of the Upper Engadine and is an ideal starting point for hiking trails.'
      },
      {
        name: 'The Engadine Museum',
        address: 'Via dal Bagn 2, 7500 St. Moritz, Switzerland',
        description:
          'This museum showcases the cultural history of the Engadine region, featuring traditional artifacts, art, and exhibitions on local life.'
      }
    ]
  }
];


const MainMenu = ({ navigation }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [profileImage, setProfileImage] = useState(defaultProfileImage);

  // User-created attractions
  const [customAttractions, setCustomAttractions] = useState([]);

  // States for "Add Attraction" modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newImage, setNewImage] = useState(null);

  const tutorialPages = [
    'Historical Cards: When visiting an attraction, you must take a quiz. After completing the quiz, a collectible card is "unlocked."',
    'Trivia: A quiz about Switzerland is launched for new locations. Complete it to unlock secret places and get a collectible card!',
    'Secret Locations: By completing each quiz (10 questions), you unlock 3 secret places for that location.'
  ];

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem('avatar');
        if (storedAvatar && storedAvatar !== 'default') {
          setProfileImage({ uri: storedAvatar });
        } else {
          setProfileImage(defaultProfileImage);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };
    loadAvatar();
  }, []);

  useEffect(() => {
    const loadCustomAttractions = async () => {
      try {
        const stored = await AsyncStorage.getItem('customAttractions');
        if (stored) {
          setCustomAttractions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading customAttractions:', error);
      }
    };
    loadCustomAttractions();
  }, []);

  const saveCustomAttractions = async (data) => {
    try {
      await AsyncStorage.setItem('customAttractions', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving customAttractions:', error);
    }
  };

  // Function to pick an image for the attraction
  const handlePickImage = () => {
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
          setNewImage({ uri: response.assets[0].uri });
        }
      }
    );
  };  // Save the new attraction
  const handleAddAttraction = () => {
    if (!newName.trim() || !newLat.trim() || !newLng.trim()) {
      Alert.alert('Error', 'Please fill in Name, Latitude, and Longitude.');
      return;
    }
    const latNum = parseFloat(newLat);
    const lngNum = parseFloat(newLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      Alert.alert('Error', 'Latitude and Longitude must be valid numbers.');
      return;
    }
    const newAttraction = {
      name: newName,
      description: newDescription,
      lat: latNum,
      lng: lngNum,
      image: newImage ? newImage : require('../assets/emoji.png'),
    };
    const updated = [...customAttractions, newAttraction];
    setCustomAttractions(updated);
    saveCustomAttractions(updated);
    // Reset fields
    setNewName('');
    setNewDescription('');
    setNewLat('');
    setNewLng('');
    setNewImage(null);
    setShowAddModal(false);
  };

  const fullList = [...attractions, ...customAttractions];

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Settings Button */}
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
          {/* Top Row: Profile and Collectible Cards */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.profileContainer}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image source={profileImage} style={styles.profileImage} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.collectibleButton}
              onPress={() => navigation.navigate('CollectibleCards')}
            >
              <Text style={styles.buttonText}>Collectible Cards</Text>
            </TouchableOpacity>
          </View>
          {/* Add Attraction Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.buttonText}>Add Attraction</Text>
          </TouchableOpacity>
          {/* Horizontal scroll of attractions */}
          <View style={styles.horizontalScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              snapToInterval={CARD_WIDTH + SCREEN_WIDTH * 0.02}
              decelerationRate="fast"
            >
              {fullList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('AttractionScreen', { ...item })
                  }
                >
                  <Image source={item.image} style={styles.attractionImage} />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: item.lat,
                        longitude: item.lng,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                      }}
                    >
                      <Marker
                        coordinate={{ latitude: item.lat, longitude: item.lng }}
                        title={item.name}
                        description={item.description || ''}
                      />
                    </MapView>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>         
          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={styles.halfWidthButton}
              onPress={() => navigation.navigate('QuizScreen')}
            >
              <Text style={styles.buttonText}>Start Trivia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.halfWidthButton}
              onPress={() => navigation.navigate('Folder')}
            >
              <Text style={styles.buttonText}>Folder</Text>
            </TouchableOpacity>
          </View>
          {/* Tutorial Modal */}
          {showTutorial && (
            <Modal transparent visible={showTutorial} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalText}>
                    {tutorialPages[tutorialStep]}
                  </Text>
                  <View style={styles.modalButtons}>
                    {tutorialStep > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          { marginRight: SCREEN_WIDTH * 0.015 },
                        ]}
                        onPress={() => setTutorialStep(tutorialStep - 1)}
                      >
                        <Text style={styles.modalButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    {tutorialStep < tutorialPages.length - 1 ? (
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setTutorialStep(tutorialStep + 1)}
                      >
                        <Text style={styles.modalButtonText}>Next</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setShowTutorial(false)}
                      >
                        <Text style={styles.modalButtonText}>OK</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </Modal>
          )}
          {/* Add Attraction Modal (no secret spot fields) */}
          <Modal visible={showAddModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                <View style={styles.addContainer}>
                  <Text style={styles.modalText}>Add a New Attraction</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#888"
                    value={newName}
                    onChangeText={setNewName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    placeholderTextColor="#888"
                    value={newDescription}
                    onChangeText={setNewDescription}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Latitude"
                    placeholderTextColor="#888"
                    value={newLat}
                    onChangeText={setNewLat}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Longitude"
                    placeholderTextColor="#888"
                    value={newLng}
                    onChangeText={setNewLng}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={[styles.modalButton, { marginBottom: SCREEN_WIDTH * 0.03 }]}
                    onPress={handlePickImage}
                  >                    <Text style={styles.modalButtonText}>Pick Attraction Image</Text>
                  </TouchableOpacity>
                  {newImage && (
                    <Image source={newImage} style={styles.modalImage} />
                  )}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { marginRight: SCREEN_WIDTH * 0.015 },
                      ]}
                      onPress={() => setShowAddModal(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleAddAttraction}
                    >
                      <Text style={styles.modalButtonText}>Save Attraction</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
  },
  settingsContainer: {
    width: '100%',
    marginBottom: SCREEN_WIDTH * 0.01,
  },
  settingsButton: {
    backgroundColor: DARK_RED,
    paddingVertical: SCREEN_WIDTH * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    borderRadius: SCREEN_WIDTH * 0.04,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    width: '100%',
  },
  settingsButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.06,
    textAlign: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: SCREEN_WIDTH * 0.03,
  },
  profileContainer: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    borderRadius: SCREEN_WIDTH * 0.05,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collectibleButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: DARK_RED,
    borderRadius: SCREEN_WIDTH * 0.05,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewButton: {
    backgroundColor: DARK_RED,
    borderRadius: SCREEN_WIDTH * 0.03,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    paddingVertical: SCREEN_WIDTH * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    alignItems: 'center',
    width: '100%',
    marginBottom: SCREEN_WIDTH * 0.04,
    marginTop: SCREEN_WIDTH * 0.02,
  },
  buttonText: {
    color: GOLD,
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  horizontalScrollWrapper: {
    width: '100%',
    marginVertical: SCREEN_WIDTH * 0.02,
  },
  horizontalScrollContent: {
    paddingLeft: SCREEN_WIDTH * 0.02,
    paddingRight: SCREEN_WIDTH * 0.02,
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: SCREEN_WIDTH * 0.003,
    borderColor: GOLD,
    borderRadius: CARD_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: CARD_PADDING,
    marginRight: SCREEN_WIDTH * 0.02,
    alignItems: 'center',
  },
  attractionImage: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    resizeMode: 'cover',
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_WIDTH * 0.02,
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: SCREEN_WIDTH * 0.02,
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: MAP_HEIGHT,
    marginTop: SCREEN_WIDTH * 0.02,
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',    borderWidth: SCREEN_WIDTH * 0.003,
    borderColor: GOLD,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  rowButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_WIDTH * 0.04,
    justifyContent: 'space-between',
  },
  halfWidthButton: {
    width: '48%',
    backgroundColor: DARK_RED,
    paddingVertical: SCREEN_WIDTH * 0.08,
    borderRadius: SCREEN_WIDTH * 0.03,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContainer: {
    width: '100%',               
    maxWidth: SCREEN_WIDTH,
    maxHeight: SCREEN_HEIGHT * 0.7, 
    backgroundColor: 'rgba(43,43,43,0.95)',
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    borderRadius: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.05,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'rgba(43,43,43,0.95)',
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
    borderRadius: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.05,
  },
  modalText: {
    color: GOLD,
    fontSize: SCREEN_WIDTH * 0.045,
    marginBottom: SCREEN_WIDTH * 0.05,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    backgroundColor: DARK_RED,
    paddingVertical: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.03,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: GOLD,
  },
  modalButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.05,
  },
  modalImage: {
    width: '100%',              
    height: SCREEN_HEIGHT * 0.2,   
    marginBottom: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.02,
    resizeMode: 'contain',      
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderColor: GOLD,
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_WIDTH * 0.03,
    color: DARK_RED,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    fontSize: SCREEN_WIDTH * 0.045,
  },
});

export default MainMenu;
