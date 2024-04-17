<template>
	<dialog id="rawtext_editor" ref="dialog">
		<div class="editor_popup_bar">
			<X :size="20" @click="close()" />
		</div>
		<!--textarea
			v-if="text_field"
			v-model="text_field.json"
			@input="changeValue($event)"
		/-->
		<div ref="editor_anchor" class="rawtext_editor_anchor" :class="{has_content: text_field && text_field.json.length > 0}"></div>
		<p v-if="popup_error" class="json_error">{{ popup_error }}</p>
		<button @click="close()">Confirm</button>
	</dialog>
</template>

<script lang="ts">
import { X } from 'lucide-vue-next';
import { defineComponent } from 'vue';
import { TextField } from '../scripts/text_field';

import {EditorView} from "codemirror"
import { EditorState } from "@codemirror/state";
import { linter } from "@codemirror/lint";
import { gutter, lineNumbers, hoverTooltip, keymap, highlightActiveLineGutter, ViewUpdate } from "@codemirror/view";
import { json, jsonParseLinter, jsonLanguage } from "@codemirror/lang-json";
import { oneDarkHighlightStyle, oneDark } from "@codemirror/theme-one-dark";
import {
  syntaxHighlighting,
  indentOnInput,
  foldGutter,
} from "@codemirror/language";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";

import {
  jsonSchemaLinter,
  jsonSchemaHover,
  jsonCompletion,
  stateExtensions,
  handleRefresh,
} from "codemirror-json-schema";

const TranslationComponent: any = {
	type: "object",
	properties: {
		text: {
			type: "string",
			description: "Display text directly"
		},
		translate: {
			type: "string",
			description: "Enter a translation key to translate a passage"
		},
		with: {
			type: "array",
			description: "A list of raw JSON text component arguments to be inserted into slots in the translation text. Only works on translations. These will replace %1, %2, %3, etc. in the the translated text",
			items: {}
		},
		score: {
			type: "object",
			description: "Display a scoreboard value",
			properties: {
				name: {
					type: "string"
				},
				objective: {
					type: "string"
				}
			}
		},
		selector: {
			type: "string",
			description: "An entity selector. The name of the found entity or player is displayed. Multiple entities are supported and will be displayed as a list."
		}
	}
}
const TranslationComponentRoot = JSON.parse(JSON.stringify(TranslationComponent));
TranslationComponentRoot.properties.with.items = TranslationComponent;
const schema: any = {
	type: "object",
	properties: {
		rawtext: {
			type: "array",
			items: TranslationComponentRoot
		}
	},
};


export default defineComponent({
	components: {
		X
	},
	emits: ['save'],
	data() {
		interface Options {
			text_field: TextField | null
			popup_error: string
		}
		let data: Options = {
			text_field: null,
			popup_error: ''
		}
		return data;
	},
	methods: {
		open(text_field: TextField) {
			this.$refs.dialog.showModal();
			this.text_field = text_field;
			this.setupEditor(text_field);
		},
		close() {
			let error_before = !!this.popup_error;

			this.popup_error = '';
			try {
				JSON.parse(this.text_field.json);
			} catch (err) {
				this.popup_error = err.toString();
			}
			if (!this.popup_error) {
				this.$refs.dialog.close();
					this.text_field = null;

			} else if (error_before) {
				window.alert('Please fix all JSON issues before closing the Raw JSON editor!')
			}
		},
		setupEditor(field: TextField) {
			let editor_state = EditorState.create({
				doc: field.json,
				extensions: [
					json(),
					lineNumbers(),
					gutter({}),
					highlightActiveLineGutter(),
					closeBrackets(),
  					history(),
					linter(jsonParseLinter(), {
						delay: 800
					}),
					linter(jsonSchemaLinter(), {
						needsRefresh: handleRefresh,
					}),
					indentOnInput(),
  					autocompletion({closeOnBlur: false}),
					jsonLanguage.data.of({
						autocomplete: jsonCompletion(),
					}),
					foldGutter(),
					hoverTooltip(jsonSchemaHover()),
					stateExtensions(schema),
					keymap.of([
						...closeBracketsKeymap,
						...defaultKeymap,
						...historyKeymap,
						indentWithTab,
						...completionKeymap,
					]),
					
					oneDark,
					EditorView.lineWrapping,
					EditorState.tabSize.of(2),
					syntaxHighlighting(oneDarkHighlightStyle),

					EditorView.updateListener.of((v: ViewUpdate) => {
						if (v.docChanged) {
							field.json = v.state.doc.toString();
						}
					}),
				]
			});
			this.editor.setState(editor_state);
		}
	},
	mounted() {
		let editor = new EditorView({
			parent: this.$refs.editor_anchor,
		})
		this.editor = editor;
		if (this.text_field) this.setupEditor(this.text_field);
	}
})
</script>

<style scoped>

#rawtext_editor {
	width: 750px;
	height: 500px;
}
#rawtext_editor textarea {
	background-color: var(--color-editor);
	font-family: Consolas, monospace;
	padding: 4px 8px;
	font-size: 17px;
	color: inherit;
	background-color: var(--color-editor);
	height: calc(100% - 74px);
	width: 100%;
}
#rawtext_editor .json_error  {
	float: left;
	color: #e8475f;
}
.editor_popup_bar {
	text-align: right;
}
#rawtext_editor button {
	float: right
}
</style>

<style>
#rawtext_editor .rawtext_editor_anchor {
	height: calc(100% - 90px);
	border: 1px solid var(--color-border);
	margin-block: 12px;
}
#rawtext_editor .ͼ1 {
	height: 100%;
}
.ͼo .cm-tooltip {
	padding: 0 6px;
	color: var(--color-text);
	background-color: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: 4px;
}
.ͼo .cm-tooltip.cm-tooltip-autocomplete {
	padding: 4px 0;
}
.cm-tooltip-hover > * {
	color: var(--color-text);
}
.cm6-json-schema-hover--code {
	color: var(--color-subtle);
	font-family: monospace;
}
.ͼ1 .cm-completionIcon-property:after {
	content: '{}';
}
.ͼ1 .cm-tooltip.cm-tooltip-autocomplete > ul > li {
	padding: 2px 7px;
}
.ͼ3 .cm-tooltip-autocomplete ul li:hover {
	color: var(--color-highlight);
}
.ͼ3 .cm-tooltip-autocomplete ul li[aria-selected] {
	background-color: var(--color-selected);
	color: var(--color-highlight);
}
</style>