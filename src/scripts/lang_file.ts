import { IO, uuid } from "./util";

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
	content: string
	modified: boolean
	constructor(id: string) {
		this.id = id;
		this.uuid = uuid();
		this.content = '';
		this.modified = true;

		LangFile.all.push(this);
	}
	setUniqueID(): this {
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
		this.content = source.content;
		this.modified = true;
		return this;
	}
	getTranslation(input_key: string): string | null {
		let lines = this.content.split(/\n[\s\n]*/);
		for (let line of lines) {
			let eq_index = line.search('=');
			let key = line.substring(0, eq_index);
			if (key == input_key) {
				return line.substring(eq_index+1);
			}
		}
		return null;
	}

	static all: LangFile[] = [];
}

export async function importLangFile(): Promise<LangFile> {
	return await new Promise((resolve, reject) => {
		IO.import({
			extensions: ['lang']
		}, (files) => {
			if (files[0]) {
				let lang_file = new LangFile(files[0].name.split('.')[0]).setUniqueID();
				lang_file.content = files[0].content;
				lang_file.modified = false;
				resolve(lang_file);
			} else {
				reject(null);
			}
		})
	})
}