import { uuid } from "./util";

export class DialogueButton {
	text: string
}

export class Scene {
	uuid: string
	id: string
	npc_name: string
	text: string
	buttons: DialogueButton[]

	constructor() {
		this.uuid = uuid();
		this.id = 'scene';
		this.npc_name = 'NPC';
		this.text = 'Sample Text';

		this.buttons = [
		];

		Scene.all.push(this);
	}
	remove() {
		let index = Scene.all.indexOf(this);
		if (index != -1) {
			Scene.all.splice(index, 1);
		}
	}
	static all: Scene[] = [];
}