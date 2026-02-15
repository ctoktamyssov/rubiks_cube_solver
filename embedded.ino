class FaceMotor {
  public:
    int stepPin;
    int dirPin;
    char id;

    FaceMotor(int stepPin, int dirPin, char id) {
      this->stepPin = stepPin;
      this->dirPin = dirPin;
      this->id = id;

      pinMode(stepPin, OUTPUT);
      pinMode(dirPin, OUTPUT);

      digitalWrite(stepPin, LOW);
      digitalWrite(dirPin, LOW);
    }

    void turn90(bool clockwise) {
      digitalWrite(dirPin, clockwise ? HIGH : LOW);
      stepDegrees(90);
    }

    void turn180() {
      stepDegrees(180);
    }

  private:
    const int stepsPerRev = 800;   // 200 * 4 microstep example
    const int stepDelayUs = 400;   // slower = safer

    void stepDegrees(int degrees) {
      int steps = (stepsPerRev * degrees) / 360;

      for (int i = 0; i < steps; i++) {
        digitalWrite(stepPin, HIGH);
        delayMicroseconds(stepDelayUs);
        digitalWrite(stepPin, LOW);
        delayMicroseconds(stepDelayUs);
      }
    }
};

FaceMotor faceF(32, 33, 'F');
FaceMotor faceL(25, 14, 'L');
FaceMotor faceR(12, 13, 'R');
FaceMotor faceB(2, 15, 'B');
FaceMotor faceU(16, 4, 'U');
FaceMotor faceD(5, 17, 'D');

void executeMove(String move) {
  char face = move.charAt(0);

  bool prime = move.indexOf('\'') != -1;
  bool doubleTurn = move.indexOf('2') != -1;

  FaceMotor* motor = nullptr;

  switch (face) {
    case 'F': motor = &faceF; break;
    case 'L': motor = &faceL; break;
    case 'R': motor = &faceR; break;
    case 'B': motor = &faceB; break;
    case 'U': motor = &faceU; break;
    case 'D': motor = &faceD; break;
  }

  if (motor == nullptr) return;

  if (doubleTurn) {
    motor->turn180();
  } else {
    motor->turn90(!prime);  // prime = counterclockwise
  }

  delay(200); // small pause between moves
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Ready");
}

void loop() {
  if (Serial.available()) {
    String solution = Serial.readStringUntil('\n');
    solution.trim();

    Serial.print("Executing: ");
    Serial.println(solution);

    int start = 0;

    while (start < solution.length()) {
      int spaceIndex = solution.indexOf(' ', start);
      if (spaceIndex == -1) spaceIndex = solution.length();

      String move = solution.substring(start, spaceIndex);
      executeMove(move);

      start = spaceIndex + 1;
    }
  }
}
