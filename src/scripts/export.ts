import { Scene } from "./scene";
import { Project } from "./project";
import { IO, compileJSON } from "./util";
import { TextField } from "./text_field";
import { LangFile } from "./lang_file";


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
			npc_name: scene.npc_name.export(),
			text: scene.text.export(),
		};
		if (scene.buttons.length) {
			scene_json.buttons = scene.buttons.map(button => {
				let commands = processCommands(button.commands);
				if (button.navigate_to) {
					let target_scene = Scene.all.find(scene2 => scene2.uuid == button.navigate_to);
					if (target_scene) {
						let navigate_command = `/dialogue open @s @initiator ${Project.prefix + target_scene.id}`;
						if (commands) {
							commands.splice(0, 0, navigate_command);
						} else {
							commands = [navigate_command];
						}
					}
				}
				return {
					name: button.text.export(),
					commands
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
export function exportLangFile(lang_id: string): void {
	let language = LangFile.all.find(l => l.id == lang_id);
	if (!language) return;
	IO.export({
		name: (Project.name||'unknown') + '.dialogue.json',
		content: language.content,
	})
}
