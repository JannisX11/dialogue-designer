import { Project } from "./project";
import { TextField } from "./text_field";
import { uuid } from "./util";

export class DialogueButton {
	text: TextField
	commands: string
	navigate_to: string
	uuid: string
	constructor() {
		this.uuid = uuid();
		this.text = new TextField('Button', true);
		this.commands = '';
		this.navigate_to = '';
	}
	copy(button: DialogueButton): void {
		this.text.copy(button.text);
		this.commands = button.commands;
		this.navigate_to = button.navigate_to;
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

		let i = 2;
		while (Scene.all.find(s => s.id == this.id) && i < 200) {
			this.id = 'scene_'+i;
			i++;
		}

		Scene.all.push(this);
	}
	addButton(): DialogueButton {
		let new_button = new DialogueButton();
		this.buttons.push(new_button);
		return new_button;
	}
	removeButton(button: DialogueButton): void {
		let index = this.buttons.indexOf(button);
		if (index >= 0) this.buttons.splice(index, 1);
	}
	remove(): void {
		let index = Scene.all.indexOf(this);
		if (index != -1) {
			Scene.all.splice(index, 1);
		}
	}
	select(): void {}
	copy(scene: Scene): this {
		this.id = scene.id;
		this.makeNameUnique();
		this.on_open_commands = scene.on_open_commands;
		this.on_close_commands = scene.on_close_commands;
		this.text.copy(scene.text);
		this.npc_name.copy(scene.npc_name);
		this.buttons.splice(0);
		for (let button of scene.buttons) {
			let new_button = this.addButton();
			new_button.copy(button);
		}

		return this;
	}
	makeNameUnique(): void {
		let un_numbered_id = this.id.replace(/_\d+$/, '');
		let i = 2;
		while (Scene.all.find(s => (s.id == this.id && s.uuid != this.uuid)) && i < 200) {
			this.id = un_numbered_id + '_' + i;
			i++;
		}
	}
	getSceneTag(): string {
		return Project.prefix + this.id;
	}
	hasTranslations(): boolean {
		if (this.npc_name.hasTranslations()) return true;
		if (this.text.hasTranslations()) return true;
		if (this.buttons.find(b => b.text.hasTranslations())) return true;
		return false;
	}
	static all: Scene[] = [];
}
// @ts-ignore
window.Scene = Scene