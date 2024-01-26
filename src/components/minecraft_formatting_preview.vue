<script>

function isAllASCII(string) {
	for (let i = 0; i < string.length; i++) {
		if (string.charCodeAt(i) > 255) return false;
	}
	return true;
}

import {h} from 'vue'

export default {
	name: 'minecraft-formatting-preview',
	props: {
		text: String
	},
	data() {return {
	}},
	render() {
		let list = [];

		let is_bold = false;
		let is_italic = false;
		let is_underlined = false;
		let is_strikethrough = false;
		let color = '';
		let is_ascii = isAllASCII(this.text);

		this.text.replace(/\t#$/, '').split(/\r?\n|%1/).forEach((line, line_i) => {
			if (line_i) {
				let br = h('br');
				list.push(br);
			}
			line.split('§').forEach((slice, i) => {
				let format = i ? slice[0] : '';
				let content = i ? slice.substring(1) : slice;

				switch (format) {
					case 'r': is_bold = is_italic = is_underlined = is_strikethrough = false; color = ''; break;
					case 'l': is_bold = true; break;
					case 'm': is_strikethrough = true; break;
					case 'n': is_underlined = true; break;
					case 'o': is_italic = true; break;

					case '0': case '1': case '2': case '3': case '4': case '5':
					case '6': case '7': case '8': case '9': case 'a': case 'b':
					case 'c': case 'd': case 'e': case 'f': case 'g':
						color = format; break;
				}
				
				if (!content) return;

				let classes = [];
				if (is_bold) classes.push('tl_bold');
				if (is_italic) classes.push('tl_italic');
				if (is_underlined) classes.push('tl_underline');
				if (is_strikethrough) classes.push('tl_strikethrough');

				switch (color) {
					case '0': classes.push('tl_col_black'); break;
					case '1': classes.push('tl_col_dark_blue'); break;
					case '2': classes.push('tl_col_dark_green'); break;
					case '3': classes.push('tl_col_dark_aqua'); break;
					case '4': classes.push('tl_col_dark_red'); break;
					case '5': classes.push('tl_col_dark_purple'); break;
					case '6': classes.push('tl_col_gold'); break;
					case '7': classes.push('tl_col_gray'); break;
					case '8': classes.push('tl_col_dark_gray'); break;
					case '9': classes.push('tl_col_blue'); break;
					case 'a': classes.push('tl_col_green'); break;
					case 'b': classes.push('tl_col_aqua'); break;
					case 'c': classes.push('tl_col_red'); break;
					case 'd': classes.push('tl_col_light_purple'); break;
					case 'e': classes.push('tl_col_yellow'); break;
					case 'f': classes.push('tl_col_white'); break;
					case 'g': classes.push('tl_col_minecoin'); break;
				}

				let span = h('span', {class: classes.join(' ')}, content);
				list.push(span);
			});
		});

		return h('div', {class: `minecraft_formatting_preview${is_ascii ? '' : ' unicode_charset'}`}, list);
	}
}
</script>

<style scoped>
	.minecraft_formatting_preview {
		--color-text: black;
		--color-shadow: black;
		display: block;
		font-family: minecraft8;
		font-size: var(--mcui-text-size);
		font-weight: 400;
		text-indent: 0.3px;
		/*text-shadow: 2px 2px var(--color-shadow);*/
		user-select: text;
	}
	.minecraft_formatting_preview.unicode_charset {
		font-family: "segoe ui", sans-serif;
	}

	.minecraft_formatting_preview span.tl_bold {
		font-weight: 700;
	}
	.minecraft_formatting_preview span.tl_italic {
		font-style: italic;
	}
	.minecraft_formatting_preview span.tl_underline {
		text-decoration: underline;
	}
	.minecraft_formatting_preview span.tl_strikethrough {
		text-decoration: line-through;
	}
	.minecraft_formatting_preview span.tl_col_black {
		color: #000000;
	}
	.minecraft_formatting_preview span.tl_col_dark_blue {
		color: #0000AA;
	}
	.minecraft_formatting_preview span.tl_col_dark_green {
		color: #00AA00;
	}
	.minecraft_formatting_preview span.tl_col_dark_aqua {
		color: #00AAAA;
	}
	.minecraft_formatting_preview span.tl_col_dark_red {
		color: #AA0000;
	}
	.minecraft_formatting_preview span.tl_col_dark_purple {
		color: #AA00AA;
	}
	.minecraft_formatting_preview span.tl_col_gold {
		color: #FFAA00;
	}
	.minecraft_formatting_preview span.tl_col_gray {
		color: #AAAAAA;
	}
	.minecraft_formatting_preview span.tl_col_dark_gray {
		color: #555555;
	}
	.minecraft_formatting_preview span.tl_col_blue {
		color: #5555FF;
	}
	.minecraft_formatting_preview span.tl_col_green {
		color: #55FF55;
	}
	.minecraft_formatting_preview span.tl_col_aqua {
		color: #55FFFF;
	}
	.minecraft_formatting_preview span.tl_col_red {
		color: #FF5555;
	}
	.minecraft_formatting_preview span.tl_col_light_purple {
		color: #FF55FF;
	}
	.minecraft_formatting_preview span.tl_col_yellow {
		color: #FFFF55;
	}
	.minecraft_formatting_preview span.tl_col_white {
		color: #FFF;
	}
	.minecraft_formatting_preview span.tl_col_minecoin {
		color: #DDD605;
	}
	
</style>