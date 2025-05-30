# City of Mist for Foundry VTT

**Created By:** Taragnor <br>
**Visual/CSS design by:** LorduFreeman <br>
**Additional Code Contributions by:** Plenett/Galdormin, Ch1sKey <br>
**Localizations:**

-   _German:_ Markus Raab
-   _Polish:_ Red the Neko
-   _Portugese (Brazilian):_ Busca
-   _French:_ Matisse
<hr>
<div>
<img src="https://user-images.githubusercontent.com/31339311/145990040-37c04157-6048-411e-8628-ed62a4d7a082.jpg" height=500px>
</div>

This is the unofficial Foundry System for City of Mist RPG by Son of Oak.

### Features

-   Ability to select tags, statuses and story tags for moves. Will automatically burn crew or extra tags if used.
-   Organizes tags/statuses for crew themes, extra themes, allied Characters and visible Danger tokens on one character sheet making it easy to select the modifiers to your rolls.
-   Allows GM moves to place statuses and create story tags on the dangers that invoke them.
-   Support for grit mode optional rule.
-   Semi-directed character development and creation. No drag-and-drop required, everything is accessible from the main character sheet.

## Usage Instructions

### General

-   You won't need to create any items in Foundry, everything is handled via the actor classes barring specific exceptions (like wanting to create a custom Themebook)

-   There is no drag-and-drop functionality (yet), everything is handled through buttons on the character sheet

## Characters

-   To edit the sheet click the lock icon to unlock it. This will allow adding additional themes. For normal play it should be locked.

### Creation

-   Unlock the character sheet to allow new themes to be added.

-   Add your themes and then add in power tags. The sheet automatically tracks improvements you have, so will limit how many power tags you can add. As your theme gets attention more improvements are added.

-   At 3 crack/fade, a theme will be destroyed and removed, and appropriate build-up points will be added towards a moment of evolution.

-   If you get a power tag from a special source (like an improvement), you can add it as a bonus tag (the star icon).

### Making Moves

-   You can only select tags when your sheet is in locked state.

-   Statuses and Story tags from other tokens on the active scene will be added to your status list to select. In addition Story Tags from any Story tag container will be added onto your story tag list for potential choices to modify moves. This lets you apply enemy or allied statuses to your move rolls when appropriate.

-   Select your tags by clicking on them. Yellow marked things are a bonus, while red is a penalty. You can right-click to get opposite behavior (make a bonus a penalty).

### Improvements

-   Improvements with uses are tracked by the system. To refresh them, use the End of Session move, this will restore flashback and depleted improvements. Note that only improvements that can be used a specific number of times per game session are tracked, per scene usage is left to the MC.

### Advancement

-   Characters have to "level up" their theme before it will allow additional power tags or improvements to be selected.

## Crew Theme

-   otherwise just create a new theme on the crew and it's good to go.

-   Make sure to give your players ownership of the crew theme otherwise it won't appear on their character sheets.

## Extras

\*Like the crew theme the extra theme requires ownership by players to add to their sheet. Players (but not the GM) will see a prompt near the top of the character sheet to switch active extra themes if they have one.

## Dangers

-   GM moves sending to chat has special syntax (listed below) that can be used to automatically create a tag or status for the danger when the move is sent to chat

-   A danger that is a token on the map will reveal its statuses and tags on each players sheet if it is on the Active map.

### Formatting for GM Moves

-   enclosing something in brackets [] will define a new story tag that will be placed on the danger when the move is sent to chat.

-   enclosing something in vertical bars |status | will format the output as a status, but won't add that status anywhere, it will just appear differently colored in chat.

-   enclosing something in double vertical bars ||status|| will add that status to the Danger that uses it. If the danger already has a status of the same name, it will add the two (useful for countdown statuses). make sure your status has a number attached

## Story Tag Container

-   It's advised you only have one story tag container at a time.

-   This is used to store story tags bound to the scene. This will probably be replaced with having the tags in the scene itself at some point, but this is the temporary solution.

-   The narration box can add story tags using the same bracket syntax [tag-name] as for GM moves only the tag is added to the container instead.

-   Story tag container tags are always visible.

## Development

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or higher recommended)
-   [Yarn](https://yarnpkg.com/) package manager
-   [Foundry VTT](https://foundryvtt.com/) installed for testing

### Setup

1. Clone this repository:

    ```bash
    git clone https://github.com/pjgates/city-of-mist-blades.git
    cd city-of-mist-blades
    ```

2. Install dependencies:
    ```bash
    yarn install
    ```

### Building the System

To build the system, run:

```bash
yarn build
```

This will compile TypeScript files and copy all necessary assets to the `dist` directory.

### Development Workflow

#### Testing with Foundry VTT

To test the system with Foundry VTT during development:

1. Create a symlink from your Foundry VTT systems directory to this project's `dist` directory:

    **macOS/Linux:**

    ```bash
    ln -s /path/to/city-of-mist-blades/dist /path/to/foundrydata/Data/systems/city-of-mist
    ```

    **Windows (Command Prompt as Administrator):**

    ```cmd
    mklink /D "C:\path\to\foundrydata\Data\systems\city-of-mist" "C:\path\to\city-of-mist-blades\dist"
    ```

2. Build the project:

    ```bash
    yarn build
    ```

3. Launch Foundry VTT and create a new world using the City of Mist system.

4. After making changes to the code, run `yarn build` again and refresh Foundry VTT to see your changes.

### Code Structure

-   `/src/city-of-mist/` - Main source code for the system
-   `/dist/` - Compiled output (generated by the build process)
-   `/foundrytypes/` - TypeScript type definitions for Foundry VTT

### Contributing

1. Fork the repository on GitHub
2. Create a new branch for your feature or bugfix
3. Make your changes and build to test
4. Submit a Pull Request to the main repository

### Version Management

When updating the system, remember to:

1. Update the version number in `system.json`
2. Update the download URL in `system.json` to point to the new release
3. Tag your release in Git with the same version number
