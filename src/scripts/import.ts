import { Project } from "./project";
import { Scene } from "./scene";
import { IO } from "./util";


document.ondragover = function(event) {
	event.preventDefault()
}
document.body.ondrop = function(event) {
	var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
	if (file) {
		if (file.name.endsWith('json')) {
			let reader = new FileReader()
			reader.onloadend = function() {
				if (typeof reader.result == 'string') {
					let json = JSON.parse(reader.result);
					importDialogueFile(json);
				}
			}
			reader.readAsText(file)
			event.preventDefault()
		}
	}
}

export function selectFileToImport(): void {
	console.log('test')
	IO.import({
		extensions: ['json']
	}, (files) => {
		if (files[0]) {
			importDialogueFile(JSON.parse(files[0].content))
		}
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
	Project.prefix = '';
	Scene.all.splice(0);
}


export function importDialogueFile(json: object): void {

	let scenes = json['minecraft:npc_dialogue']?.scenes;
	if (!scenes || !(scenes instanceof Array)) return;

	resetProject();

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
			console.log(largest_common)
		}
		Project.prefix = first_tag.substring(0, largest_common.join('_').length+1);
	}
	console.log(scenes.length, Project.prefix)


	let i = 0;
	for (let scene_json of scenes) {

		let scene = new Scene();
		scene.id = scene_json.scene_tag.replace(Project.prefix, '');
		scene.npc_name = getText(scene_json.npc_name);
		scene.text = getText(scene_json.text);
		if (scene_json.buttons instanceof Array) {
			for (let button_json of scene_json.buttons) {
				let button = scene.addButton();
				button.text = getText(button_json.name);
				if (button_json.commands instanceof Array) {
					button.commands = button_json.commands.join('\n');
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
}
