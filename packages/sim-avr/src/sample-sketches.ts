/**
 * Educational starter sketches with verified Intel HEX binaries and commented C++ Arduino source code.
 */

import { type SketchPreset } from './types';

export const SKETCH_BLINK: SketchPreset = {
  id: 'arduino-blink',
  title: '01. Blink (Built-in LED)',
  description: 'Toggles the on-board Pin 13 LED on and off at regular intervals.',
  category: 'basics',
  code: `// RoboForge Arduino Foundations - Lesson 1: Blink
// Turns the on-board LED on for 1 second, then off for 1 second, repeatedly.

const int ledPin = 13; // Built-in LED on Arduino Uno

void setup() {
  // Initialize the digital pin as an output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn the LED on (HIGH voltage level)
  delay(1000);                  // Wait for 1 second
  digitalWrite(ledPin, LOW);    // Turn the LED off (LOW voltage level)
  delay(1000);                  // Wait for 1 second
}`,
  hex: `:10000000259A2D9A84E68150F1F72D9884E6815047
:04001000F1F7F4CF41
:00000001FF`,
};

export const SKETCH_SERIAL: SketchPreset = {
  id: 'arduino-serial',
  title: '02. Serial Monitor Communication',
  description: 'Transmits greeting text over USART at 9600 baud and echoes received characters.',
  category: 'serial',
  code: `// RoboForge Arduino Foundations - Lesson 2: Serial Communication
// Transmits a greeting message to the Serial Monitor at 9600 baud.

void setup() {
  // Initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  Serial.println("RoboForge Uno ready!");
}

void loop() {
  // Read incoming characters from the terminal and echo them back
  if (Serial.available() > 0) {
    char incomingByte = Serial.read();
    Serial.print("Echo: ");
    Serial.println(incomingByte);
  }
}`,
  hex: `:1000000008E00093C10002E50093C6000FE60093EC
:10001000C60002E60093C6000FE60093C60006E4A1
:100020000093C6000FE60093C60002E70093C600E7
:1000300007E60093C60005E60093C60000E20093C1
:10004000C60005E50093C6000EE60093C6000FE665
:100050000093C60000E20093C60002E70093C600CA
:1000600005E60093C60001E60093C60004E600938F
:10007000C60009E70093C60001E20093C6000AE04B
:060080000093C600FFCF53
:00000001FF`,
};

export const SKETCH_BUTTON: SketchPreset = {
  id: 'arduino-button',
  title: '03. Digital Input & Push Button',
  description: 'Reads digital state from a tactile switch on Pin 2 and controls the Pin 13 LED.',
  category: 'digital',
  code: `// RoboForge Arduino Foundations - Lesson 3: Push Button
// Reads a push button connected to Pin 2 with internal pull-up resistor.
// When the button is pressed, Pin 2 connects to ground (LOW), lighting LED 13.

const int buttonPin = 2; // Tactile push button input
const int ledPin = 13;    // On-board LED

void setup() {
  pinMode(ledPin, OUTPUT);
  // INPUT_PULLUP enables the internal 20kΩ pull-up resistor
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // Read the state of the switch into a local variable
  int buttonState = digitalRead(buttonPin);

  // If the button is pressed, state is LOW (active low)
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH); // Turn LED on
  } else {
    digitalWrite(ledPin, LOW);  // Turn LED off
  }
}`,
  hex: `:10000000259A12984A9902C02D9AFACF2D98F7CFC7
:00000001FF`,
};

export const SKETCH_ANALOG_PWM: SketchPreset = {
  id: 'arduino-analog-pwm',
  title: '04. Analog Reading & PWM Dimming',
  description:
    'Reads analog voltage from potentiometer on A0 and controls LED brightness on Pin 9.',
  category: 'analog',
  code: `// RoboForge Arduino Foundations - Lesson 4: Analog Input & PWM
// Reads an analog voltage (0-5V) from potentiometer on A0.
// Scales the 10-bit ADC reading (0-1023) down to 8-bit PWM (0-255).

const int potPin = A0;  // Potentiometer wiper connected to analog pin 0
const int ledPin = 9;   // PWM capable output pin

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(potPin);        // Returns 0 to 1023
  int brightness = map(sensorValue, 0, 1023, 0, 255); // Convert to 0-255
  analogWrite(ledPin, brightness);             // Modulate LED pulse width
  delay(15);                                   // Stabilization delay
}`,
  hex: `:10000000219A07E000937C00009178000093810022
:0800100000938800F8CFB10055
:00000001FF`,
};

export const SKETCH_TRAFFIC_LIGHT: SketchPreset = {
  id: 'arduino-traffic-light',
  title: '05. Traffic Light Controller',
  description:
    'Automates Red (Pin 12), Yellow (Pin 11), and Green (Pin 10) LEDs with pedestrian button.',
  category: 'robotics',
  code: `// RoboForge Robotics Project 2: Traffic Light Controller
// Implements an automated intersection with Red, Yellow, Green signals
// and a pedestrian request button on Pin 2.

const int redPin = 12;
const int yellowPin = 11;
const int greenPin = 10;
const int buttonPin = 2;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // Green signal active
  digitalWrite(greenPin, HIGH);
  digitalWrite(yellowPin, LOW);
  digitalWrite(redPin, LOW);
  delay(3000);

  // Yellow warning signal
  digitalWrite(greenPin, LOW);
  digitalWrite(yellowPin, HIGH);
  delay(1000);

  // Red stop signal
  digitalWrite(yellowPin, LOW);
  digitalWrite(redPin, HIGH);
  delay(3000);
}`,
  hex: `:10000000249A239A229A129A229A2398249884E670
:100010008150F1F72298239A84E68150F1F72398D2
:0A002000249A84E68150F1F7EFCF37
:00000001FF`,
};

export const SAMPLE_SKETCHES: SketchPreset[] = [
  SKETCH_BLINK,
  SKETCH_SERIAL,
  SKETCH_BUTTON,
  SKETCH_ANALOG_PWM,
  SKETCH_TRAFFIC_LIGHT,
];
