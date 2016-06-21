class SineInstrument implements Instrument
{
  Oscil wave;
  Line  ampEnv;

  SineInstrument( float frequency )
  {
    // make a sine wave oscillator
    // the amplitude is zero because 
    // we are going to patch a Line to it anyway
    wave   = new Oscil( frequency, 0, Waves.SINE );
    ampEnv = new Line();
    ampEnv.patch( wave.amplitude );
  }

  // this is called by the sequencer when this instrument
  // should start making sound. the duration is expressed in seconds.
  void noteOn( float duration )
  {
    // start the amplitude envelope
    ampEnv.activate( duration, 0.5f, 0 );
    // attach the oscil to the output so it makes sound
    wave.patch( out );
  }

  // this is called by the sequencer when the instrument should
  // stop making sound
  void noteOff()
  {
    wave.unpatch( out );
  }
}

private int getLatOrLongToPlay() {
  int rand = (int)random(2);
  return rand;
}

private int[] getNoteArrayToPlay(int latOrLong) {
  if (latOrLong == 0) {
    int randLat = (int)random(latTotal-1);
    int[] noteArray = new int[longTotal];
    for (int i = 0; i < longTotal; i++) {
      noteArray[i] = abs( 10 * (int)vertMod[randLat][i] );
    }
    return noteArray;
  } else {
    int randLong = (int)random(longTotal);
    int[] noteArray = new int[latTotal-1];
    for (int i = 0; i < latTotal-1; i++) {
      noteArray[i] = abs( 10 * (int)vertMod[i][randLong] );
    }
    return noteArray;
  }
}

private void playNoteArray(int[] noteArrayToPlay) {
  out.setTempo( 120 );
  int[] noteArray = noteArrayToPlay;
  for (int i = 0; i < noteArray.length; i++) {
    out.playNote( i, 1, new SineInstrument(noteArray[i])); 
  }
} 