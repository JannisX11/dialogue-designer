# Create an NPC Dialogue

This tutorial shows how to create NPC entities with dialogue windows, using the DialogueDesigner tool.
NPC dialogues are a great way to add stories to your custom map, they can be used for anything - from a simple text to provide information to the player - to complex multi page conversations with different reply options to choose from.


### Requirements

Before learning how to create NPC dialogues, it is recommended that you understand the basics of creating resource and behavior packs, as well as the basics of creating custom entities.
The [Minecraft Entity Wizard](https://learn.microsoft.com/en-us/minecraft/creator/documents/minecraftentitywizard) can be used to make this easier.

- [Introduction to Behavior Packs](BehaviorPack.md)
- [Introduction to Resource Packs](ResourcePack.md)
- [Creating New Entity Types](https://learn.microsoft.com/en-us/minecraft/creator/documents/introductiontoaddentity?view=minecraft-bedrock-stable)


## Set-up

Before getting started with the dialogue, we should create our NPC entity.
If you are using the Entity Wizard, proceed by creating an entity with the "NPC" behavior preset.
If you are creating the NPC from scratch, make sure to include the `"minecraft:npc"` component.

You can also use the NPC entity that is included with Minecraft and comes with a list of preset skins. You can use it by searching for the "NPC Spawn Egg" in the creative inventory, and using that spawn egg.


## Creating a dialogue

Open the DialogueDesigner web app in your web browser by navigating to [jannisx11.github.io/dialogue-designer](https://jannisx11.github.io/dialogue-designer/).
On the start screen, press **New Dialogue** to create a new project. This will bring you into the workspace.

On the left side of the screen, you can see the sidebar. This is where you can manage your project and your different scenes.

In the sidebar, under File Name, enter the name of your dialogue file. You should use snake case here (each letter is lower-case, instead of spaces between words we use underscore characters). Let's call it `castle_guard`.

Right below, we can enter the common prefix of all scenes in the project. This is usually the project name, plus an additional underscore at the end: `castle_guard_`.


### Scenes

Each dialogue file can contain any number of scenes. Scenes are individual dialogue pages in a conversation.
You can create individual scenes, or create more complex conversations by linking different scenes together via buttons that the player can press.

Let's add our first scene by pressing the plus button in the sidebar under **Scenes**. This will create a scene.
You can rename scene by double-clicking its name in the sidebar. We'll call it `entry` because it will be the entry point to our conversation.

The main workspace of the screen will now be split into two sections.
At the top, you can see a preview of the dialogue pop-up in-game.
At the bottom, you can configure custom commands that run when the dialogue is opened, closed, or later on when a button is pressed.

To edit the dialogue, we'll start by switching to Edit mode. You can do this by clicking the buttons below the dialogue preview.

The dialogue onw displays three separate sections that you can edit: The title, the body, and the button row.

Let's enter our text into the title and body text field.

We'll also press the plus sign in the button row two times to create buttons

![entry.png]

Let's also create a second page, named `directions`, that looks like this:

![directions.png]

### Linking scenes

We can now go back to the entry scene, select the Directions button, and change the navigation option to `directions`.
This will tell the button to open the directions scene when clicked.

Use the mode selector and switch back to Preview mode to test this. Clicking the button should now navigate to the Directions scene.
Clicking the "Goodbye!" button will close the dialog. That is the default behavior for buttons.


### Commands





## Export


## Advanced features
