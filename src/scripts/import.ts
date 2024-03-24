import { Project } from "./project";
import { DialogueButton, Scene } from "./scene";
import { IO } from "./util";


document.ondragover = function(event) {
	event.preventDefault()
}
document.body.ondrop = function(event) {
	let file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
	if (file) {
		if (file.name.endsWith('json')) {
			let reader = new FileReader()
			reader.onloadend = function() {
				if (typeof reader.result == 'string') {
					let json = JSON.parse(reader.result);
					importDialogueFile(json, file ? file.name : '');
				}
			}
			reader.readAsText(file)
			event.preventDefault()
		}
	}
}

export async function selectFileToImport(): Promise<void> {
	await new Promise((resolve, reject) => {
		IO.import({
			extensions: ['json']
		}, (files) => {
			if (files[0]) {
				importDialogueFile(JSON.parse(files[0].content), files[0].name);
				resolve(files[0]);
			} else {
				reject();
			}
		})
	})
}

function getText(input: any): string {
	if (!input) return '';

	if (typeof input == 'string') {
		return input;
	} else if (input.rawtext instanceof Array) {
		let text = '';
		input.rawtext.forEach(line => {
			if (typeof line == 'string') {
				text += line;
			} else if (line.text) {
				text += line.text;
			} else if (line.translate) {
				text += line.translate;
			}
		});
		return text;
	}
	return '';
}

export function resetProject() {
	Project.name = '';
	Project.prefix = '';
	Project.customized_prefix = false;
	Scene.all.splice(0);
}


export function importDialogueFile(json: object, file_name: string): void {

	resetProject();

	let scenes = json['minecraft:npc_dialogue']?.scenes;
	if (!scenes || !(scenes instanceof Array)) return;

	Project.name = file_name.replace(/(\.dialogue)?\.json$/i, '');
	Project.customized_prefix = true;

	// Find common prefix
	if (scenes.length > 1) {
		let largest_common: string[] = [];
		let first_tag: string = '';
		for (let scene_json of scenes) {
			if (!first_tag) first_tag = scene_json.scene_tag;
			let parts = scene_json.scene_tag.split(/[_.-]/);
			if (largest_common.length == 0) {
				largest_common = parts;
			} else {
				for (let i = 0; i < parts.length; i++) {
					if (parts[i] != largest_common[i]) {
						largest_common.splice(i);
						break;
					}
				}
			}
		}
		Project.prefix = largest_common.length ? first_tag.substring(0, largest_common.join('_').length+1) : '';
	}

	let navigation_list: {button: DialogueButton, commands: string[]}[] = [];
	let resolveNavigation = (button: DialogueButton, commands: string[]) => {
		navigation_list.push({button, commands});
	}

	let i = 0;
	for (let scene_json of scenes) {

		let scene = new Scene();
		scene.id = scene_json.scene_tag.replace(Project.prefix, '');
		scene.npc_name.fromJSON(scene_json.npc_name);
		scene.text.fromJSON(scene_json.text);
		if (scene_json.buttons instanceof Array) {
			for (let button_json of scene_json.buttons) {
				let button = scene.addButton();
				button.text.fromJSON(button_json.name);
				if (button_json.commands instanceof Array) {
					let commands = button_json.commands;
					resolveNavigation(button, commands);
				}
			}
		}
		if (scene_json.on_open_commands instanceof Array) {
			scene.on_open_commands = scene_json.on_open_commands.join('\n');
		}
		if (scene_json.on_close_commands instanceof Array) {
			scene.on_close_commands = scene_json.on_close_commands.join('\n');
		}
		if (i == 0) {
			scene.select();
		}
		i++;
	}
	for (let {button, commands} of navigation_list) {
		console.log(button, commands)
		let nav_command_index = commands.findIndex(command => command.startsWith('/dialogue open @s @initiator '));
		console.log(nav_command_index, commands[nav_command_index])
		if (nav_command_index != -1) {
			let target_scene_id = commands[nav_command_index].replace('/dialogue open @s @initiator ', '');
			let target_scene = Scene.all.find(s => s.getSceneTag() == target_scene_id);
			console.log(target_scene)
			if (target_scene) {
				button.navigate_to = target_scene.uuid;
				commands.splice(nav_command_index, 1);
			}
		}
		button.commands = commands.join('\n');
	}
}
