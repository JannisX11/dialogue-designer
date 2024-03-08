import { Scene } from "./scene";
import { Project } from "./project";
import { IO, compileJSON } from "./util";

function rawText(input: string): any {
	return {
		rawtext: [{text: input}]
	}
}

function processCommands(input: string) {
	let list = input.split(/\r?\n/);
	list = list.filter(line => line.length);
	return list.length ? list : undefined;
}

export function compileDialogueFile(scenes: Scene[] = Scene.all): Object {
	let json_scenes: any[] = [];
	let file = {
		format_version: '1.14.0',
		'minecraft:npc_dialogue': {
			scenes: json_scenes
		}
	};
	for (let scene of scenes) {
		let scene_json: any = {
			scene_tag: Project.prefix + scene.id,
			npc_name: rawText(scene.npc_name),
			text: rawText(scene.text),
		};
		if (scene.buttons.length) {
			scene_json.buttons = scene.buttons.map(button => {
				let commands = button.commands.split(/\r?\n/)
				return {
					name: rawText(button.text),
					commands: processCommands(button.commands),
				}
			});
		}
		if (scene.on_open_commands.length) {
			scene_json.on_open_commands = processCommands(scene.on_open_commands);
		}
		if (scene.on_close_commands.length) {
			scene_json.on_close_commands = processCommands(scene.on_close_commands);
		}
		json_scenes.push(scene_json);
	}
	return file;
}

export function exportDialogueFile(): void {
	let file = compileDialogueFile();
	let content = compileJSON(file);
	IO.export({
		name: (Project.name||'unknown') + '.dialogue.json',
		content,
	})
}
