float getNote() {
  fft.forward(in.mix); 
  for (int i = 0; i < in.sampleRate()/2; i++) {
    max[i] = fft.getFreq((float)i);
  } 
  maximum = max(max); 
  
  for (int i = 0; i < max.length; i++) {
    if ( max[i] == maximum ) {
      frequency = i; 
    }
  } 
  if (lastFreq != frequency) { 
    freqNoise++; 
  } else {
    freqNoise = 0; 
  } 
  lastFreq = frequency; 
  return frequency; 
} 

float getModSize(float freq) {
  //float modSize = map(freq, 0, 2000, 1000, 200);  //for range
  if (freq > 1000) {
    freq = 1000;
  } 
  float modSize = map(freq, 0, 1000, 0, 10);  //for spikiness
  if (modSize > 0 && modSize < 1000) {
    return modSize; 
  }
  return 0; 
} 

int getLowOrHigh(float freq) {
  //float modSize = map(freq, 0, 2000, 1000, 200);  //for range
  if (freq > 1000) {
    return -1; 
  } else {
    return 1;
  } 
} 

float getVolume() {
  float combinedVals = 0;
  for (int i = 0; i < fft.avgSize(); i++) {
    combinedVals += fft.getAvg(i); 
  }
  float volume = combinedVals / fft.avgSize();
  if (volume > 0.05) {
    return volume;
  }
  return 0; 
} 

float volOverThreshold() { 
  if (getVolume() > 0.05 && getVolume() < 5) {
    if (timeGettingVolume < 300) {
      timeGettingVolume++; 
      println("time Getting Volume ++ :" + timeGettingVolume);
    } else {
      timeGettingVolume = 300; 
    } 
    return getVolume();
  }
  if (getVolume() > 5) { 
    return -getVolume();
  }
  timeGettingVolume = 0; 
  return 0; 
} 