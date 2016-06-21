public void drawSphere() {
  fill(200); 
  noStroke(); 
  float c; 
  //stroke(255,50); 
  //strokeWeight(1); 
  //pole1
  for (int j = 0; j < longLines.length-1; j++) {
    //fill(10, j*10, j*5); 
    beginShape();
    c = map(pole1Mod, -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(pole1.x, pole1.y, pole1.z); 
    c = map(vertMod[1][j+1], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[1][j+1].x, verts[1][j+1].y, verts[1][j+1].z); 
    c = map(vertMod[1][j], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[1][j].x, verts[1][j].y, verts[1][j].z); 
    
    endShape(CLOSE);
  } 
  beginShape();
  c = map(pole1Mod, -500, 1000, colorLow, colorHigh); 
  fill(c); 
  vertex(pole1.x, pole1.y, pole1.z); 
  c = map(vertMod[1][0], -500, 1000, colorLow, colorHigh); 
  fill(c); 
  vertex(verts[1][0].x, verts[1][0].y, verts[1][0].z); 
  c = map(vertMod[1][longLines.length-1], -500, 1000, colorLow, colorHigh); 
  fill(c); 
  vertex(verts[1][longLines.length-1].x, verts[1][longLines.length-1].y, verts[1][longLines.length-1].z); 
  endShape(CLOSE); 

  //pole2
  for (int j = 0; j < longLines.length-1; j++) {
    //fill((latLines.length-1) * 10, j*10, j*5); 
    beginShape();    
    c = map(pole2Mod, -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(pole2.x, pole2.y, pole2.z); 
    c = map(vertMod[latLines.length-1][j], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[latLines.length-1][j].x, verts[latLines.length-1][j].y, verts[latLines.length-1][j].z); 
    c = map(vertMod[latLines.length-1][j+1], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[latLines.length-1][j+1].x, verts[latLines.length-1][j+1].y, verts[latLines.length-1][j+1].z); 
    endShape(CLOSE);
  } 
  //fill((latLines.length-1), 200, 200); 

  beginShape();
  c = map(pole2Mod, -500, 1000, colorLow, colorHigh); 
  fill(c);
  vertex(pole2.x, pole2.y, pole2.z); 
  c = map(vertMod[latLines.length-1][longLines.length-1], -500, 1000, colorLow, colorHigh); 
  fill(c);
  vertex(verts[latLines.length-1][longLines.length-1].x, verts[latLines.length-1][longLines.length-1].y, verts[latLines.length-1][longLines.length-1].z); 
  c = map(vertMod[latLines.length-1][0], -500, 1000, colorLow, colorHigh); 
  fill(c);
  vertex(verts[latLines.length-1][0].x, verts[latLines.length-1][0].y, verts[latLines.length-1][0].z); 
  endShape(CLOSE); 

  //connect beginning and end
  for (int i = 1; i < latLines.length-1; i++) {
    beginShape(); 
    c = map(vertMod[i][0], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i][0].x, verts[i][0].y, verts[i][0].z);
    c = map(vertMod[i+1][longLines.length-1], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i+1][longLines.length-1].x, verts[i+1][longLines.length-1].y, verts[i+1][longLines.length-1].z);
    c = map(vertMod[i][longLines.length-1], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i][longLines.length-1].x, verts[i][longLines.length-1].y, verts[i][longLines.length-1].z);
    endShape(CLOSE);

    beginShape();
    c = map(vertMod[i][0], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i][0].x, verts[i][0].y, verts[i][0].z);
    c = map(vertMod[i+1][0], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i+1][0].x, verts[i+1][0].y, verts[i+1][0].z);
    c = map(vertMod[i+1][longLines.length-1], -500, 1000, colorLow, colorHigh); 
    fill(c);
    vertex(verts[i+1][longLines.length-1].x, verts[i+1][longLines.length-1].y, verts[i+1][longLines.length-1].z);
    endShape(CLOSE);
  }

  for (int i = 1; i < latLines.length-1; i++) {
    for (int j = 0; j < longLines.length-1; j++) {
      // fill(i*5, j*2, j*3); 
      beginShape();  
      c = map(vertMod[i][j], -500, 1000, colorLow, colorHigh); 
      fill(c); 
      vertex(verts[i][j].x, verts[i][j].y, verts[i][j].z);
      c = map(vertMod[i][j+1], -500, 1000, colorLow, colorHigh); 
      fill(c); 
      vertex(verts[i][j+1].x, verts[i][j+1].y, verts[i][j+1].z);
      c = map(vertMod[i+1][j], -500, 1000, colorLow, colorHigh); 
      fill(c); 
      vertex(verts[i+1][j].x, verts[i+1][j].y, verts[i+1][j].z);
      endShape(CLOSE);

      beginShape(); 
      c = map(vertMod[i+1][j], -500, 1000, colorLow, colorHigh); 
      fill(c); 
      vertex(verts[i+1][j].x, verts[i+1][j].y, verts[i+1][j].z);
      c = map(vertMod[i][j+1], -500, 1000, colorLow, colorHigh); 
      fill(c); 
      vertex(verts[i][j+1].x, verts[i][j+1].y, verts[i][j+1].z);   
      c = map(vertMod[i+1][j+1], -500, 1000, colorLow, colorHigh); 
      fill(c);   
      vertex(verts[i+1][j+1].x, verts[i+1][j+1].y, verts[i+1][j+1].z);
      endShape(CLOSE);
    }
  }
} 