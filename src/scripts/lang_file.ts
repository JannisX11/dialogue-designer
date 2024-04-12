import { IO, uuid } from "./util";
import {EditorState} from "@codemirror/state"

let lang_names = [
	"en_US",
	"de_DE",
	"fr_FR",
	"it_IT",
	"pt_BR",
	"ru_RU",
	"zh_CN",
	"fr_CA",
	"zh_TW",
	"es_MX",
	"es_ES",
	"pt_PT",
	"en_GB",
	"ko_KR",
	"ja_JP",
	"nl_NL",
	"bg_BG",
	"cs_CZ",
	"da_DK",
	"el_GR",
	"fi_FI",
	"hu_HU",
	"id_ID",
	"nb_NO",
	"pl_PL",
	"sk_SK",
	"sv_SE",
	"tr_TR",
	"uk_UA"
];

export class LangFile {
	uuid: string
	id: string
	modified: boolean
	content: string
	editor_state?: EditorState
	constructor(id: string, content: string = 'nothing') {
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
		let id = lang_names[0];
		while (LangFile.all.find(lf => lf != this && lf.id == id) && i < 2000) {
			id = lang_names[i] || 'end';
			i++;
			console.log(id)
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