import { uuid } from "./util";

export class DialogueButton {
	text: string
	commands: string[]
	constructor() {
		this.text = 'Button';
		this.commands = [];
	}
}

export class Scene {
	uuid: string
	id: string
	npc_name: string
	text: string
	buttons: DialogueButton[]

	on_open_commands: string[]
	on_close_commands: string[]

	constructor() {
		this.uuid = uuid();
		this.id = 'scene';
		this.npc_name = 'NPC';
		this.text = 'Sample Text';

		this.buttons = [
		];
		this.on_open_commands = [];
		this.on_close_commands = [];

		Scene.all.push(this);
	}
	addButton(): DialogueButton {
		let new_button = new DialogueButton();
		this.buttons.push(new_button);
		return new_button;
	}
	remove(): void {
		let index = Scene.all.indexOf(this);
		if (index != -1) {
			Scene.all.splice(index, 1);
		}
	}
	static all: Scene[] = [];
}