import { Scene } from "./scene";

function rawText(input: string): any {
	return {
		rawtext: [{text: input}]
	}
}

export function exportDialogueFile(scenes: Scene[]): Object {
	let json_scenes: any[] = [];
	let file = {
		format_version: '1.14.0',
		'minecraft:npc_dialogue': {
			scenes: json_scenes
		}
	};
	for (let scene of scenes) {
		let scene_json = {
			scene_tag: scene.id,
			npc_name: rawText(scene.npc_name),
			text: rawText(scene.text),
		};
		json_scenes.push(scene_json);
	}
	return file;
}
