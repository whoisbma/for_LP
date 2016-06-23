#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
    currentQuestion = 0;
    
    bool questionParsingSuccessful = result.open("http://rpg-server-lp.herokuapp.com/data/questions");
    
    if (questionParsingSuccessful) {
        ofLogNotice("ofApp::setup") << result.getRawString();
        
        // now write pretty print
        if (!result.save("example_output_pretty.json", true)) {
            ofLogNotice("ofApp::setup") << "example_output_pretty.json written unsuccessfully.";
        }
        
        std::size_t numQuestions = result.size();
        
        //create structs for each object in the array, give each their values
        for (Json::ArrayIndex i = 0; i < numQuestions; i++) {
            
            //create struct from question json
            std::string questionString = result[i]["contents"].asString();
            question * q = new question();
            
            //write question content to struct
            q->questionContent = questionString;
            std::cout << q->questionContent << std::endl;
            
            //add to TOKEN list
            std::string tokenList = result[i]["tokens"].asString();
            std::stringstream ss(tokenList);
            int tl;
            while (ss >> tl) {
                q->tokenList.push_back(tl);
                if (ss.peek() == ',') {
                    ss.ignore();
                }
            }
            std::cout << "token list: " << std::endl;
            for (int i = 0; i < q->tokenList.size(); i++) {
                std::cout << q->tokenList.at(i) << std::endl;
            }
            
            //add to YES list
            std::string yesList = result[i]["yes"].asString();
            std::stringstream ss1(yesList);
            int yl;
            while (ss1 >> yl) {
                q->yesList.push_back(yl);
                if (ss1.peek() == ',') {
                    ss1.ignore();
                }
            }
            std::cout << "yes list: " << std::endl;
            for (int i = 0; i < q->yesList.size(); i++) {
                std::cout << q->yesList.at(i) << std::endl;
            }
            
            //add to NO list
            std::string noList = result[i]["no"].asString();
            std::stringstream ss2(noList);
            int nl;
            while (ss2 >> nl) {
                q->noList.push_back(nl);
                if (ss2.peek() == ',') {
                    ss2.ignore();
                }
            }
            std::cout << "no list: " << std::endl;
            for (int i = 0; i < q->noList.size(); i++) {
                std::cout << q->noList.at(i) << std::endl;
            }
            
            questions.push_back(q);
        }
        
        for (int i = 0; i < questions.size(); i++) {
            std::cout << questions[i]->questionContent << ", " << std::endl;
        }
        
    } else {
        ofLogError("ofApp::setup")  << "Failed to parse JSON" << endl;
    }
    
    bool tokenParsingSuccessful = result.open("http://rpg-server-lp.herokuapp.com/data/tokens");
    
    if (tokenParsingSuccessful) {
        ofLogNotice("ofApp::setup") << result.getRawString();
        
        if (!result.save("example_output_pretty.json", true)) {
            ofLogNotice("ofApp::setup") << "example_output_pretty.json written unsuccessfully.";
        }
        
        std::size_t numTokens = result.size();
        
        for (Json::ArrayIndex i = 0; i < numTokens; i++) {
            std::string tokenString = result[i]["contents"].asString();
            
            token * t = new token();
            
            //write token content to struct
            t->tokenContent = tokenString;
            t->tokenID = i;
            t->tokenScore = 0;
            
            tokens.push_back(t);
        }
        
        for (int i = 0; i < numTokens; i++) {
            std::cout << i << " - " << tokens[i] << std::endl;
        }
    } else {
        ofLogError("ofApp::setup")  << "Failed to parse JSON" << endl;
    }
}

//--------------------------------------------------------------
void ofApp::update(){

}

//--------------------------------------------------------------
void ofApp::draw(){
    ofBackground(ofColor::white);
    
    ofDrawBitmapStringHighlight("Enter number for each question: 1 (yes), 2 (NO)", ofPoint(30, 30));
    ofDrawBitmapStringHighlight(questions[currentQuestion]->questionContent, ofPoint(30, ofGetWindowHeight()-100));

    ofSetColor(ofColor::black);
    ofFill();
    for (int i = 0; i < tokens.size(); i++) {
        ofDrawEllipse(ofGetWindowWidth()*0.5 + tokens[i]->tokenScore, 100 + i * 50, 50, 50);
        ofDrawBitmapStringHighlight(tokens[i]->tokenContent,ofGetWindowWidth()*0.5, 100 + i * 50);
    }
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    
    for (int i = 0; i < tokens.size(); i++) {
        for (int j = 0; j < questions[currentQuestion]->tokenList.size(); j++) {
            if (tokens[i]->tokenID == questions[currentQuestion]->tokenList[j]) {
                if (key == 49){ //1 - yes
                    tokens[i]->tokenScore += questions[currentQuestion]->yesList[j];
                } else if (key == 50){ //2
                    tokens[i]->tokenScore += questions[currentQuestion]->noList[j];
                }
            }
        }
    }
    
    if (key == 49 || key == 50) {
        currentQuestion = (currentQuestion + 1) % questions.size();
    }
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
