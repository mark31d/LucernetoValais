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
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';

// Background & default avatar
const backgroundImage = require('../assets/background.jpg');
const defaultProfileImage = require('../assets/emoji.png'); // <-- Наш дефолтный аватар

const GOLD = '#FFD700';
const DARK_RED = '#8B0000';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // По умолчанию ставим дефолтный аватар
  const [profileImage, setProfileImage] = useState(defaultProfileImage);

  const tutorialPages = [
    'Historical Cards: When visiting an attraction, you must take a quiz. After completing the quiz, a collectible card with a brief history of the place is "unlocked."',
    'Trivia: A quiz with questions about Switzerland is launched for new locations. You must complete the quiz to unlock the secret places of the location and receive a collectible card. You can also play the quiz just for fun in the main menu of the app.',
    'Secret Locations: By successfully completing the quiz of 10 questions at each attraction, you will unlock 3 secret places at that location.'
  ];

  // Load avatar (if saved in Profile) from AsyncStorage
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const storedAvatar = await AsyncStorage.getItem('avatar');
        // Если в хранилище нет аватара или там 'default', 
        // оставляем дефолт (emoji.png)
        if (storedAvatar && storedAvatar !== 'default') {
          setProfileImage({ uri: storedAvatar });
        } else {
          setProfileImage(defaultProfileImage);
        }
      } catch (error) {
        console.error('Error loading avatar from storage:', error);
      }
    };
    loadAvatar();
  }, []);

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
    
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>

        
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
        <View style={styles.horizontalScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {attractions.map((item, index) => (
              
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => {
                  navigation.navigate('AttractionScreen', { ...item });
                }}
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
                      longitudeDelta: 0.1
                    }}
                  >
                    <Marker
                      coordinate={{ latitude: item.lat, longitude: item.lng }}
                      title={item.name}
                      description={item.address}
                    />
                  </MapView>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

       
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.halfWidthButton, { marginRight: 5 }]}
            onPress={() => navigation.navigate('QuizScreen')}
          >
            <Text style={styles.buttonText}>Start Trivia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.halfWidthButton, { marginLeft: 5 }]}
            onPress={() => navigation.navigate('Folder')}
          >
            <Text style={styles.buttonText}>Folder</Text>
          </TouchableOpacity>
        </View>

       
        {showTutorial && (
          <Modal transparent visible={showTutorial}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>{tutorialPages[tutorialStep]}</Text>
                <View style={styles.modalButtons}>
                  {tutorialStep > 0 && (
                    <TouchableOpacity
                      style={[styles.modalButton, { marginRight: 10 }]}
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
      </ScrollView>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center'
  }, 
  settingsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GOLD
  },
  settingsText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 18
  },

  /* Top Row: Profile + Collectible Cards */
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20
  },
  profileContainer: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 20,
    overflow: 'hidden'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  collectibleButton: {
    width: 150,
    height: 150,
    backgroundColor: DARK_RED,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: GOLD,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  /* Horizontal scroll for the attractions */
  horizontalScrollWrapper: {
    width: '100%',
    marginVertical: 10
  },
  horizontalScrollContent: {
    paddingLeft: 10,
    paddingRight: 10
  },
  card: {
    width: 280,
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    marginRight: 12,
    alignItems: 'center'
  },
  attractionImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderRadius: 6,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GOLD,
    marginBottom: 4,
    textAlign: 'center'
  },
  mapContainer: {
    width: '100%',
    height: 150,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GOLD
  },
  map: {
    width: '100%',
    height: '100%'
  },
  /* Bottom Row: Trivia & Folder */
  rowButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'center'
  },
  halfWidthButton: {
    flex: 1,
    backgroundColor: DARK_RED,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center'
  },

  /* Tutorial Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'rgba(43,43,43,0.95)',
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 10,
    padding: 20
  },
  modalText: {
    color: GOLD,
    fontSize: 18,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  modalButton: {
    backgroundColor: DARK_RED,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: GOLD
  },
  modalButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default MainMenu;
