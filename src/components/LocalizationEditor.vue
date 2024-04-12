<template>
	<div id="localization_editor">
		<div id="properties_bar" v-if="language">
			<label>{{ language.id }}</label>
		</div>
		<div ref="editor_anchor" class="loc_editor_anchor" :class="{has_content: language.content.length > 0}"></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ToggleLeft, ToggleRight, User, Plus, Baseline, Globe, Braces, X } from 'lucide-vue-next'
import { LangFile } from '../scripts/lang_file'

import { lineNumbers, keymap, ViewUpdate } from '@codemirror/view'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import {EditorView, basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {tags} from "@lezer/highlight"
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'

const highlight_style = HighlightStyle.define([
	{tag: tags.brace, class: 'test'},
  {tag: tags.keyword, color: "#fc6"},
  {tag: tags.comment, color: "#f5d", fontStyle: "italic"}
])

export default {
	components: {
	},
	props: {
		language: LangFile,
	},
	watch: {
		language(lang) {
			if (lang) this.setupLangFile(lang)
		}
	},
	data() {
		return {
			editor: null
		}
	},
	methods: {
		setupLangFile(lang: LangFile) {
			let editor_state = EditorState.create({
				doc: lang.content,
				extensions: [
					EditorView.updateListener.of((v: ViewUpdate) => {
						if (v.docChanged) {
							lang.content = v.state.doc.toString();
						}
					}),
					oneDark,
					json(),
					lineNumbers(), 
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
		this.setupLangFile(this.language);
	}
}
</script>

<style scoped>


#localization_editor {
	height: 100%;
}
#localization_editor > #properties_bar {
	height: 44px;
}
#localization_editor > #properties_bar > label {
	display: inline-block;
	font-size: 23px;
	padding: 4px 8px;
}
#localization_editor textarea {
	height: calc(100% - 56px);
	border: none;
	border-top: 1px solid var(--color-border);
	border-bottom: 1px solid var(--color-border);
	background: no-repeat;
	width: 100%;
	padding: 4px 8px;
	font-size: 17px;
	background-color: var(--color-editor);
}

</style>
<style>
.loc_editor_anchor {
	height: calc(100% - 45px);
}
.loc_editor_anchor > * {
	height: 100%;
	overflow-y: scroll;
	overflow-y: auto;
}

</style>