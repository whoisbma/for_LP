#pragma once

#include "ofMain.h"
#include "ofxJSON.h"

class ofApp : public ofBaseApp{

    //a quick and dirty sprite implementation
    struct question {
        std::string questionContent;
        std::vector<int> tokenList;
        std::vector<int> yesList;
        std::vector<int> noList;
    };
    
    struct token {
        std::string tokenContent;
        int tokenID;
        int tokenScore;
    };
    
	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y );
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
		
    ofxJSONElement result;
    std::vector<question *> questions;
    std::vector<token *> tokens;
    
    int currentQuestion;
    int testmod;
};
