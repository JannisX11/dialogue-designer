import { LangFile } from "./lang_file";
import { compileJSON } from "./util"

type TextFieldMode = 'text' | 'translate' | 'translate_with_linebreaks' | 'json';

function translate(key: string, injections?: string[]): string {
	let result;
	if (LangFile.selected) {
		result = LangFile.selected.getTranslation(key);
	}
	if (!result) {
		for (let language of LangFile.all) {
			result = language.getTranslation(key);
			if (result) break;
		}
	}
	if (result) {
		if (injections instanceof Array) {
			injections.forEach((injection, i) => {
				let regex = RegExp('%%?'+(i+1), 'g');
				result = result.replace(regex, injection);
			});
		}
		return result;
	} else {
		return key;
	}
}

function displayJSONSample(input: string, limit: number = 100): string {
	try {
		input = JSON.stringify(JSON.parse(input));
	} catch(err) {
		input = input.replace(/[\s\n\r]+/g, '');
	}
	let string = input.length > limit ? input.substring(0, limit) + '...' : input;
	return string;
}

export class TextField {
	mode: TextFieldMode
	text: string
	translate_key: string
	json: string
	is_button: boolean

	constructor(start_text = '', is_button?: boolean) {
		this.mode = 'text';
		this.text = start_text;
		this.translate_key = '';
		this.json = '';
		this.is_button = is_button == true;
	}
	get display_text(): string {
		switch (this.mode) {
			case 'text': return this.text;
			case 'translate': case 'translate_with_linebreaks': return this.translate_key;
			case 'json': return displayJSONSample(this.json, this.is_button ? 16 : 120);
			default: return '[Unknown]'
		}
	}
	set display_text(text) {
		if (this.mode == 'text') {
			this.text = text;
		} else if (this.mode == 'translate' || this.mode == 'translate_with_linebreaks') {
			this.translate_key = text;
		}
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
	copy(text_field: TextField): void {
		this.mode = text_field.mode;
		this.text = text_field.text;
		this.translate_key = text_field.translate_key;
		this.json = text_field.json;
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

			if (data.rawtext instanceof Array && data.rawtext.length == 1 && typeof data.rawtext[0]?.translate == 'string') {
				let with_linebreaks = data.rawtext[0].with instanceof Array && data.rawtext[0].with[0] == '\n';
				this.mode = with_linebreaks ? 'translate_with_linebreaks' : 'translate';
				this.translate_key = data.rawtext[0].translate;

			} else if (data.rawtext instanceof Array && data.rawtext.length == 1 && typeof data.rawtext[0]?.text == 'string' && Object.keys(data.rawtext[0]).length == 1) {
				this.text = data.rawtext[0].text;
				
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
						translate: this.translate_key
					}
				]
			};
		} else if (this.mode == 'translate_with_linebreaks') {
			return {
				rawtext: [
					{
						translate: this.translate_key,
						with: ["\n"]
					}
				]
			};
		} else {
			return JSON.parse(this.json);
		}
	}
	switchMode(mode: TextFieldMode): void {
		if ((this.mode == 'translate' || this.mode == 'translate_with_linebreaks') && mode == 'json') {
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
		if (this.mode == 'text') {
			return this.text;

		} else if (this.mode == 'translate') {
			return translate(this.translate_key);

		} else if (this.mode == 'translate_with_linebreaks') {
			return translate(this.translate_key, ['\n']);

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
			function parseTextObject(input: any): string {
				if (typeof input == 'string') return input;
				if (input.translate) {
					let injections;
					if (input.with instanceof Array) injections = input.with.map(v => parseTextObject(v));
					return translate(input.translate, injections);
				} else if (input.text) {
					return input.text;
				}
				return '';
			}
			for (let line of json.rawtext) {
				text += parseTextObject(line);
			}
			return text;
		}
	}
	hasTranslations(): boolean {
		if (this.mode == 'translate' || this.mode == 'translate_with_linebreaks') {
			return true;
		} else if (this.mode == 'json') {
			let json: any = {};
			try {
				json = JSON.parse(this.json);
			} catch (err) {
				console.error(err)
				return false;
			}
			if (typeof json != 'object' || !json.rawtext) return false;
			for (let line of json.rawtext) {
				if (line.translate) {
					return true;
				}
			}
		}
		return false;
	}
}