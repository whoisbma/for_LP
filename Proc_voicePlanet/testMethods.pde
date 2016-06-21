
public void centeredOsc() {
  for (int i = 0; i < latTotal; i++) {
    for (int j = 0; j < longTotal; j++) {
      verts[i][j].x = (sin(PI * i/latLines.length) * cos(TWO_PI * j/longLines.length))*(scale + sin(i+frameCount * 0.06) *i*10 + sin(j+frameCount * 0.08) *j*10);
      verts[i][j].y = (sin(PI * i/latLines.length) * sin(TWO_PI * j/longLines.length))*(scale + sin(i+frameCount * 0.06) *i*10 + sin(j+frameCount * 0.08) *j*10);
      verts[i][j].z = (cos(PI * i/latLines.length))*(scale + sin(i+frameCount * 0.06) *i*10+ sin(j+frameCount * 0.08) *j*10);
    }
  }
  pole1.z = (scale) + sin(-1+frameCount * 0.05) *50+ sin(0+frameCount * 0.1) *30; 
  pole2.z = (-scale) + sin(latTotal+frameCount * 0.05) *50+ sin(longTotal+frameCount * 0.1) *30;
} 

//fun sphere oscillations, meh
public void oscillate() {
  int count = (int)random(3);
  if (count == 0) {
    pole1.x = (sin((-100)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole1.x;
    pole2.x = (sin((-200)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole2.x;
  } else if (count == 1) {
    pole1.y = (sin((-100)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole1.y;
    pole2.y = (sin((-200)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole2.y;
  } else if (count == 2) {
    pole1.z = (sin((-100)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole1.z;
    pole2.z = (sin((-200)+ frameCount * 0.03) - sin((-1)+ frameCount * 0.03)) + pole2.z;
  } 

  for (int i = 1; i < latLines.length; i++) {
    for (int j = 0; j < longLines.length; j++) {
      strokeWeight(5); 
      stroke(0); 
      count = (int)random(3);
      //point(verts[i][j].x, verts[i][j].y, verts[i][j].z); 
      if (count == 0) {
        verts[i][j].x = (sin((i*30)+ frameCount * 0.03) - sin((j*3)+ frameCount * 0.03)) + verts[i][j].x;
      } else if (count == 1) {
        verts[i][j].y = (sin((i*30)+ frameCount * 0.03) - sin((j*3)+ frameCount * 0.03)) + verts[i][j].y;
      } else if (count == 2) {
        verts[i][j].z = (sin((i*30)+ frameCount * 0.03) - sin((j*3)+ frameCount * 0.03)) + verts[i][j].z;
      }
    }
  }
}

//testing drawing lines from mouse position to closest vertices
public void linesToVerts() {
  fill(0, 0, 0); 
  stroke(255, 0, 0);
  strokeWeight(1);
  pushMatrix(); 
  translate(mouseX, mouseY, 0); 
  //ellipse(0, 0, 10, 10); 
  //sphere(100); 
  popMatrix(); 
  for (int i = 1; i < latLines.length; i++) {
    for (int j = 0; j < longLines.length; j++) {
      pushMatrix(); 
      translate(tVerts[i][j].x, tVerts[i][j].y, tVerts[i][j].z); 
      //ellipse(0, 0, 20, 20);  
      if (dist(0, 0, 0, -tVerts[i][j].x+mouseX, -tVerts[i][j].y+mouseY, -tVerts[i][j].z) < 1200) {
        line( 0, 0, 0, -tVerts[i][j].x+mouseX, -tVerts[i][j].y+mouseY, -tVerts[i][j].z);
      }
      popMatrix();
    }
  }
  pushMatrix(); 
  translate(tPole1.x, tPole1.y, tPole1.z); 
  if (dist(0, 0, 0, -tPole1.x+mouseX, -tPole1.y+mouseY, -tPole1.z) < 1200) {
    line(0, 0, 0, -tPole1.x+mouseX, -tPole1.y+mouseY, -tPole1.z);
  }
  //ellipse(0, 0, 20, 20);  
  popMatrix(); 

  pushMatrix(); 
  translate(tPole2.x, tPole2.y, tPole2.z); 
  //ellipse(0, 0, 20, 20); 
  if (dist(0, 0, 0, -tPole2.x+mouseX, -tPole2.y+mouseY, -tPole2.z) < 1200) {
    line(0, 0, 0, -tPole2.x+mouseX, -tPole2.y+mouseY, -tPole2.z);
  } 
  popMatrix();
} 