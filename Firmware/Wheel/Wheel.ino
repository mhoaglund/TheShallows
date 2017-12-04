#include <Mouse.h>

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
const int LEDs = 8;
int prev_pos = 0;

#define BRIGHTNESS  64
#define LED_TYPE    WS2811
#define COLOR_ORDER RGB
CRGB leds[LEDs];
#define UPDATES_PER_SECOND 100

Encoder wheel(11,12);
void setup() {
  //Serial.begin(9600);
  // put your setup code here, to run once:

}

void loop() {
  // put your main code here, to run repeatedly:
  int pos = wheel.read();
  if(pos != prev_pos){
    double delta = (prev_pos - pos);
    if(delta < 0) delta = -0.5;
    else delta = 0.5;
    Mouse.scroll(delta);
    prev_pos = pos;
  }

  //Serial.println(pos, DEC);
}
