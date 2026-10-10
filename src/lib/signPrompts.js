// Simplified sign language (Auslan-style) gesture prompts for visual support boards.
// These are plain-language descriptions of common gestures, not certified Auslan instruction.

export const SIGN_CATEGORIES = ['Greetings', 'Feelings', 'Needs', 'Daily', 'People', 'Actions'];

export const SIGN_LIBRARY = [
  { word: 'Hello', emoji: '👋', category: 'Greetings', description: 'Open hand, fingers together, salute out from the temple then extend the hand forward.' },
  { word: 'Goodbye', emoji: '👋', category: 'Greetings', description: 'Open hand waving side to side, fingers bending together twice.' },
  { word: 'Thank you', emoji: '🙏', category: 'Greetings', description: 'Fingertips of the flat hand touch the chin, then move forward and down.' },
  { word: 'Please', emoji: '🤲', category: 'Greetings', description: 'Flat hand circles on the chest, clockwise.' },
  { word: 'Sorry', emoji: '🥺', category: 'Feelings', description: 'Fist rubs in small circles on the chest.' },
  { word: 'Happy', emoji: '😊', category: 'Feelings', description: 'Flat hands brush upward on the chest twice, like a shirt smoothing up.' },
  { word: 'Sad', emoji: '😢', category: 'Feelings', description: 'Both hands drop down in front of the face, palms in, like tears falling.' },
  { word: 'Angry', emoji: '😠', category: 'Feelings', description: 'Clawed hand pulls outward from near the mouth, twisting slightly.' },
  { word: 'Tired', emoji: '😴', category: 'Feelings', description: 'Both drooping hands lower slowly in front of the body, shoulders sagging.' },
  { word: 'Scared', emoji: '😨', category: 'Feelings', description: 'Hands open near the chest, shaking slightly, body leaning back.' },
  { word: 'Eat / Food', emoji: '🍽️', category: 'Needs', description: 'Fingers of the flat hand tap the chin twice, like bringing food to the mouth.' },
  { word: 'Drink', emoji: '🥤', category: 'Needs', description: 'Curved C hand tilts toward the mouth, like holding a cup.' },
  { word: 'Toilet', emoji: '🚽', category: 'Needs', description: 'Thumb between index and middle fingers of the loose fist, wiggled side to side.' },
  { word: 'Help', emoji: '🙋', category: 'Needs', description: 'One flat hand under the other fist, both lifted forward together.' },
  { word: 'More', emoji: '🔁', category: 'Needs', description: 'Both flat hands, fingertips tapping together twice in front of the body.' },
  { word: 'Finished / All done', emoji: '✅', category: 'Needs', description: 'Both flat hands twist outward and apart, finishing empty.' },
  { word: 'Yes', emoji: '👍', category: 'Needs', description: 'Fist nods up and down, like a head saying yes.' },
  { word: 'No', emoji: '👎', category: 'Needs', description: 'Index and middle fingers tap down onto the thumb, like a birds beak closing.' },
  { word: 'Stop', emoji: '✋', category: 'Actions', description: 'Flat hand chops down onto the other flat palm, held firm.' },
  { word: 'Wait', emoji: '⏳', category: 'Actions', description: 'Both flat hands, palms up, wiggle fingertips gently in place.' },
  { word: 'Come', emoji: '👉', category: 'Actions', description: 'Index finger extended, hooks toward the body twice.' },
  { word: 'Look', emoji: '👀', category: 'Actions', description: 'V fingers near the eyes flick outward, showing watching.' },
  { word: 'Listen', emoji: '👂', category: 'Actions', description: 'Index finger points to the ear, then opens outward.' },
  { word: 'Sleep', emoji: '🛏️', category: 'Daily', description: 'Open hand near the face lowers and closes, like a face resting.' },
  { word: 'Wash hands', emoji: '🧼', category: 'Daily', description: 'One fist twists over the other fist, like scrubbing.' },
  { word: 'Shower / Bath', emoji: '🚿', category: 'Daily', description: 'Curved hand brushes down over the head, like water running.' },
  { word: 'Get dressed', emoji: '👕', category: 'Daily', description: 'Both hands pinch at the chest, pulling outward, like adjusting clothes.' },
  { word: 'Shoes on', emoji: '👟', category: 'Daily', description: 'Closed fists tap together twice in front of the body.' },
  { word: 'Medicine', emoji: '💊', category: 'Daily', description: 'Index finger and thumb of one hand twist on the other wrist, like rubbing cream in.' },
  { word: 'Car', emoji: '🚗', category: 'Daily', description: 'Both fists turn as if steering a wheel.' },
  { word: 'Home', emoji: '🏠', category: 'Daily', description: 'Fingertips of the flat hand touch the side of the mouth, then the ear, tracing home.' },
  { word: 'Mum', emoji: '👩', category: 'People', description: 'Loose fist taps the cheek with the thumb side, twice.' },
  { word: 'Dad', emoji: '👨', category: 'People', description: 'Index and middle fingers tap the cheek twice.' },
  { word: 'Friend', emoji: '🤝', category: 'People', description: 'Index fingers hook together, then reverse and hook again.' },
  { word: 'Support worker', emoji: '🧑‍💼', category: 'People', description: 'Open hand taps the shoulder, showing someone who helps.' },
  { word: 'My / Mine', emoji: '👉', category: 'People', description: 'Flat hand presses on the chest.' },
];

export const findSign = (word) => SIGN_LIBRARY.find((s) => s.word === word);