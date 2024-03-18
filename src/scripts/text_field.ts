import { LangFile } from "./lang_file";
import { compileJSON } from "./util"

type TextFieldMode = 'text' | 'translate' | 'json';

function translate(key: string): string {
	for (let language of LangFile.all) {
		let result = language.getTranslation(key);
		if (result) return result;
	}
	return key;
}

export class TextField {
	mode: TextFieldMode
	text: string
	translate_key: string
	json: string

	constructor(start_text = '') {
		this.mode = 'text';
		this.text = start_text;
		this.translate_key = '';
		this.json = '';
	}
	set(data): void {
		if (typeof data == 'string') {
			this.mode = 'text';
			this.text = data;

		} else if (typeof data == 'object') {
			this.mode = 'json';
			this.json = compileJSON(data);
		}
	}
	fromJSON(data): void {
		this.mode = 'text';
		this.text = '';
		this.translate_key = '';
		this.json = '';
		if (typeof data == 'string') {
			this.mode = 'text';
			this.text = data;

		} else if (typeof data == 'object') {

			if (data.rawtext instanceof Array && data.rawtext.length == 1 && data.rawtext[0]?.translate && Object.keys(data.rawtext[0].translate).length == 1) {
				this.mode = 'translate';
				this.text = data.rawtext[0].translate;
				
			} else {
				this.mode = 'json';
				this.json = compileJSON(data);
			}
		}
	}
	export(): string | object {
		if (this.mode == 'text') {
			return this.text;
		} else if (this.mode == 'translate') {
			return {
				rawtext: [
					{
						translate: this.text
					}
				]
			};
		} else {
			return JSON.parse(this.json);
		}
	}
	switchMode(mode: TextFieldMode): void {
		if (this.mode == 'translate' && mode == 'json') {
			this.json = compileJSON(this.export() as object);

		} else if (this.mode == 'text' && mode == 'json') {
			this.json = compileJSON({
				rawtext: [
					{
						text: this.text
					}
				]
			});
		}
		this.mode = mode;
	}
	getPreview(): string {
		console.log(this)
		if (this.mode == 'text') {
			return this.text;

		} else if (this.mode == 'translate') {
			let a = translate(this.text);
			console.log(a, LangFile.all);
			return a;

		} else {
			let text: string = '';
			let json: any = {};
			if (!this.json) return text;
			try {
				json = JSON.parse(this.json);
			} catch (err) {
				console.error(err)
				return text;
			}
			if (typeof json != 'object' || !json.rawtext) return text;
			for (let line of json.rawtext) {
				if (line.translate) {
					text += translate(line.translate);
				} else if (line.text) {
					text += line.text;
				}
			}
			return text;
		}
	}
}