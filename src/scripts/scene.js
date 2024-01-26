import { uuid } from "./util";

export class DialogueButton {

}

export class Scene {
	constructor() {
		this.uuid = uuid();
		this.id = '';
		this.npc_name = '';
		this.text = '';

		this.buttons = [];

		Scene.all.push(this);
	}
	remove() {
		let index = Scene.all.indexOf(this);
		if (index != -1) {
			Scene.all.splice(index, 1);
		}
	}
	static all = [];
}