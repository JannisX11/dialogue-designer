import { TextField } from "./text_field";
import { uuid } from "./util";

export class DialogueButton {
	text: TextField
	commands: string
	constructor() {
		this.text = new TextField('Button');
		this.commands = '';
	}
}

export class Scene {
	uuid: string
	id: string
	npc_name: TextField
	text: TextField
	buttons: DialogueButton[]

	on_open_commands: string
	on_close_commands: string

	constructor() {
		this.uuid = uuid();
		this.id = 'scene';
		this.npc_name = new TextField('NPC');
		this.text = new TextField('Sample Text');

		this.buttons = [
		];
		this.on_open_commands = '';
		this.on_close_commands = '';

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
	select(): void {}
	static all: Scene[] = [];
}
window.Scene = Scene