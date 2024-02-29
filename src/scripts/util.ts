export function uuid(): string {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}


//JSON
export function compileJSON(object: object, options: {small?: boolean} = {}): string {
	function newLine(tabs) {
		if (options.small === true) {return '';}
		let s = '\n'
		for (let i = 0; i < tabs; i++) {
			s += '\t'
		}
		return s;
	}
	function handleVar(o, tabs) {
		var out = ''
		if (typeof o === 'string') {
			//String
			out += '"' + o.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r\n/g, '\\n').replace(/\t/g, '\\t') + '"'
		} else if (typeof o === 'boolean') {
			//Boolean
			out += (o ? 'true' : 'false')
		} else if (typeof o === 'number') {
			//Number
			o = (Math.round(o*100000)/100000).toString()
			out += o
		} else if (o === null || o === Infinity || o === -Infinity) {
			//Null
			out += 'null'
		} else if (typeof o === 'object' && o instanceof Array) {
			//Array
			var has_content = false
			out += '['
			for (var i = 0; i < o.length; i++) {
				var compiled = handleVar(o[i], tabs+1)
				if (compiled) {
					var breaks = typeof o[i] === 'object'
					if (has_content) {out += ',' + (breaks || options.small?'':' ')}
					if (breaks) {out += newLine(tabs)}
					out += compiled
					has_content = true
				}
			}
			if (typeof o[o.length-1] === 'object') {out += newLine(tabs-1)}
			out += ']'
		} else if (typeof o === 'object') {
			//Object
			var breaks = o.constructor.name !== 'oneLiner';
			var has_content = false
			out += '{'
			for (var key in o) {
				if (o.hasOwnProperty(key)) {
					var compiled = handleVar(o[key], tabs+1)
					if (compiled) {
						if (has_content) {out += ',' + (breaks || options.small?'':' ')}
						if (breaks) {out += newLine(tabs)}
						out += '"' + key + '":' + (options.small === true ? '' : ' ')
						out += compiled
						has_content = true
					}
				}
			}
			if (breaks && has_content) {out += newLine(tabs-1)}
			out += '}'
		}
		return out;
	}
	return handleVar(object, 1)
}

export function convertTouchEvent(event) {
	if (event && event.changedTouches && event.changedTouches.length && event.offsetX == undefined) {
		event.preventDefault();
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		event.offsetX = event.changedTouches[0].clientX;
		event.offsetY = event.changedTouches[0].clientY;

		let offset = calculateOffset(event.target);
		if (offset) {
			event.offsetX -= offset[0];
			event.offsetY -= offset[1];
		}
	}
	return event;
}

function calculateOffset(element) {
	var rect = element.getBoundingClientRect();
	return [
		rect.left + window.scrollX,
		rect.top + window.scrollY,
	]
}
function isFirefox(): boolean {
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

interface ImportOptions {
	extensions?: string[]
	multiple?: boolean
	readtype?: 'image' | 'buffer'
}

interface ExportOptions {
	name: string
	content: string
	extensions?: string[]
	custom_writer?: (content: any, name: string) => void
	savetype?: 'image'|'text'
}

export const IO = {
	import(options: ImportOptions, cb: (ImportResult) => void): void {
		if (typeof options !== 'object') {options = {}}
		let input = document.createElement('input');
		input.type = 'file';
		input.accept = options.extensions ? '.' + options.extensions.join(',.') : '';
		input.multiple = options.multiple === true;
		input.onchange = function(e) {
			if (!input.files) return;
			let results: {[key: string]: any} = [];
			let result_count = 0;
			let i = 0;
			while (i < input.files.length) {
				(function() {
					let file = input.files[i]
					let reader = new FileReader()
					let i2 = i+0;
					reader.onloadend = function() {
						if (!reader.result || !input.files) return;
						let result = reader.result
						results[i2] = {
							name: file.name,
							path: file.name,
							content: result
						}
						result_count++;
						if (result_count === input.files.length) {
							cb(results)
						}
					}
					if (options.readtype === 'image') {
						reader.readAsDataURL(file)
					} else if (options.readtype === 'buffer') {
						reader.readAsArrayBuffer(file)
					} else /*text*/ {
						reader.readAsText(file)
					}
					i++;
				})()
			}
		}
		input.click();
	},
	export(options: ExportOptions, cb?: () => void): void {
		if (!options) return;

		let file_name = options.name + (options.extensions ? '.'+options.extensions[0] : '')
		let callback_used;

		if (options.custom_writer) {
			options.custom_writer(options.content, file_name)
			
		} else if (options.savetype === 'image') {

			let element = document.createElement('a');
			element.href = options.content || '';
			element.download = file_name;
			element.style.display = 'none';
			if (isFirefox()) document.body.appendChild(element);
			element.click();
			if (isFirefox()) document.body.removeChild(element);

		} else {
			//let blob = new Blob([options.content], {type: "text/plain;charset=utf-8"});

			let element = document.createElement('a');
			element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(options.content);
			element.download = file_name
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);


			//saveAs(blob, file_name, {autoBOM: true})
		}
		if (!callback_used && typeof cb === 'function') {
			cb()
		}
	}
}
