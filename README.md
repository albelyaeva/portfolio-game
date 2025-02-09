# Rocket Rescue

Rocket Rescue is a fast-paced arcade game built with [Phaser](https://phaser.io/). In this game, you pilot a rocket through a dynamic, scrolling space environment. Your mission is to collect stars, rescue cows to regain health, and fend off hostile UFOs. With responsive controls and escalating challenges, every playthrough is a new adventure!

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **Arcade Action:** Experience fast-paced gameplay with a scrolling background and dynamic enemy encounters.
- **Collect & Rescue:** Gather stars to boost your score and rescue cows to regain lost health.
- **Enemy Encounters:** Dodge or destroy UFOs—both chasing and aggressive types—that fire bullets at you.
- **Visual Effects:** Enjoy engaging animations and particle effects that enhance the action.
- **Responsive Controls:** Use keyboard (or gamepad, if extended) controls for a smooth playing experience.
- **Replayability:** With increasing difficulty and varying enemy patterns, every game is unique.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/rocket-rescue.git
   cd rocket-rescue

2. **install Dependencies:**
    
    Using npm: 
 ```bash 
     npm install
   ```
 
Or using yarn:
```bash
    yarn install
 ```
3. **Run the Game:**
   Using npm:
 ```bash 
     npm start
   ```

Or using yarn:
```bash
    yarn start
 ```

## Usage:

<ins>Movement</ins>: Use the arrow keys to move your rocket:

<ins>Left/Right</ins>: Move horizontally.

<ins>Up/Down</ins>: Move vertically (affects camera scroll and background motion).

<ins>Shooting</ins>: Press the Spacebar to fire bullets from your rocket.

<ins>Objective</ins>:
Collect stars to increase your score.
Rescue cows to regain health (capped at a maximum health level).
Avoid or destroy UFOs and their bullets to survive.
When your health reaches zero, the game will display a "GAME OVER" message and automatically restart after a short delay.

## Contributing

Contributions are very welcome! If you have ideas for new features, improvements, or bug fixes, please:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Commit your changes and push your branch.
Open a Pull Request detailing your changes.