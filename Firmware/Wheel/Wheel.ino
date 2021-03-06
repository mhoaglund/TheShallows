#include <Adafruit_GFX.h>
#include <gfxfont.h>
#include <SPI.h>
#include <Wire.h>

#include <Adafruit_SSD1306.h>

#include <Mouse.h>
#include <Bounce.h>

#include <bitswap.h>
#include <chipsets.h>
#include <color.h>
#include <colorpalettes.h>
#include <colorutils.h>
#include <controller.h>
#include <cpp_compat.h>
#include <dmx.h>
#include <FastLED.h>
#include <fastled_config.h>
#include <fastled_delay.h>
#include <fastled_progmem.h>
#include <fastpin.h>
#include <fastspi.h>
#include <fastspi_bitbang.h>
#include <fastspi_dma.h>
#include <fastspi_nop.h>
#include <fastspi_ref.h>
#include <fastspi_types.h>
#include <hsv2rgb.h>
#include <led_sysdefs.h>
#include <lib8tion.h>
#include <noise.h>
#include <pixelset.h>
#include <pixeltypes.h>
#include <platforms.h>
#include <power_mgt.h>
#include <Encoder.h>

#define PIN 17
#define HOTKEYPIN 16
const int LEDs = 8;
int prev_pos = 0;
bool reducer = true;

#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);
Bounce topbutton = Bounce(PIN, 50);  
Bounce hotkeybutton = Bounce(HOTKEYPIN, 50);

Encoder wheel(12,11);
void setup() {
  Serial.begin(9600);
  pinMode(PIN, INPUT_PULLUP);
  pinMode(HOTKEYPIN, INPUT_PULLUP);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  defaultText();
}

void loop() {
  int pos = wheel.read();
  if(pos != prev_pos){
    //Ignore every other event
    if(reducer){
      reducer = false;
      return;     
    } else{
      reducer = true;
    }
    double delta = (prev_pos - pos);
    if(delta < 0) delta = -1.0;
    else delta = 1.0;
    Mouse.scroll(delta);
    prev_pos = pos;
    updateScreenVis(1);
    Serial.println("Scrolled");
  }
  if (topbutton.update()) {
   if (topbutton.fallingEdge()) {
    Keyboard.set_key1(KEY_F5);
    Keyboard.send_now();
    Keyboard.set_key1(0);
    Keyboard.send_now();
    refreshText();
    delay(1500);
    defaultText();
   }
  }
  if (hotkeybutton.update()) {
   if (hotkeybutton.fallingEdge()) {
     //Alt-Shift-A: Hotkey setup
     Keyboard.set_modifier(MODIFIERKEY_CTRL | MODIFIERKEY_SHIFT);
     Keyboard.send_now();
     Keyboard.set_key1(KEY_A);
     Keyboard.send_now();
     Keyboard.set_modifier(0);
     Keyboard.set_key1(0);
     Keyboard.send_now();
   }
  }
  Serial.println(pos, DEC);
}

void updateScreenVis(int dir){
  //
}

void testdrawline() {  
  for (int16_t i=0; i<display.width(); i+=4) {
    display.drawLine(0, 0, i, display.height()-1, WHITE);
    display.display();
  }
  for (int16_t i=0; i<display.height(); i+=4) {
    display.drawLine(0, 0, display.width()-1, i, WHITE);
    display.display();
  }
  delay(250);
}

void refreshText(){
    display.clearDisplay();
    display.setTextSize(3);
    display.setTextColor(WHITE);
    display.setCursor(0,12);
    display.println("REFRESH");
    display.display();  
}

void defaultText(){
    display.clearDisplay();
    display.setTextSize(3);
    display.setTextColor(WHITE);
    display.setCursor(18,12);
    display.println("INTRO");
    display.display();
}
