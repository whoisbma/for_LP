import processing.pdf.*; //<>//

//SOUND
import ddf.minim.analysis.*;
import ddf.minim.*;
import ddf.minim.ugens.*;
Minim minim;
AudioInput in; 
FFT fft;
float max[]; 
float maximum;
float frequency;

AudioOutput out;
//-----

int scale = 2000; 
int latTotal = 100; 
int longTotal = 80; 

float[] latLines = new float[latTotal];
float[] longLines = new float[longTotal]; 
PVector[][] verts = new PVector[latTotal][longTotal]; 

PVector tPole1 = new PVector(0, 0, 0); 
PVector tPole2 = new PVector(0, 0, 0); 
PVector[][] tVerts = new PVector[latTotal][longTotal];

float[][] vertMod = new float[latTotal][longTotal]; 
float pole1Mod = 1; 
float pole2Mod = 1; 

PVector pole1 = new PVector(0, 0, scale); 
PVector pole2 = new PVector(0, 0, -scale);

boolean record = false; 

boolean drag = false; 
float dragX = 150;//random(360);
float dragY = 150;//random(360); 

float xMin, xMax, yMin, yMax, zMin, zMax; 

float translateVal; 

float lastFreq = 0; 
int freqNoise = 0; 

int timeGettingVolume = 0; 

boolean rotating = false; 
int rotCount = 0; 

//float surfaceZTotal = -1000; 
//float surfacePointsTotal = 1; 

int[] starX = new int[200];
int[] starY = new int[200]; 
int[] starZ = new int[200]; 


float rotCounterX = 0; 
float rotCounterY = 0; 
float rotCountX = 0; 
float rotCountY = 0; 

final int colorHigh = 200;
final int colorLow = 100; 

void setup() {
  size(1000, 500, P3D); 
  perspective(PI/3.0, (float)width/height, 1, 100000);
  minim = new Minim(this);
  in = minim.getLineIn(Minim.STEREO, 512); 
  out = minim.getLineOut();
  fft = new FFT(in.bufferSize(), in.sampleRate());
  fft.linAverages(63);
  max = new float[(int)in.sampleRate()/2];

  //noCursor(); 
  for (int i = 0; i < latTotal; i++) {
    for (int j = 0; j < longTotal; j++) {
      //initial circle setup
      verts[i][j] = new PVector(
        (sin(PI * i/latLines.length) * cos(TWO_PI * j/longLines.length))*scale, 
        (sin(PI * i/latLines.length) * sin(TWO_PI * j/longLines.length))*scale, 
        (cos(PI * i/latLines.length))*scale);

      //assign translated verts temporary position
      tVerts[i][j] = new PVector(0, 0, 0);

      //assign vert height modifier starting value
      vertMod[i][j] = 0;
    }
  }

  for (int i = 0; i < starX.length; i++) {
    float theta = (random(TWO_PI));
    float phi = (random(TWO_PI)); 
    starX[i] = (int) (cos(theta) * sin(phi) * 8000);//random(-2000, 2000); 
    starY[i] = (int)(sin(theta) * sin(phi) * 8000);//random(-2000, 2000); 
    starZ[i] = (int) (cos(phi) * 8000);//random(-2000, 2000);
  }
} 

void draw() {
  background(10); 

  println("freq: " + getNote()); 
  println("mod size: " + getModSize(getNote())); 
  println("volume: " + volOverThreshold());
  println("freq noise: " + freqNoise); 

  if (record) {
    beginRaw(PDF, frameCount+".pdf");
  }

  //lights(); 

  if (drag) { 
    dragY += mouseY - pmouseY; 
    dragX += mouseX - pmouseX;
  } 

  pushMatrix();

  translateVal = getZTranslate();

  //println(translateVal); 
  translate(width/2, height/2, -translateVal); //-2000); 
  pointLight(110, 150, 255, 4500, height/2, 4000);
  if (!rotating) {
    rotateX(radians(-dragY * 0.1)); 
    rotateY(radians(dragX * 0.1));
    rotCounterX = random(-2, 2);
    rotCounterY = random(-2, 2);
  } else {
    dragX += rotCounterX; 
    dragY += rotCounterY; 
    rotateX(radians(-dragY * 0.1));
    rotateY(radians(dragX * 0.1));
  } 

  ambientLight(50, 20, 10);
  directionalLight(20, 50, 10, 1, 1, -1);
  lightFalloff(1, 0, 0);
  lightSpecular(1, 0, 0);
  
  if (mouseX == pmouseX && mouseY == pmouseY) {
    rotCount++;
  } else {
    rotCount = 0;
  } 

  if (rotCount > 100) {
    rotating = true;
  } else { 
    rotating = false; 
    rotCounterX = 0;
    rotCounterY = 0;
  }

  for (int i = 0; i < starX.length; i++) { 
    stroke(255); 
    strokeWeight(2); 
    point(starX[i], starY[i], starZ[i]);
  } 

  drawSphere(); 
  //oscillate(); 
  centeredOsc();
  deformBasedOnMod(); 
  setTranslatedPos(); 

  if (record) {
    endRaw();
    record = false;
  }
  popMatrix();

  //here we can use the translated verts for general worldspace.
  //linesToVerts();
  transformVertModsAtRadius(translateVal);
  drag = false;
} 

void keyReleased() {
  if (key == 's') {
    saveFrame(frameCount+".png"); 
    record = true;
  }
  //if (key == 'p') {
  //  println(getNoteArrayToPlay(getLatOrLongToPlay())); 
  //  playNoteArray(getNoteArrayToPlay(getLatOrLongToPlay()));
  //}
}

void mouseDragged() {
  drag = true;
} 


//this one for the circle's auto rotation? 
public void transformVertModsAtCenter(float _translateVal) {
} 

public void transformVertModsAtRadius(float _translateVal) {
  float localTranslateVal = _translateVal; 
  int compareOffset = 200+scale; 
  volOverThreshold(); //right now its returning volume but i'm not using it
  float maxDistance = 300+ timeGettingVolume*5;//getModSize(getNote());//500;
  float roughness = getModSize(getNote());//5; //change this for smooth or spiky (1-10?)
  float inflateSpeed = 5;//volOverThreshold();//5; //5 was my default before
  float oscillateMod = 0.3;//map(volOverThreshold(), 0, 5, 0, .5); //0.3;
  float surfaceTranslate = -localTranslateVal+compareOffset;  //original was -500 before basing on camera translate
  float inOrOutMod = getLowOrHigh(getNote()); 
  float vertDist;
  float proxC;
  float mappedTransform; 
  for (int i = 1; i < latLines.length; i++) {
    for (int j = 0; j < longLines.length; j++) {
      pushMatrix(); 
      translate(tVerts[i][j].x, tVerts[i][j].y, tVerts[i][j].z); 
      vertDist = dist(0, 0, 0, -tVerts[i][j].x+width/2, -tVerts[i][j].y+height/2, -tVerts[i][j].z+surfaceTranslate);
      if (vertDist < maxDistance && getVolume() != 0) {
        proxC = map(vertDist, 200, maxDistance, 255, 0); 
        mappedTransform = map(vertDist, 200, maxDistance, inflateSpeed, 0.001); 
        stroke(0, 230, 255, proxC); 
        strokeWeight(1); 
        vertMod[i][j] += (inOrOutMod*mappedTransform) + (sin(frameCount*oscillateMod + mappedTransform)*roughness);
      }
      popMatrix();
    }
  }

  pushMatrix(); 
  translate(tPole1.x, tPole1.y, tPole1.z); 
  vertDist = dist(0, 0, 0, -tPole1.x+width/2, -tPole1.y+height/2, -tPole1.z-localTranslateVal+compareOffset);
  if (vertDist < maxDistance && getVolume() != 0) {
    proxC = map(vertDist, 200, maxDistance, 255, 0); 
    mappedTransform = map(vertDist, 200, maxDistance, inflateSpeed, 0.001); 
    pole1Mod += (inOrOutMod*mappedTransform) + (sin(frameCount*oscillateMod + mappedTransform)*roughness);
  }
  popMatrix(); 

  pushMatrix(); 
  translate(tPole2.x, tPole2.y, tPole2.z); 
  vertDist = dist(0, 0, 0, -tPole2.x+width/2, -tPole2.y+height/2, -tPole2.z-localTranslateVal+compareOffset);
  if (vertDist < maxDistance && getVolume() != 0) {
    proxC = map(vertDist, 200, maxDistance, 255, 0); 
    mappedTransform = map(vertDist, 200, maxDistance, inflateSpeed, 0.001); 
    pole2Mod += (inOrOutMod*mappedTransform) + (sin(frameCount*oscillateMod + mappedTransform)*roughness);
  } 
  popMatrix();
}



public float getZTranslate() {
  float xDiff = xMax-xMin; 
  float yDiff = yMax-yMin; 
  //float zDiff = zMax-zMin; 
  float highest = max(xDiff, yDiff);//, zDiff); 
  //println(highest); 
  xMin = 0; 
  xMax = 0;
  yMin = 0; 
  yMax = 0; 
  zMin = 0; 
  zMax = 0; 

  return highest;
}

//set translated positions
public void setTranslatedPos() {  
  for (int i = 0; i < latLines.length; i++) {
    for (int j = 0; j < longLines.length; j++) {
      tVerts[i][j].x = modelX(verts[i][j].x, verts[i][j].y, verts[i][j].z); 
      tVerts[i][j].y = modelY(verts[i][j].x, verts[i][j].y, verts[i][j].z);
      tVerts[i][j].z = modelZ(verts[i][j].x, verts[i][j].y, verts[i][j].z);

      //set mins and maxes for screen dimensions
      if (tVerts[i][j].x < xMin) {
        xMin = tVerts[i][j].x;
      } 
      if (tVerts[i][j].x > xMax) {
        xMax = tVerts[i][j].x;
      }
      if (tVerts[i][j].y < yMin) {
        yMin = tVerts[i][j].y;
      } 
      if (tVerts[i][j].y > yMax) {
        yMax = tVerts[i][j].y;
      }
      if (tVerts[i][j].z < zMin) {
        zMin = tVerts[i][j].z;
      } 
      if (tVerts[i][j].z > zMax) {
        zMax = tVerts[i][j].z;
      }
    }
  }

  tPole1.x = modelX(pole1.x, pole1.y, pole1.z); 
  tPole1.y = modelY(pole1.x, pole1.y, pole1.z);
  tPole1.z = modelZ(pole1.x, pole1.y, pole1.z);

  if (tPole1.x < xMin) {
    xMin = tPole1.x;
  } 
  if (tPole1.x > xMax) {
    xMax = tPole1.x;
  }
  if (tPole1.y < yMin) {
    yMin = tPole1.y;
  } 
  if (tPole1.y > yMax) {
    yMax = tPole1.y;
  }
  if (tPole1.z < zMin) {
    zMin = tPole1.z;
  } 
  if (tPole1.z > zMax) {
    zMax = tPole1.z;
  }

  tPole2.x = modelX(pole2.x, pole2.y, pole2.z);
  tPole2.y = modelY(pole2.x, pole2.y, pole2.z);
  tPole2.z = modelZ(pole2.x, pole2.y, pole2.z);

  if (tPole2.x < xMin) {
    xMin = tPole2.x;
  } 
  if (tPole2.x > xMax) {
    xMax = tPole2.x;
  }
  if (tPole2.y < yMin) {
    yMin = tPole2.y;
  } 
  if (tPole2.y > yMax) {
    yMax = tPole2.y;
  }
  if (tPole2.z < zMin) {
    zMin = tPole2.z;
  } 
  if (tPole2.z > zMax) {
    zMax = tPole2.z;
  }

  //  println("x min: " + xMin + ", x max: " + xMax);
  //  println("y min: " + yMin + ", y max: " + yMax);
  //  println("z min: " + zMin + ", z max: " + zMax);
} 


public void deformBasedOnMod() {
  for (int i = 0; i < latTotal; i++) {
    for (int j = 0; j < longTotal; j++) {
      verts[i][j].x = (sin(PI * i/latLines.length) * cos(TWO_PI * j/longLines.length))*(scale +vertMod[i][j]);
      verts[i][j].y = (sin(PI * i/latLines.length) * sin(TWO_PI * j/longLines.length))*(scale +vertMod[i][j]);
      verts[i][j].z = (cos(PI * i/latLines.length))*(scale + vertMod[i][j]);
    }
  }
  pole1.z = (scale) + pole1Mod; 
  pole2.z = (-scale) - pole2Mod;
} 