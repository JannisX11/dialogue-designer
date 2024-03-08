import { compileJSON } from "./util"

type TextComponent = string | {}
type TextFieldMode = 'text' | 'translate' | 'json';

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
	set(data) {
		if (typeof data == 'string') {
			this.mode = 'text';
			this.text = data;

		} else if (typeof data == 'object') {
			this.mode = 'json';
			this.json = compileJSON(data);
		}
	}
	export() {
		if (this.mode == 'text') {
			return this.text;
		} else {
			return JSON.parse(this.json);
		}
	}
	switchMode(mode: TextFieldMode) {
		this.mode = mode;
	}
}