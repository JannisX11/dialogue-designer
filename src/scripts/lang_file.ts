import { IO, uuid } from "./util";
import {EditorState} from "@codemirror/state"

const lang_names = [
	{key: "en_US", label: 'English (US)'},
	{key: "de_DE", label: 'German'},
	{key: "fr_FR", label: 'French'},
	{key: "it_IT", label: 'Italian'},
	{key: "pt_BR", label: 'Portuguese (Brazil)'},
	{key: "ru_RU", label: 'Russian'},
	{key: "zh_CN", label: 'Chinese'},
	{key: "fr_CA", label: 'French (Canadian)'},
	{key: "zh_TW", label: 'Chinese (Taiwan)'},
	{key: "es_MX", label: 'Spanish (Mexico)'},
	{key: "es_ES", label: 'Spanish (Spain)'},
	{key: "pt_PT", label: 'Portuguese (Portugal)'},
	{key: "en_GB", label: 'English (UK)'},
	{key: "ko_KR", label: 'Korean'},
	{key: "ja_JP", label: 'Japanese'},
	{key: "nl_NL", label: 'Dutch'},
	{key: "bg_BG", label: ''},
	{key: "cs_CZ", label: 'Czech'},
	{key: "da_DK", label: 'Danish'},
	{key: "el_GR", label: 'Greek'},
	{key: "fi_FI", label: 'Finnish'},
	{key: "hu_HU", label: 'Hungaruan'},
	{key: "id_ID", label: 'Indonesian'},
	{key: "nb_NO", label: 'Norwegian'},
	{key: "pl_PL", label: 'Polish'},
	{key: "sk_SK", label: 'Slovak'},
	{key: "sv_SE", label: 'Swedish'},
	{key: "tr_TR", label: 'Turkish'},
	{key: "uk_UA", label: 'Ukrainian'}
];
export {lang_names};

export class LangFile {
	uuid: string
	id: string
	modified: boolean
	content: string
	editor_state?: EditorState
	constructor(id: string, content: string = '') {
		this.id = id;
		this.uuid = uuid();
		this.modified = true;
		this.content = content;

		LangFile.all.push(this);
	}
	getContent(): string {
		return this.editor_state ? this.editor_state.doc.toString() : this.content;
	}
	setUniqueID(): this {
		let needs_changing = !this.id || LangFile.all.find(lang_file => lang_file.id == this.id && lang_file.uuid != this.uuid);
		if (!needs_changing) return this;

		let i = 1;
		let id = lang_names[0]?.key;
		while (LangFile.all.find(lf => lf != this && lf.id == id) && i < 2000) {
			id = lang_names[i]?.key || 'end';
			i++;
		}
		this.id = id;
		return this;
	}
	copy(source: LangFile): this {
		this.id = source.id;
		this.setUniqueID();
		this.modified = true;
		return this;
	}
	getTranslation(input_key: string): string | null {
		let lines = this.content.split(/\n[\s\n]*/);
		for (let line of lines) {
			let eq_index = line.search('=');
			let key = line.substring(0, eq_index);
			if (key == input_key) {
				return line.substring(eq_index+1).replace(/\t*#.*/, '');
			}
		}
		return null;
	}

	static all: LangFile[] = [];
	static selected: LangFile | null;
}

export function loadLangFile(file: {name: string, content: string}): LangFile {
	let lang_file = new LangFile(file.name.split('.')[0], file.content).setUniqueID();
	lang_file.modified = false;
	return lang_file;
}

export async function importLangFile(): Promise<LangFile> {
	return await new Promise((resolve, reject) => {
		IO.import({
			extensions: ['lang']
		}, (files) => {
			if (files[0]) {
				let lang_file = loadLangFile(files[0]);
				resolve(lang_file);
			} else {
				reject(null);
			}
		})
	})
}