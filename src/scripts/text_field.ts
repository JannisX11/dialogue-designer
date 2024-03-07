
type TextComponent = string | {}

class TextField {
	mode: 'text' | 'translate' | 'raw'
	text: string
	translate_key: string
	data: TextComponent

	constructor() {
		this.mode = 'text';
		this.text = '';
		this.translate_key = '';
	}
	set(data) {
		if (typeof data == 'string') {
			this.mode = 'text';
			this.text = data;

		} else if (typeof data == 'object') {
			this.mode = 'raw';
			this.data = data;
		}
	}
	export() {
		if (this.mode == 'text') {
			return this.text;
		} else {
			return this.data;
		}
	}
}